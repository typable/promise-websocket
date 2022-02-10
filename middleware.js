export function middleware(socket, fn) {
    return async (event) => {
        const {hash, data} = JSON.parse(event.data);
        const conn = {
            hash,
            data,
            send: function(data, done = true) {
                socket.send(JSON.stringify({hash, data, done }));
            }
        };
        await fn(conn);
    };
}
