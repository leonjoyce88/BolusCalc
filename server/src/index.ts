import DexcomFetcher from "./dexcom"
import DexcomWebSocketServer from "./server"

const dexcomFetcher = new DexcomFetcher()
const dexcomWebSocketServer = new DexcomWebSocketServer(dexcomFetcher)

dexcomWebSocketServer.startWSS()
