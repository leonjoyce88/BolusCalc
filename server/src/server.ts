import { WebSocketServer } from 'ws';
import DexcomFetcher from './dexcom';


const corsOrigin = process.env.ALLOWED_ORIGIN
if (!corsOrigin) {
    console.error("must provide cors origin")
    process.exit(1)
}

class DexcomWebSocketServer {
    private wss: WebSocketServer
    private fetcher: DexcomFetcher;

    constructor(fetcher: DexcomFetcher) {
        this.wss = new WebSocketServer({ port: 8080 });
        this.fetcher = fetcher
    }

    broadcast(data: any) {
        const msg = JSON.stringify(data)
        for (const client of this.wss.clients) {
            if (client.readyState === client.OPEN) {
                client.send(msg)
            }
        }
    }
    startWSS() {
        console.log(process.env.ALLOWED_ORIGIN)
        this.wss.on("connection", (ws, req) => {
            const origin = req.headers.origin;
            console.log(origin)

            if (origin !== process.env.ALLOWED_ORIGIN
            ) {
                console.warn(`[WS] Blocked connection from origin: ${origin}`);
                ws.close(1008, "Unauthorized"); // 1008 = Policy Violation
                return;
            }

            console.log("[server]WebSocket client connected")

            if (this.fetcher.cachedReading) {
                ws.send(JSON.stringify(this.fetcher.cachedReading))
            }

            // if first client, kick off loop
            if (this.wss.clients.size === 1) {
                this.fetcher.startLoop()
            }

            this.fetcher.on("update", (reading) => {
                this.broadcast(reading);
                console.log("[server]broadcast reading")
            })

            ws.on("close", () => {
                console.log("[server]WebSocket client disconnected")
                if (this.wss.clients.size === 0) {
                    this.fetcher.stopLoop()
                }
            })
        })
    }
}

export default DexcomWebSocketServer;
