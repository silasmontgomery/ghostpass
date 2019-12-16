const { resolve } = require('path')
const history = require('connect-history-api-fallback')
const express = require('express')
const configureApi = require('./configure')
const app = express()

const { port = 3000 } = process.env

// Configure API
configureApi(app);

// Configure UI
const publicPath = resolve(__dirname, '../../dist')
const staticConf = { maxAge: '1y', etag: false }

app.use(express.static(publicPath, staticConf))
app.use('/', history())

// Start server
app.listen(port, () => console.log(`Ghostpass listening on port ${port}!`))