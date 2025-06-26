const { DexcomClient } = require('dexcom-share-api');
const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

let client = new DexcomClient({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    server: 'eu',
});
if (!client) {
    console.log("login failed")
}

const MinInMs = 60000

let currentData = null

app.get("/", (req, res) => {
    if (currentData == null || ((Date.now() - currentData[0].timestamp) / MinInMs) > 5) {
        client.getEstimatedGlucoseValues().then((data) => {
            console.log("fetched data")
            currentData = data[0]
            res.send(data[0])
        }
        )
    } else {
        console.log("sent cached data")
        res.send(currentData)
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("server listening on PORT:", PORT)
})
