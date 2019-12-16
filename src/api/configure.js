const express = require('express')
const fs = require('fs')
const path = require('path')
const routes = require('./routes')

// Create safes dir if doesn't exist
if(!fs.existsSync(path.join(__dirname, './') + 'safes/')) {
    fs.mkdirSync(path.join(__dirname, './') + 'safes/')
}

module.exports = app => {
    // Load middleware
    app.use(express.json())
    app.use('/api', routes)
}