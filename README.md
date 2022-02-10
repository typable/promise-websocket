# socket
A promise-based WebSocket implementation

```javascript
const socket = new Socket('ws://localhost');
await socket.connect();

const packet = await socket.send({ command: 'echo', arguments: ['Hello World!'] });
console.log(packet.message); // Hello World!

for await (const packet of socket.listen({ command: 'record', arguments: ['kitten.mp4'] })) {
    const {status, size, time} = packet;
    console.log(`[${status}] ${size}MB ${time}s`); // [recording] 240MB 00:02:05s 
}
```
