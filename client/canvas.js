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
    this.startX = 0;
    this.startY = 0;
    this.imageToPlace = null;
    this.bindEvents();
    this.animate();
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', (e) => this.endDraw(e));
    this.canvas.addEventListener('mouseout', (e) => this.endDraw(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));

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
    if (this.tool === 'brush' || this.tool === 'eraser') {
      this.isDrawing = true;
      this.currentPath = [{ x: e.offsetX, y: e.offsetY }];
    } else if (['rectangle', 'circle', 'line'].includes(this.tool)) {
      this.isDrawing = true;
      this.startX = e.offsetX;
      this.startY = e.offsetY;
    }
  }

  draw(e) {
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    if (this.tool === 'brush' || this.tool === 'eraser') 
    {
      if (!this.isDrawing) return;
      const point = { x: currentX, y: currentY };
      this.currentPath.push(point);
      this.renderPath(this.currentPath, this.tool, this.color, this.strokeWidth);
    } 
    else if (['rectangle', 'circle', 'line'].includes(this.tool)) 
    {
      this.redraw();
      this.renderShape(this.startX, this.startY, currentX, currentY, this.tool, this.color, this.strokeWidth, true);
    }
  }

  endDraw(e) {
    if (this.tool === 'brush' || this.tool === 'eraser') {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        const operation = {
          type: this.tool,
          data: { 
            path: this.currentPath, 
            color: this.color, 
            strokeWidth: this.strokeWidth, 
          },
          userId: this.wsClient.socket.id
        };
        this.wsClient.sendDraw(operation);
        this.history.push(operation);
        this.currentPath = [];
    } else if (['rectangle', 'circle', 'line'].includes(this.tool)) {
       this.isDrawing = false;
        const operation = {
            type: this.tool,
            data: {
              startX: this.startX,
              startY: this.startY,
              endX: e.offsetX, 
              endY: e.offsetY, 
              color: this.color,
              strokeWidth: this.strokeWidth
            },
            userId: this.wsClient.socket.id
        };
        this.wsClient.sendDraw(operation);
        this.history.push(operation);
    } 
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

  handleClick(e) {
    if (this.tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const operation = {
          type: 'text',
          data: { x: e.offsetX, y: e.offsetY, text, color: this.color, fontSize: this.strokeWidth * 5 },
          userId: this.wsClient.socket.id
        };
        this.wsClient.sendDraw(operation);
        this.history.push(operation);
      }
    } else if (this.tool === 'image' && this.imageToPlace) {
      console.log('Placing image at:', e.offsetX, e.offsetY);
      const operation = {
        type: 'image',
        data: { x: e.offsetX, y: e.offsetY, image: this.imageToPlace },
        userId: this.wsClient.socket.id
      };
      this.wsClient.sendDraw(operation); 
      this.imageToPlace = null;
  }
}
  
  renderShape(startX, startY, endX, endY, type, color, strokeWidth, preview = false) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    if (type === 'rectangle') {
      this.ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    } else if (type === 'circle') {
      const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      this.ctx.beginPath();
      this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      this.ctx.stroke();
    } else if (type === 'line') {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.history.forEach(op => {
      if (op.type === 'brush' || op.type === 'eraser') {
        this.renderPath(op.data.path, op.type, op.data.color, op.data.strokeWidth);
      } else if (['rectangle', 'circle', 'line'].includes(op.type)) {
        this.renderShape(op.data.startX, op.data.startY, op.data.endX, op.data.endY, op.type, op.data.color, op.data.strokeWidth);
      } else if (op.type === 'text') {
        this.ctx.fillStyle = op.data.color;
        this.ctx.font = `${op.data.fontSize}px Arial`;
        this.ctx.fillText(op.data.text, op.data.x, op.data.y);
      } else if (op.type === 'image') {
        if (op.imageObject && op.imageObject.complete) {
          this.ctx.drawImage(op.imageObject, op.data.x, op.data.y, 50, 50);
        }    
        else if (!op.imageObject){
          const img = new Image();
          img.onload = () => {
              this.redraw(); 
          };
                
          img.onerror = () => console.error('Image redraw failed for:', op.data.image ? op.data.image.substring(0, 30) + '...' : 'Unknown image');
          img.src = op.data.image;
          op.imageObject = img;
        }
      }
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
    document.querySelectorAll('#toolbar button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tool)?.classList.add('active');
  }
 
  loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageToPlace = e.target.result;
      alert('Image loaded! Click on the canvas to place it.');
    };
    reader.readAsDataURL(file);
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