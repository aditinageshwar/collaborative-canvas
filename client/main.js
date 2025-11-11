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

  document.getElementById('rectangle').addEventListener('click', () => canvasManager.setTool('rectangle'));
  document.getElementById('circle').addEventListener('click', () => canvasManager.setTool('circle'));
  document.getElementById('line').addEventListener('click', () => canvasManager.setTool('line'));
  document.getElementById('text').addEventListener('click', () => canvasManager.setTool('text'));
  
  document.getElementById('image').addEventListener('click', () => {
    canvasManager.setTool('image');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => canvasManager.loadImage(e.target.files[0]);
    input.click();
  });

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