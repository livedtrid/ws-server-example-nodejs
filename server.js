import WebSocket, { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const clients = new Map();
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    const id = randomUUID();
    clients.set(ws, id);
    console.log(`New connection assigned id: ${id}`);

	ws.on('message', (data) => {
		let message = data.toString('utf-8'); // Convert binary to string first

		try {
			const parsedMessage = JSON.parse(message); // Try parsing JSON
			console.log(`Received from ${clients.get(ws)}: ${parsedMessage.Message}`);
			serverBroadcast(message, ws);
		} catch (e) {
			console.error("Invalid JSON received:", message);
		}
	});


    ws.on('close', () => {
        console.log(`Connection closed (id = ${id})`);
        clients.delete(ws);
    });
});

function serverBroadcast(message, sender) {
    const senderId = clients.get(sender);

    // Parse JSON message
    let parsedMessage;
    try {
        parsedMessage = JSON.parse(message);
    } catch (e) {
        console.error("Invalid JSON received:", message);
        return;
    }

    wss.clients.forEach((client) => {
        const clientId = clients.get(client);
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            parsedMessage.SenderId = senderId; // Include senderId in message
            client.send(JSON.stringify(parsedMessage));
            console.log(`Forwarding message from ${senderId} to ${clientId}: ${parsedMessage.Message}`);
        }
    });
}


console.log('The server is running and waiting for connections');
