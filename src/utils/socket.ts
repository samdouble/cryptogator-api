import WebSocket, { WebSocketServer } from 'ws';

const routeSockets = wss => {
  /*
  io.on('connection', socket => {
    socket.on('disconnect', () => {
      //console.log('CLIENT DISCONNECTED');
    });
  });
  */
};

let wss: WebSocketServer | null = null;
export const initIoSocket = server => {
  wss = new WebSocketServer({
    server,
  });
  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
  });
  routeSockets(wss);
};

export const emitToAll = data => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

export default {
  emitToAll,
  initIoSocket,
};
