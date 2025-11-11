class CanvasManager {
  constructor(canvas, wsClient) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.wsClient = wsClient;
    this.history = [];
    this.cursors = new Map();                          // id -> { x, y, color }
    this.isDrawing = false;
    this.currentPath = [];
    this.tool = 'brush';
    this.color = '#000000';
    this.strokeWidth = 5;
    this.userColor = 'black';

    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.endDraw());
    this.canvas.addEventListener('mouseout', () => this.endDraw());

    // Throttle cursor updates
    let lastCursorTime = 0;
    this.canvas.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastCursorTime > 50) {
        this.wsClient.sendCursor({ x: e.offsetX, y: e.offsetY });
        lastCursorTime = now;
      }
    });
  }

  startDraw(e) {
    this.isDrawing = true;
    this.currentPath = [{ x: e.offsetX, y: e.offsetY }];
  }

  draw(e) {
    if (!this.isDrawing) return;
    const point = { x: e.offsetX, y: e.offsetY };
    this.currentPath.push(point);
    this.renderPath(this.currentPath, this.tool, this.color, this.strokeWidth);
  }

  endDraw() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    const operation = {
      type: this.tool,
      data: { path: this.currentPath, color: this.color, strokeWidth: this.strokeWidth },
      userId: this.wsClient.socket.id
    };
    this.wsClient.sendDraw(operation);
    this.history.push(operation);
    this.currentPath = [];
  }

  renderPath(path, tool, color, strokeWidth) {
    if (path.length < 2) return;
    this.ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      this.ctx.lineTo(path[i].x, path[i].y);
    }
    this.ctx.stroke();
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.history.forEach(op => {
      this.renderPath(op.data.path, op.type, op.data.color, op.data.strokeWidth);
    });
  }

  updateHistory(newHistory) {
    this.history = newHistory;
    this.redraw();
  }

  updateCursor(data) {
    this.cursors.set(data.id, { x: data.x, y: data.y, color: data.color || 'black' });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.redraw();
    // Draw cursors
    this.cursors.forEach(cursor => {
      this.ctx.fillStyle = cursor.color;
      this.ctx.beginPath();
      this.ctx.arc(cursor.x, cursor.y, 5, 0, 2 * Math.PI);
      this.ctx.fill();
    });
    requestAnimationFrame(() => this.animate());
  }

  setTool(tool) {
    this.tool = tool;
  }

  setColor(color) {
    this.color = color;
  }

  setStrokeWidth(width) {
    this.strokeWidth = width;
  }

  undo() {
    this.wsClient.sendUndo();
  }
}