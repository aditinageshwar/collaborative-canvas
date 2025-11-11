# Collaborative Canvas

A real-time multi-user drawing application built with JavaScript, HTML5 Canvas, and Node.js + Socket.io.

## Setup Instructions

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open `http://localhost:5502` in multiple browser tabs/windows to simulate multiple users.

## How to Test with Multiple Users

- Open the app in several browser tabs.
- Each user gets a unique color.
- Draw simultaneously; changes sync in real-time.
- Move the mouse to see cursors.
- Click "Undo" to undo the last global action.

## Known Limitations/Bugs

- No redo functionality.
- Drawings are not persisted (lost on server restart).
- High latency may cause slight cursor lag.
- Canvas size is fixed; no resizing.
- Undo may cause brief redraw flashes.

## Time Spent

Approximately 8-10 hours (including planning, implementation, and testing).