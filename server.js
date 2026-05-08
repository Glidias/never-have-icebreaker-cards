const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const ACTIVITIES = [
  // ── 1. UNIVERSAL HUMAN MOMENTS (relatable regardless of personality) ──
  "forgotten someone's name immediately after meeting them",
  "forgotten why I walked into a room",
  "started a sentence and completely forgotten where it was going",
  "mispronounced a word I'd only ever read",
  "waved back at someone who wasn't waving at me",
  "laughed so hard I cried",
  "cried because I was tired, not sad",
  "rehearsed a conversation that never happened",
  "accidentally called a teacher or boss 'mum' or 'dad'",
  "talked to my pet like a fully grown adult",
  "fallen asleep in a movie theater",
  "been scared by my own reflection",
  "talked to myself out loud in public",
  "pressed the elevator button for a floor already lit",
  "walked into a glass door",
  "laughed at something inappropriate at the worst possible moment",
  "said 'you too' when a waiter said 'enjoy your meal'",
  "asked someone to repeat themselves three times and still didn't catch it",
  "had a full argument with someone entirely in my head",
  "opened the fridge multiple times hoping something new appeared",

  // ── 2. SOCIAL / EXTROVERT ──
  "danced in public without caring who was watching",
  "sung karaoke sober",
  "tried to high-five someone who didn't see it coming",
  "introduced myself to someone I'd already met",
  "made a friend in a completely unexpected place",
  "taken a selfie with a stranger",
  "made a speech or toast in front of a crowd",
  "struck up a conversation with a stranger that lasted more than an hour",
  "joined a club, team, or group activity as an adult",
  "performed in front of an audience",
  "thrown or organised a surprise for someone",
  "been the person who broke an awkward silence",
  "gone to an event alone and had a genuinely great time",
  "hosted a gathering or dinner for more than 8 people",
  "sung along loudly at a live concert",
  "convinced an entire group to do something spontaneous",
  "remembered everyone's name in a new group setting",
  "kept a friendship alive across very different life stages",

  // ── 3. INTROVERT / HOMEBODY ──
  "spent a full weekend alone and genuinely loved it",
  "reread a book already knowing the ending",
  "reorganised my space just because it felt satisfying",
  "preferred a quiet night in over a party with zero regret",
  "cancelled plans and felt immediate relief",
  "spent an entire day in pyjamas without leaving the house",
  "muted a group chat and felt instant peace",
  "spent hours in complete silence and found it calming",
  "chosen a longer walk just to have more time alone with my thoughts",
  "had a solo meal at a restaurant and genuinely enjoyed it",
  "taken a solo trip to a museum, gallery, or cinema",
  "deliberately switched my phone off for a full day",
  "found a quiet corner at a social event and stayed there contentedly",
  "planned an entire day with zero social commitments and followed through",
  "turned down a genuinely fun invitation because I needed the rest",
  "spent an evening doing nothing in particular and felt completely content",
  "recharged completely in solitude after a draining week",
  "felt more restored by being alone than by going out",

  // ── 4. CREATIVE & ARTISTIC ──
  "written a poem just for myself",
  "finished a creative project I actually started",
  "made something with my hands and given it as a gift",
  "learned an instrument and stuck with it beyond 3 months",
  "kept a sketchbook or journal consistently for more than a month",
  "written a story longer than 5 pages",
  "decorated or redesigned a room from scratch",
  "made up a song or melody on the spot",
  "taught myself a creative skill purely from online tutorials",
  "painted or drawn something I was genuinely proud of",
  "repurposed something old into something new",
  "made a playlist that perfectly captured a specific mood",
  "written lyrics to an existing song",
  "made something completely from scratch that others asked to buy or keep",
  "taken photos with deliberate composition in mind, not just snapshots",
  "performed or shared creative work in front of others",
  "collaborated on something creative with someone I'd just met",
  "spent hours on a detail most people would never notice",

  // ── 5. INTELLECTUAL & CURIOUS ──
  "read a book cover to cover in one sitting",
  "gone down a Wikipedia rabbit hole for more than 2 hours",
  "changed my mind on something important after reading about it",
  "watched a documentary and then researched the topic further",
  "learned a skill purely out of curiosity with no practical use",
  "debated an idea seriously with someone who disagreed with me",
  "read something that genuinely changed how I see the world",
  "stayed up late because I couldn't stop reading",
  "followed a news story closely enough to explain it clearly to others",
  "learned basic phrases in a new language just out of curiosity",
  "fact-checked something someone said mid-conversation and been right",
  "deep-dived into a niche topic and became the person everyone asks about it",
  "taken notes just for personal interest, not for school or work",
  "argued both sides of a debate just to understand it better",
  "recommended something that genuinely shifted someone else's perspective",
  "had a conversation about philosophy, ethics, or big ideas purely for fun",
  "memorised something long just because it interested me",
  "started learning something most people consider too complicated",

  // ── 6. ADVENTUROUS & PHYSICAL ──
  "hiked to a summit just to watch the sunrise",
  "slept under the stars with no tent",
  "visited a country where I didn't speak the language",
  "got lost in a foreign city and enjoyed it",
  "tried a food I couldn't identify and liked it",
  "gone swimming in open water",
  "travelled somewhere completely alone",
  "camped without electricity for more than a night",
  "completed a race or physical challenge I trained for",
  "tried a sport I was terrible at and kept going anyway",
  "woken up before 6am voluntarily to exercise",
  "pushed through something physical I thought I couldn't finish",
  "tried an extreme activity (skydiving, bungee, cliff jump, or similar)",
  "explored somewhere completely off the tourist trail",
  "eaten street food from a place that looked questionable and loved it",
  "cycled, run, or walked farther than I thought I could",
  "navigated somewhere new without using my phone",
  "done something I was genuinely scared of and felt proud afterwards",

  // ── 7. CARING & EMPATHETIC ──
  "volunteered for something without being asked or pressured",
  "anonymously done something kind for a stranger",
  "remembered a small detail about someone and surprised them with it",
  "written a genuine handwritten thank you note",
  "grown something from a seed successfully",
  "rescued or helped a stray animal",
  "sat with someone in silence just because they needed company",
  "genuinely forgiven someone without telling them",
  "checked in on someone out of the blue at exactly the right time",
  "donated something meaningful, not just things I no longer wanted",
  "stayed up late to support a friend through a hard night",
  "cooked a meal for someone going through a difficult time",
  "gone out of my way to make a newcomer feel welcome",
  "noticed someone was struggling before they said anything",
  "made time for someone even when I was genuinely stretched",
  "let someone else take the credit to protect their confidence",
  "talked a friend out of a bad decision by actually listening first",
  "remembered and acknowledged someone's difficult anniversary unprompted",

  // ── 8. AMBITIOUS & DRIVEN ──
  "stayed late on something I genuinely cared about finishing",
  "started a side project purely for fun with no monetisation plan",
  "taken a course or class just out of personal interest",
  "set a goal, wrote it down, and actually achieved it",
  "woken up early specifically to work on something personal",
  "pitched an idea to someone more senior and had it accepted",
  "turned a hobby into something others valued",
  "applied for something I didn't think I'd get",
  "kept going on a project after everyone else gave up",
  "said no to something good to make room for something better",
  "asked for feedback I knew might be harsh, and acted on it",
  "built or created something entirely from zero",
  "finished something I'd started years earlier",
  "learned something difficult enough that most people quit",
  "set a personal record I was genuinely proud of",
  "started over on something because I knew I could do it better",
  "made a decision based on growth rather than comfort",
  "tracked my own progress on something for more than a month",

  // ── 9. NOSTALGIC & SENTIMENTAL ──
  "rewatched a childhood favourite as an adult and still loved it",
  "kept something from childhood I still treasure today",
  "visited a place from my past just to remember it",
  "cried during an animated or family movie",
  "written a letter I never sent",
  "dug out old photos and spent the whole evening going through them",
  "reconnected with someone I hadn't spoken to in years",
  "found an old diary and spent time reading who I used to be",
  "kept letters, cards, or messages I'll probably never throw away",
  "celebrated a personal anniversary that no one else remembered",
  "listened to a song that immediately transported me to a specific memory",
  "held onto something broken because of what it represents",
  "described a childhood memory so vividly that others could picture it",
  "cried at a wedding, graduation, or meaningful ceremony",
  "kept in touch with someone from a completely different chapter of my life",
  "felt proud of a younger version of myself",
  "made a decision that honoured a promise I made long ago",
  "introduced someone to something from my childhood that I loved",

  // ── 10. QUIRKY & UNEXPECTED ──
  "named an inanimate object I own",
  "felt genuinely proud of something nobody else cared about",
  "talked to a plant or tree seriously",
  "laughed alone so hard I had to stop what I was doing",
  "eaten a bug",
  "danced in my kitchen or room when no one was watching",
  "given a nickname to a stranger I kept seeing",
  "had a strong opinion about something objectively trivial",
  "spent an unreasonable amount of time perfecting something most people wouldn't notice",
  "invented an elaborate backstory in my head for a stranger I saw",
  "been genuinely and unexpectedly moved by something in nature",
  "narrated my own actions out loud like a nature documentary",
  "convinced myself a song was written specifically about my life",
  "had a recurring dream so vivid I thought it was real",
  "developed an irrational but completely unshakeable preference",
  "memorised something completely useless and remained proud of it",
  "had a collection of something most people would find unusual",
  "made a major decision based entirely on gut feeling and been right"
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

    // Randomise turn order so join position gives no advantage
    shuffle(room.players);
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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🎮 NHIE Card Game running on http://localhost:${PORT}`));
