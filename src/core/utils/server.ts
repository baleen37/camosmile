import * as http from 'http';
import { Socket } from 'net';

export const enableDestory = (server: http.Server) => {
    const connections: { [key: string]: Socket } = {};

    server.on('connection', (conn) => {
        const key = conn.remoteAddress + ':' + conn.remotePort;
        connections[key] = conn;
        conn.on('close', () => {
            delete connections[key];
        });
    });

    server.on('close', () => {
        for (const key of Object.keys(connections)) {
            connections[key].destroy();
        }
    });
};
