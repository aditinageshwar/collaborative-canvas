# Architecture Overview

## Data Flow Diagram

1. User interacts with canvas (mousedown/mousemove/mouseup) → CanvasManager captures path → Sends to WebSocketClient → Server receives 'draw' event → Adds to DrawingState history → Broadcasts to all clients → Clients update local history and render.

2. Cursor movement → Throttled send to server → Broadcast to others → Render as circles on canvas.

3. Undo → Send to server → Server pops history → Broadcast updated history → All clients redraw from history.

## WebSocket Protocol

- `init`: Server sends { history, users, userColor } on connect.
- `draw`: Client sends { type, data: { path, color, strokeWidth }, userId } → Server broadcasts to others.
- `cursor`: Client sends { x, y } → Server broadcasts { id, x, y, color }.
- `undo`: Client sends → Server updates history → Broadcasts `updateHistory` with new history.
- `userUpdate`: Server broadcasts user list on join/leave.

## Undo/Redo Strategy

- Global history array on server: Each operation has an ID, userId, type, and data.
- Undo removes the last operation from history and broadcasts the updated history.
- Clients maintain local history and redraw the entire canvas on updates. This ensures consistency but is simple (not optimized for large histories).

## Performance Decisions

- Drawing paths: Store only key points (every mouse move), render with smooth lines using Canvas API.
- Real-time sync: Batch cursor updates (50ms throttle) and send drawing paths on mouseup to reduce network load.
- Redrawing: Use `requestAnimationFrame` for 60fps animation; clear and replay history on updates (efficient for <1000 operations).
- No libraries: Direct Canvas manipulation for control and performance.

## Conflict Resolution

- Drawing: No conflicts; overlapping is allowed and rendered as-is.
- Undo: Global last-action removal; if User A undoes User B's action, it's fine as it's shared state. Simultaneous undos are handled by server-side ordering.