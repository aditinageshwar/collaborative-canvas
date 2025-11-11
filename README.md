# 🎨 Collaborative Canvas

A real-time multi-user drawing application built with JavaScript, HTML5 Canvas, and Node.js + Socket.io.

## Live Application

**Test it now:** [**https://collaborative-canvas-z91s.onrender.com**](https://collaborative-canvas-z91s.onrender.com)

## Setup Instructions

This guide sets up the application for local development.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/aditinageshwar/collaborative-canvas.git
    cd collaborative-canvas
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create Environment File:** Create a file named `.env` in the project root and define the port:
    ```
    PORT=5502
    ```
4.  **Start the server:**
    ```bash
    npm start
    ```
5.  **Access the App:** Open your browser to `http://localhost:5501`.

## How to Test with Multiple Users

- Open the app in several browser tabs.
- Each user gets a unique color.
- Draw simultaneously; changes sync in real-time.
- Move the mouse to see **remote user cursors**.
- Click "Undo" to undo the last global action.

## Known Limitations/Bugs

- **Redo:** No redo functionality.
- **Persistence:** Drawings are not persisted (lost on server restart).
- **Latency:** High latency may cause slight cursor lag.
- **Canvas:** Canvas size is fixed; no resizing.

## Time Spent

Approximately 8-10 hours (including planning, implementation, and testing).