import WebSocket, { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const clients = new Map();
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    const id = randomUUID();
    clients.set(ws, id);
    console.log(`New connection assigned id: ${id}`);

    ws.on('message', (data) => {
        console.log(`Received from ${id}: ${data}`);
        serverBroadcast(data, ws); // Pass ws as sender, so it doesn't receive its own message
    });

    ws.on('close', () => {
        console.log(`Connection closed (id = ${id})`);
        clients.delete(ws);
    });
});

// Send a periodic message about the number of connected clients
setInterval(() => {
    console.log(`Number of connected clients: ${clients.size}`);
    serverBroadcast(`Number of connected clients: ${clients.size}`);
}, 15000);

function serverBroadcast(message, sender) {
    wss.clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log('The server is running and waiting for connections');
