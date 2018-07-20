const WS = require('ws');
const EventEmitter = require('events').EventEmitter;
export class WebSocketClient extends EventEmitter {
    connectInterval;
    private socket: WebSocket;
    constructor(private options) {
        super();
        this.connect();
        this.close();
    }
    private connect() {
        this.socket = new WS(this.options);
        this.socket.onopen = () => {
            this.emit('open');
            clearInterval(this.connectInterval);
            console.log('Websocket is open');
        }
        this.socket.onerror = (ev: any) => {
            switch (ev.error.code) {
                case 'ECONNRESET':
                    this.reconnect();
                    break;
                case 'ECONNREFUSED':
                    this.reconnect();
                    break;
            }
        }
    }
    private close() {
        this.socket.onclose = () => {
            this.emit('close');
            console.log('Websocket is closed reestablishing connection..');
            this.reconnect();
        }
    }
    private reconnect() {
        clearInterval(this.connectInterval);
        this.connectInterval = setInterval(() => {
            console.log('reconnecting...');
            this.connect();
        }, 5000);
    }
    public send(msg) {
        if (WS.readyState != WS.OPEN)
            this.close();
        this.socket.send(msg);
        return this.socket;
    }
}