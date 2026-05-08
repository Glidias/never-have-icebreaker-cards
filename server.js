const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const ACTIVITIES = [
  "lied about my age online", "eaten a bug", "broken a bone", "cried during a Disney movie",
  "ghosted someone", "stayed up past 3 AM gaming", "pretended to know a celebrity",
  "sent a text to the wrong person", "eaten food off the floor", "danced in public",
  "forgotten a friend's birthday", "cheated on a test", "lied about being sick",
  "used a fake name online", "accidentally liked an old photo", "talked to my pet like a human",
  "eaten an entire pizza alone", "fallen asleep in a movie theater", "worn clothes inside out",
  "lied on my resume", "stole a pen", "pretended to laugh at a joke I didn't get",
  "replied to the wrong group chat", "used 'reply all' unnecessarily", "googled my own name",
  "cried in a bathroom", "eaten dessert before dinner", "lied about having plans",
  "watched a whole show in one day", "forgotten someone's name immediately after meeting them",
  "accidentally called a teacher 'mom'", "used a coupon at the wrong store", "eaten cold pizza",
  "pretended to be on the phone", "lied about reading a book", "worn mismatched shoes",
  "eaten something out of the trash (jokingly)", "forgotten why I walked into a room",
  "used an emoji wrong", "lied about my height", "pretended to understand a meme",
  "eaten cereal without milk", "watched a movie while scrolling", "lied about my location",
  "forgotten a password immediately after resetting it", "eaten a meal in under 5 minutes"
];

const ROOMS = {};
const RESPONSE_TIME = 12000;

// Fisher-Yates shuffle — unbiased
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Guarantee no collision with an existing room ID
function generateRoomId() {
  let id;
  do {
    id = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (ROOMS[id]);
  return id;
}

function createRoom(id, hostId) {
  ROOMS[id] = {
    id,
    hostId,
    players: [],
    deck: shuffle([...ACTIVITIES, ...ACTIVITIES]),
    discard: [],
    currentPlayerIndex: 0,
    phase: 'lobby',
    currentCard: null,
    responses: {},
    timer: null
  };
}

// Each player only receives their own hand — others see handCount only
function getRoomState(roomId, forPlayerId) {
  const room = ROOMS[roomId];
  return {
    id: room.id,
    phase: room.phase,
    hostId: room.hostId,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      handCount: p.hand.length,
      hasReplaced: p.hasReplaced,
      hand: p.id === forPlayerId ? p.hand : undefined
    })),
    currentPlayerId: room.players[room.currentPlayerIndex]?.id,
    currentCard: room.currentCard,
    deckCount: room.deck.length,
    discardCount: room.discard.length
  };
}

// Emit personalised state to every player in a room
function emitToRoom(roomId, event, getData) {
  const room = ROOMS[roomId];
  if (!room) return;
  room.players.forEach(p => io.to(p.id).emit(event, getData(p.id)));
}

