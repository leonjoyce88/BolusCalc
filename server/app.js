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

let currentData = null

app.get("/status", (req, res) => {
    if (currentData == null || (currentData && ((Date.now() - currentData[0].timestamp) / 60000) > 5)) {
        client.getEstimatedGlucoseValues().then((data) => {
            currentData = data
            console.log('fetch')
            console.log(currentData[0])
            console.log((Date.now() - currentData[0].timestamp) / 60000)
            res.send(data)
        }
        )
    } else {
        res.send(currentData)
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("server listening on PORT:", PORT)
})
