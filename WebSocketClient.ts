const WS = require('ws');
const EventEmitter = require('events').EventEmitter;

export class WebSocketClient extends EventEmitter {
    connectInterval;
    private socket: WebSocket;

    constructor(private options) {
        super();
        this.socket = new WS(this.options);
        this.connect();
    }

    private connect() {
        this.socket.onopen = () => {
            this.emit('open');
        }
        this.socket.onerror = (ev) => {
            switch (ev.error.code) {
                case 'ECONNRESET':
                case 'ECONNREFUSED':
                    this.reconnect();
                    break;
            }
        }
    }

    private reconnect() {
        console.log('reconnecting...');
        this.connectInterval = setInterval(() => this.connect(), 5000);
        clearInterval(this.connectInterval);
    }

    public send(msg) {
        this.socket.send(msg);
    }

}