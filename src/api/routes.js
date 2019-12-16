const express = require('express')
const fs = require('fs')
const path = require('path')
const cryptojs = require('crypto-js')
const router = express.Router()
const words = fs.readFileSync(path.join(__dirname, './assets') + '/seedwords', { encoding: 'utf8' }).split('\n')

// Create routes
router.get('/', (req, res) => res.send('Ghostpass API'))

// Update safe
router.put('/safe/:uid', (req, res) => {
    fs.writeFileSync('safes/' + req.params.uid, req.body.safe, 'utf8')

    res.json({ result: 'Safe saved successfully.' })
})

// Get safe
router.get('/safe/:uid', (req, res) => {
    if(fs.existsSync('safes/' + req.params.uid)) {
        let safe = fs.readFileSync('safes/' + req.params.uid, 'utf8')
        let response = {
            uid: req.params.uid,
            safe: safe
        }
        res.json(response)    
    } else {
        res.status(404).json({ error: "Safe doesn't exist" });
    }
})

// Create safe
router.post('/safe', (req, res) => {
    let seed_words = null;
    let seed = null;
    let uid = null;

    do {
        seed_words = [
            words[Math.floor(Math.random() * (words.length-1))],
            words[Math.floor(Math.random() * (words.length-1))],
            words[Math.floor(Math.random() * (words.length-1))],
            words[Math.floor(Math.random() * (words.length-1))],
            words[Math.floor(Math.random() * (words.length-1))],
            words[Math.floor(Math.random() * (words.length-1))]
        ]
        seed = seed_words.join(' ')
        uid = cryptojs.MD5(seed).toString(cryptojs.enc.Hex)
    }
    while(fs.existsSync('safes/' + uid))
    
    let response = {
        seed: seed,
        uid: uid
    }
    res.json(response)
})

// Get existing uid from seed
router.get('/uid', (req, res) => {
    if(!req.query.seed || !Array.isArray(req.query.seed) || req.query.seed.length < 6) {
        res.status(400).json({ error: 'Seed words required.'} )
    }
    let uid = cryptojs.MD5(req.query.seed.join(' ')).toString(cryptojs.enc.Hex)
    if(!fs.existsSync('safes/' + uid)) {
        res.status(404).json({ error: 'Safe not found.' })
    }
    res.json({ uid: uid })
})

module.exports = router