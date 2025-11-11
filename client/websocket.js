class WebSocketClient {
  constructor() {
    this.socket = io();
    this.onInit = null;
    this.onDraw = null;
    this.onCursor = null;
    this.onUserUpdate = null;
    this.onUpdateHistory = null;

    this.socket.on('init', (data) => this.onInit?.(data));
    this.socket.on('draw', (data) => this.onDraw?.(data));
    this.socket.on('cursor', (data) => this.onCursor?.(data));
    this.socket.on('userUpdate', (data) => this.onUserUpdate?.(data));
    this.socket.on('updateHistory', (data) => this.onUpdateHistory?.(data));
  }

  sendDraw(data) {
    this.socket.emit('draw', data);
  }

  sendCursor(data) {
    this.socket.emit('cursor', data);
  }

  sendUndo() {
    this.socket.emit('undo');
  }
}

const wsClient = new WebSocketClient();