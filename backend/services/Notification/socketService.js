let io;

const init = (socketIoInstance) => {
  io = socketIoInstance;
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`[Socket.io] Client ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  return io;
};

const emitNewTransaction = (transaction) => {
  if (io) {
    io.emit('new_transaction', transaction);
  }
};

const emitAlert = (alert) => {
  if (io) {
    io.emit('new_alert', alert);
  }
};

module.exports = {
  init,
  getIO,
  emitNewTransaction,
  emitAlert
};
