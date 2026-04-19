# Real-Time Multiplayer Quiz App Notes

## Project Summary

A real-time multiplayer quiz app built with Node.js, Express, and Socket.IO. Multiple users join the same room, receive synchronized questions, submit answers, and see a live leaderboard.

---

## Tech Stack

* Node.js runtime
* Express for HTTP server + static files
* Socket.IO for WebSocket-style realtime communication
* HTML/CSS/JavaScript frontend

---

## Folder Structure

```text
quiz-app/
├── server.js
└── public/
    └── index.html
```

---

## Core Concepts To Remember

### 1. Why Socket.IO?

Used for real-time bidirectional communication between browser and server.

Examples:

* Live chat
* Multiplayer games
* Notifications
* Collaborative editing
* Live dashboards

### 2. HTTP vs WebSocket

* HTTP = request/response, short-lived
* WebSocket = persistent connection, server can push updates anytime

### 3. Why Socket.IO over raw WebSocket?

* Easier API
* Auto reconnection
  n- Rooms support
* Broadcasting helpers
* Better browser compatibility

---

## Backend Flow (server.js)

### Create Server

```js
const app = express();
const server = http.createServer(app);
const io = new Server(server);
```

Reason: Socket.IO attaches to HTTP server.

### Serve Frontend

```js
app.use(express.static('public'));
```

Serves index.html.

### Connection Event

```js
io.on('connection', (socket) => {})
```

Runs whenever a user connects.

### Each User Gets Unique Socket ID

```js
socket.id
```

Used to identify players.

---

## Rooms Concept

```js
socket.join(roomId)
```

Users in same room can receive same quiz events.

Emit only to room:

```js
io.to(roomId).emit(...)
```

Use cases:

* Separate quiz groups
* Private chat rooms
* Multiplayer matches

---

## Data Structure

```js
rooms = {
  roomId: {
    players: [
      { id, username, score }
    ],
    currentQuestion: 0,
    answered: 0
  }
}
```

Remember:

* In-memory storage resets when server restarts.
* For production use DB/Redis.

---

## Main Events

### Client -> Server

* join-room
* start-quiz
* submit-answer

### Server -> Client

* players-update
* new-question
* quiz-ended

---

## Emit Methods

### Send to Current User Only

```js
socket.emit('event', data)
```

### Send to Everyone

```js
io.emit('event', data)
```

### Send to Specific Room

```js
io.to(roomId).emit('event', data)
```

### Send to Others Except Sender

```js
socket.broadcast.emit('event', data)
```

---

## Quiz Logic

1. Players join room
2. Start quiz
3. Server sends question
4. Players submit answers
5. Scores update
6. Next question starts
7. Final winner shown

---

## Frontend Notes (index.html)

### Connect Socket

```js
const socket = io();
```

### Listen for Events

```js
socket.on('new-question', data => {})
```

### Send Events

```js
socket.emit('submit-answer', payload)
```

### DOM Updates

Use JavaScript to update:

* question area
* answer buttons
* leaderboard
* status text

---

## Important Interview Points

### Why use WebSockets here?

Because all users need instant synchronized updates.

### Why rooms?

To isolate players into separate quiz sessions.

### Why server-side score logic?

More secure than trusting client score.

### Why in-memory object?

Simple for prototype/demo.

### How to scale?

* Use database for rooms/users
* Use Redis adapter for multiple servers
* Add authentication

---

## Common Bugs To Remember

### Duplicate submissions

Fix by storing answered users per round.

### Room not found

Check room exists before actions.

### User disconnects

Remove from players array.

### Everyone waiting forever

If user disconnects mid-round, adjust answered count.

---

## Easy Upgrades

* Countdown timer
* Host-only controls
* Randomized questions
* Categories
* Persistent scores
* Login system
* Deploy online
* Better UI
