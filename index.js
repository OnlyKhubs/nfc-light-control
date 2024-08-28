const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Rotta per la radice, mostra un messaggio di benvenuto
app.get('/', (req, res) => {
    res.send('Benvenuto nel server NFC Light Control!');
});

// Rotta per la pagina HTML per accendere la luce
app.get('/accendi-luce', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Accendi la Luce</title>
            </head>
            <body>
                <h1>Accendi la Luce</h1>
                <form action="/nfc-scan" method="POST">
                    <input type="hidden" name="userId" value="authorized_user_id" />
                    <button type="submit">Accendi la Luce</button>
                </form>
            </body>
        </html>
    `);
}); 

// Rotta POST per gestire l'accensione della luce tramite NFC
app.post('/nfc-scan', async (req, res) => {
    const { userId } = req.body;

    console.log(`Ricevuto userId: ${userId}`);

    if (userId === 'authorized_user_id') {
        try {
            console.log('Invio richiesta al webhook...');
            const response = await axios.post('https://dipnoan-bee-5481.dataplicity.io/api/webhook/accendi_luce');
            console.log('Risposta dal webhook:', response.status);
            res.status(200).send('Luce accesa');
        } catch (error) {
            console.error('Errore nell\'invio al webhook:', error.message);
            res.status(500).send('Errore nell\'accensione della luce');
        }
    } else {
        res.status(403).send('Accesso negato');
    }
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
