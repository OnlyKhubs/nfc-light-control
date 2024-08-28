const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let validTokens = {}; // Per memorizzare i token temporanei

// Database simulato di utenti con email, password e gruppo
const users = {
    'user1@example.com': { password: 'password1', group: 'owner' },
    'user2@example.com': { password: 'password2', group: 'cleaning' }
};

// Orari di accesso per ciascun gruppo
const groups = {
    owner: {
        schedule: { start: '00:00', end: '23:59' } // Accesso sempre consentito
    },
    cleaning: {
        schedule: { start: '07:00', end: '14:10' } // Accesso consentito dalle 07:00 alle 14:10
    }
};

// Genera un token per l'NFC e memorizzalo
app.get('/generate-token', (req, res) => {
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = moment().add(5, 'minutes').toISOString(); // Scade in 5 minuti
    validTokens[token] = expiresAt;
    res.send({ token });
});

// Funzione per verificare se l'orario corrente rientra nell'intervallo specificato
function isWithinSchedule(schedule) {
    const now = moment().tz('Europe/Rome');
    const currentTime = now.format('HH:mm');
    const startTime = moment.tz(`${now.format('YYYY-MM-DD')} ${schedule.start}`, 'YYYY-MM-DD HH:mm', 'Europe/Rome');
    const endTime = moment.tz(`${now.format('YYYY-MM-DD')} ${schedule.end}`, 'YYYY-MM-DD HH:mm', 'Europe/Rome');

    console.log(`Orario attuale: ${currentTime}`);
    console.log(`Orario consentito: ${schedule.start} - ${schedule.end}`);

    return now.isBetween(startTime, endTime, null, '[]');
}

// Funzione per verificare il token NFC
function isValidToken(token) {
    const now = moment();
    if (validTokens[token] && moment(validTokens[token]).isAfter(now)) {
        return true;
    }
    return false;
}

// Rotta per servire la pagina index.html come pagina iniziale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rotta per gestire il login e la logica di accensione della luce
app.post('/login', async (req, res) => {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password ? req.body.password.trim() : '';
    const token = req.body['nfc-token'];

    console.log(`Email ricevuta: ${email}`);
    console.log(`Password ricevuta: ${password}`);
    console.log(`Token ricevuto: ${token}`);

    if (!isValidToken(token)) {
        console.log('Token non valido o scaduto');
        res.send('Accesso non autorizzato.');
        return;
    }

    if (users[email] && users[email].password === password) {
        const userGroup = users[email].group;
        console.log(`Utente autenticato nel gruppo: ${userGroup}`);

        if (!isWithinSchedule(groups[userGroup].schedule)) {
            res.send('Non puoi accedere in questo momento.');
            return;
        }

        try {
            const response = await axios.post('https://dipnoan-bee-5481.dataplicity.io/api/webhook/accendi_luce');
            if (response.status === 200) {
                res.send('Luce accesa con successo!');
                delete validTokens[token]; // Rimuove il token dopo l'uso
            } else {
                throw new Error('Webhook failure');
            }
        } catch (error) {
            console.error('Errore durante la richiesta al webhook:', error.message);
            res.send('Errore nell\'accensione della luce. Riprova più tardi.');
        }
    } else {
        console.log('Credenziali non valide');
        res.send('Email o password non corretti.');
    }
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
