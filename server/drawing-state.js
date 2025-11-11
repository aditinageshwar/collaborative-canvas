class DrawingState {
  constructor() {
    this.history = [];                       // Array of operations: { id, userId, type, data }
    this.operationId = 0;
  }

  addOperation(operation) {
    operation.id = ++this.operationId;
    this.history.push(operation);
  }

  undo() {
    if (this.history.length > 0) {
      this.history.pop();
    }
  }

  getHistory() {
    return this.history;
  }
}

module.exports = { DrawingState };