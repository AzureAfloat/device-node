import { OPEN } from "ws";
const WS = require('ws');
const EventEmitter = require('events').EventEmitter;

export class WebSocketClient extends EventEmitter {
    connectInterval;
    private socket: WebSocket;

    constructor(private options) {
        super();
        this.connect();
    }

    private connect() {
        this.socket = new WS(this.options);
        this.socket.onopen = () => {
            this.emit('open');
            clearInterval(this.connectInterval);
        }
        this.socket.onerror = (ev: any) => {
            if (ev.error.code == 'ECONNRESET' || ev.error.code == 'ECONNREFUSED') this.reconnect();
        }
        this.socket.onclose = () => {
            this.emit('close');
            this.reconnect();
        }
    }

    private reconnect() {
        clearInterval(this.connectInterval);
        this.connectInterval = setInterval(() => this.connect(), 5000);
    }

    public send(msg) {
        if (WS.readyState != OPEN) this.reconnect();
        this.socket.send(msg);
        return this.socket;
    }
}