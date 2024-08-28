const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// Funzione per verificare se l'orario corrente rientra nell'intervallo specificato
function isWithinSchedule(schedule) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return currentTime >= schedule.start && currentTime <= schedule.end;
}

// Rotta per servire la pagina index.html come pagina iniziale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rotta per gestire il login e la logica di accensione della luce
app.post('/login', async (req, res) => {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password ? req.body.password.trim() : '';

    if (users[email] && users[email].password === password) {
        const userGroup = users[email].group;

        if (!isWithinSchedule(groups[userGroup].schedule)) {
            res.send('Non puoi accedere in questo momento.');
            return;
        }

        try {
            const response = await axios.post('https://dipnoan-bee-5481.dataplicity.io/api/webhook/accendi_luce');
            if (response.status === 200) {
                res.send('Luce accesa con successo!');
            } else {
                throw new Error('Webhook failure');
            }
        } catch (error) {
            console.error('Errore durante la richiesta al webhook:', error.message);
            res.send('Errore nell\'accensione della luce. Riprova più tardi.');
        }
    } else {
        res.send('Email o password non corretti.');
    }
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