function resolveTurn(roomId) {
  const room = ROOMS[roomId];
  if (!room) return;
  if (room.timer) { clearTimeout(room.timer); room.timer = null; }

  const activePlayerId = room.players[room.currentPlayerIndex]?.id;

  // Players who said "I have" draw a penalty card
  room.players.forEach(p => {
    if (p.id !== activePlayerId && room.responses[p.id] === true) {
      if (room.deck.length === 0) { room.deck = shuffle(room.discard); room.discard = []; }
      if (room.deck.length > 0) p.hand.push(room.deck.pop());
    }
  });

  if (room.currentCard) { room.discard.push(room.currentCard); room.currentCard = null; }

  const winner = room.players.find(p => p.hand.length === 0);
  if (winner) {
    room.phase = 'ended';
    emitToRoom(roomId, 'gameEnded', pid => ({ winnerId: winner.id, roomState: getRoomState(roomId, pid) }));
    return;
  }

  room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
  room.players.forEach(p => p.hasReplaced = false);
  room.phase = 'playing';
  emitToRoom(roomId, 'turnResolved', pid => getRoomState(roomId, pid));
}

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('createRoom', (playerName) => {
    if (!playerName || typeof playerName !== 'string') return;
    const roomId = generateRoomId();
    createRoom(roomId, socket.id);
    socket.join(roomId);
    currentRoom = roomId;
    ROOMS[roomId].players.push({ id: socket.id, name: playerName.trim().substring(0, 15), hand: [], hasReplaced: false });
    emitToRoom(roomId, 'roomUpdate', pid => getRoomState(roomId, pid));
    socket.emit('joined', { roomId, playerId: socket.id, isHost: true });
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    if (!ROOMS[roomId] || ROOMS[roomId].phase !== 'lobby') {
      return socket.emit('error', 'Room not found or already started');
    }
    if (ROOMS[roomId].players.length >= 12) {
      return socket.emit('error', 'Room is full');
    }
    if (!playerName || typeof playerName !== 'string') return;
    socket.join(roomId);
    currentRoom = roomId;
    ROOMS[roomId].players.push({ id: socket.id, name: playerName.trim().substring(0, 15), hand: [], hasReplaced: false });
    emitToRoom(roomId, 'roomUpdate', pid => getRoomState(roomId, pid));
    socket.emit('joined', { roomId, playerId: socket.id, isHost: false });
  });

  socket.on('startGame', () => {
    if (!currentRoom || !ROOMS[currentRoom]) return;
    const room = ROOMS[currentRoom];
    // Only the host can start, minimum 2 players, only from lobby
    if (room.hostId !== socket.id || room.players.length < 2 || room.phase !== 'lobby') return;

    room.players.forEach(p => p.hand = []);
    room.players.forEach(p => { for (let i = 0; i < 5; i++) p.hand.push(room.deck.pop()); });
    room.phase = 'playing';
    room.currentPlayerIndex = 0;
    emitToRoom(currentRoom, 'gameStarted', pid => getRoomState(currentRoom, pid));
  });

  socket.on('playCard', (cardText) => {
    if (!currentRoom || !ROOMS[currentRoom]) return;
    const room = ROOMS[currentRoom];
    const player = room.players.find(p => p.id === socket.id);
    if (!player || room.players[room.currentPlayerIndex]?.id !== socket.id || room.phase !== 'playing') return;

    // Use indexOf + splice to remove exactly one instance (handles duplicate cards)
    const cardIndex = player.hand.indexOf(cardText);
    if (cardIndex === -1) return;
    player.hand.splice(cardIndex, 1);

    room.currentCard = cardText;
    room.phase = 'responding';
    room.responses = {};
    emitToRoom(currentRoom, 'cardPlayed', pid => ({ card: cardText, roomState: getRoomState(currentRoom, pid) }));
    room.timer = setTimeout(() => resolveTurn(currentRoom), RESPONSE_TIME);
  });

  socket.on('respond', (hasDoneIt) => {
    if (!currentRoom || !ROOMS[currentRoom]) return;
    const room = ROOMS[currentRoom];
    if (room.phase !== 'responding') return;

    const activePlayerId = room.players[room.currentPlayerIndex]?.id;
    if (socket.id === activePlayerId) return; // active player cannot respond

    room.responses[socket.id] = hasDoneIt;
    const others = room.players.filter(p => p.id !== activePlayerId);
    const allResponded = others.every(p => p.id in room.responses);
    io.to(currentRoom).emit('responseRecorded', { playerId: socket.id, hasDoneIt, allResponded });
    if (allResponded) resolveTurn(currentRoom);
  });

  socket.on('replaceCard', (cardText) => {
    if (!currentRoom || !ROOMS[currentRoom]) return;
    const room = ROOMS[currentRoom];
    const player = room.players.find(p => p.id === socket.id);
    if (!player || room.players[room.currentPlayerIndex]?.id !== socket.id || room.phase !== 'playing' || player.hasReplaced) return;

    // Replace the specified card; fall back to last card if none specified
    const cardIndex = (cardText && typeof cardText === 'string')
      ? player.hand.indexOf(cardText)
      : player.hand.length - 1;
    if (cardIndex === -1 || player.hand.length === 0) return;

    if (room.deck.length === 0) { room.deck = shuffle(room.discard); room.discard = []; }
    if (room.deck.length === 0) return;

    const newCard = room.deck.pop();
    const [oldCard] = player.hand.splice(cardIndex, 1);
    player.hand.push(newCard);
    room.discard.push(oldCard);
    player.hasReplaced = true;
    emitToRoom(currentRoom, 'cardReplaced', pid => ({ roomState: getRoomState(currentRoom, pid) }));
  });

  socket.on('disconnect', () => {
    if (!currentRoom || !ROOMS[currentRoom]) return;
    const room = ROOMS[currentRoom];
    const leavingIndex = room.players.findIndex(p => p.id === socket.id);
    if (leavingIndex === -1) return;

    room.players.splice(leavingIndex, 1);

    if (room.players.length === 0) {
      if (room.timer) clearTimeout(room.timer);
      delete ROOMS[currentRoom];
      return;
    }

    // Transfer host to next player if host left
    if (room.hostId === socket.id) room.hostId = room.players[0].id;

    // Keep currentPlayerIndex valid after removal
    if (room.phase === 'playing' || room.phase === 'responding') {
      if (leavingIndex < room.currentPlayerIndex) {
        room.currentPlayerIndex--;
      } else if (leavingIndex === room.currentPlayerIndex) {
        // Clamp to new array length
        room.currentPlayerIndex = room.currentPlayerIndex % room.players.length;
        // If the active player left mid-response phase, check if everyone remaining has answered
        if (room.phase === 'responding') {
          const newActiveId = room.players[room.currentPlayerIndex]?.id;
          const others = room.players.filter(p => p.id !== newActiveId);
          if (others.length === 0 || others.every(p => p.id in room.responses)) {
            resolveTurn(currentRoom);
            return;
          }
        }
      }
    }

    emitToRoom(currentRoom, 'roomUpdate', pid => getRoomState(currentRoom, pid));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🎮 NHIE Card Game running on http://localhost:${PORT}`));
