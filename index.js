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
        schedule: { start: 0, end: 24 } // Accesso sempre consentito
    },
    cleaning: {
        schedule: { start: 7, end: 12 } // Accesso consentito dalle 7:00 alle 12:00
    }
};

// Funzione per verificare se l'orario corrente rientra nell'intervallo specificato
function isWithinSchedule(schedule) {
    const currentHour = new Date().getHours();
    return currentHour >= schedule.start && currentHour < schedule.end;
}

// Rotta per servire la pagina index.html come pagina iniziale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rotta per gestire il login e la logica di accensione della luce
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (users[email] && users[email].password === password) {
        const userGroup = users[email].group;

        if (!isWithinSchedule(groups[userGroup].schedule)) {
            // Notifica che l'accesso è vietato a causa dell'orario
            res.send(`
                <html>
                    <head>
                        <title>Accesso Negato</title>
                    </head>
                    <body>
                        <h1>Non puoi accedere in questo momento. Gli orari consentiti per il tuo gruppo sono dalle ${groups[userGroup].schedule.start}:00 alle ${groups[userGroup].schedule.end}:00.</h1>
                    </body>
                </html>
            `);
            return;
        }

        // Se l'orario è valido, tenta di accendere la luce
        try {
            const response = await axios.post('https://dipnoan-bee-5481.dataplicity.io/api/webhook/accendi_luce');
            res.send(`
                <html>
                    <head>
                        <title>Luce Accesa</title>
                    </head>
                    <body>
                        <h1>Luce accesa con successo!</h1>
                    </body>
                </html>
            `);
        } catch (error) {
            res.status(500).send(`
                <html>
                    <head>
                        <title>Errore</title>
                    </head>
                    <body>
                        <h1>Errore nell'accensione della luce. Riprova più tardi.</h1>
                    </body>
                </html>
            `);
        }
    } else {
        // Notifica che le credenziali sono errate
        res.status(403).send(`
            <html>
                <head>
                    <title>Accesso Negato</title>
                </head>
                <body>
                    <h1>Email o password non corretti.</h1>
                </body>
            </html>
        `);
    }
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
