export class Socket {

    constructor(url) {
        this.conn = null;
        this.url = url;
        this.queue = {};
    }

    connect() {
        if(this.conn !== null && this.conn.readyState !== WebSocket.CLOSED) {
            throw 'Unable to connect! Connection already established.';
        }
        this.conn = null;
        return new Promise((resolve, reject) => {
            this.conn = new WebSocket(this.url);
            this.conn.onopen = () => resolve();
            this.conn.onerror = (error) => reject(error);
            this.conn.onmessage = (event) => {
                try {
                    const {hash, data, done = true } = JSON.parse(event.data);
                    if(!this.queue[hash]) {
                        throw 'Packet dropped! No hash detected or not listed.';
                    }
                    const {resolve} = this.queue[hash];
                    resolve({ value: data, done });
                    delete this.queue[hash];
                }
                catch(error) {
                    console.log(error);
                }
            }
            this.conn.onclose = () => {
                for(const {reject} of Object.values(this.queue)) {
                    reject();
                }
            }
        });
    }

    send(data) {
        const hash = Math.random().toString(36).substring(2);
        this.conn.send(JSON.stringify({ hash, data }));
        return new Promise(async (resolve, reject) => {
            const {value, done} = await new Promise((resolve, reject) => {
                try {
                    this.queue[hash] = { resolve, reject };
                }
                catch(error) {
                    reject(error);
                }
            });
            if(done !== true) {
                reject('Expected only one packet! [done: false]');
            }
            resolve(value);
        });
    }

    listen(data) {
        const hash = Math.random().toString(36).substring(2);
        const self = this;
        this.conn.send(JSON.stringify({ hash, data }));
        return {
            [Symbol.asyncIterator]() {
                return {
                    done: false,
                    async next() {
                        if(this.done) {
                            return { done: true };
                        }
                        const {value, done} = await new Promise((resolve, reject) => {
                            try {
                                self.queue[hash] = { resolve, reject };
                            }
                            catch(error) {
                                reject(error);
                            }
                        });
                        if(done) {
                            this.done = true;
                        }
                        return { value, done: false };
                    }
                }
            }
        }
    }

}
