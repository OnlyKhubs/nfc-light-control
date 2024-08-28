const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const users = {
    'user1@example.com': { password: 'password1', group: 'owner' },
    'user2@example.com': { password: 'password2', group: 'cleaning' }
};

const groups = {
    owner: {
        schedule: { start: 0, end: 24 } // Accesso sempre consentito
    },
    cleaning: {
        schedule: { start: 7, end: 12 } // Accesso dalle 7:00 alle 12:00
    }
};

function isWithinSchedule(schedule) {
    const currentHour = new Date().getHours();
    return currentHour >= schedule.start && currentHour < schedule.end;
}

// Rotta per visualizzare la pagina di login
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

// Rotta per gestire il login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (users[email] && users[email].password === password) {
        const userGroup = users[email].group;

        if (isWithinSchedule(groups[userGroup].schedule)) {
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
            res.send(`
                <html>
                    <head>
                        <title>Accesso Negato</title>
                    </head>
                    <body>
                        <h1>Non è l'orario per accendere la luce.</h1>
                    </body>
                </html>
            `);
        }
    } else {
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
