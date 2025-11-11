document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const canvasManager = new CanvasManager(canvas, wsClient);
  
  document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    document.querySelectorAll('main, section').forEach(sec => sec.classList.add('hidden'));
    target.classList.remove('hidden');
  });
});

  // Toolbar bindings
  document.getElementById('brush').addEventListener('click', () => canvasManager.setTool('brush'));
  document.getElementById('eraser').addEventListener('click', () => canvasManager.setTool('eraser'));
  document.getElementById('colorPicker').addEventListener('input', (e) => canvasManager.setColor(e.target.value));
  document.getElementById('strokeWidth').addEventListener('input', (e) => canvasManager.setStrokeWidth(e.target.value));
  document.getElementById('undo').addEventListener('click', () => canvasManager.undo());

  // WebSocket handlers
  wsClient.onInit = (data) => {
    document.getElementById('loading').style.display = 'none';
    canvasManager.history = data.history;
    canvasManager.userColor = data.userColor;
    updateUsers(data.users);
  };
  wsClient.onDraw = (data) => {
    canvasManager.history.push(data);
  };
  wsClient.onCursor = (data) => {
    canvasManager.updateCursor(data);
  };
  wsClient.onUserUpdate = (users) => {
    updateUsers(users);
  };
  wsClient.onUpdateHistory = (history) => {
    canvasManager.updateHistory(history);
  };

  function updateUsers(users) {
    const usersDiv = document.getElementById('users');
    usersDiv.innerHTML = users.map(u => `<div style="width:20px;height:20px;background:${u.color};border-radius:50%;"></div>`).join('');
  }
});