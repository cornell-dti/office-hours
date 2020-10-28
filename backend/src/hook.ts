/* eslint-disable no-console */

import mongo from 'mongodb';
import http from 'http';
import ws from 'ws';

function getWSSPort(defaultPort: number) {
    const env = process.env.WSS_PORT;
    if (env) {
        return Number.parseInt(env, 10);
    }

    return defaultPort;
}

const server = http.createServer();

const wss = new ws.Server({ server });

const sockets = new Set();
const messageHandlers = new Map<string, (msg: Message) => Promise<void>>();
const rooms = new Map<string, Set<ws>>();

export interface Message {
    msgid: string;
}

function handleMessage(message: Message) {
    const result = messageHandlers.get(message.msgid)?.(message);

    if (result) {
        result.then(() => {
            // eslint-disable-next-line no-console
            console.log("Message handled!");
        }).catch(err => {
            // eslint-disable-next-line no-console
            console.error(err);
        });
    } else {
        console.error(`Unknown message: ${message?.msgid ?? 'unknown id'}`);
    }
}

function registerSocket(socket: ws) {
    socket.on('message', (data) => {
        if (typeof data === "string") {
            const message = JSON.parse(data);

            handleMessage(message as {msgid: string});
        } else {
            socket.send(JSON.stringify({
                msgid: 'invalidformat'
            }))
        }
    });

    sockets.add(socket);
}

wss.on('connection', socket => registerSocket(socket));

export function createHook<T, K = T>(collection: mongo.Collection, transformer: (doc: T) => K) {
    const changeStream = collection.watch<T>();

    changeStream.on('change', (change) => { 
        io.emit('changeData', transformer(change));
    }); 
}

export function start() {
    server.listen(getWSSPort(8181), () => {
    // eslint-disable-next-line no-console
        console.log("Started!");
    });
}