

const WS = require('ws');
export class WebSocketClient {
    connectInterval;
    private socket: WebSocket;
    constructor(private options) {
        this.socket = new WS(this.options);
        this.connect();
    }
    connect() {
        this.socket.onopen = () => { }
        this.socket.onerror = () => {
            e => {
                switch (e.errno) {
                    case 'ECONNRESET':
                    case 'ECONNREFUSED':
                        this.reconnect();
                        break;
                }
            }
        }
    }
    reconnect() {
        this.connectInterval = setInterval(() => this.connect(), 5000);
        clearInterval(this.connectInterval);
    }

}