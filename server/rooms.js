class UserManager {
  constructor() {
    this.users = new Map(); 
    this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    this.colorIndex = 0;
  }

  addUser(id) {
    const color = this.colors[this.colorIndex % this.colors.length];
    this.users.set(id, { color });
    this.colorIndex++;
  }

  removeUser(id) {
    this.users.delete(id);
  }

  getUsers() {
    return Array.from(this.users.entries()).map(([id, data]) => ({ id, ...data }));
  }

  getUserColor(id) {
    return this.users.get(id)?.color || 'black';
  }
}

const manageUsers = new UserManager();
module.exports = { manageUsers };