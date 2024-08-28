const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Benvenuto nel server NFC Light Control!');
});

app.post('/nfc-scan', async (req, res) => {
    const { userId } = req.body;

    console.log(`Ricevuto userId: ${userId}`);  // Aggiunto per debug

    if (userId === 'authorized_user_id') {
        try {
            console.log('Invio richiesta al webhook...');
            const response = await axios.post('https://dipnoan-bee-5481.dataplicity.io/api/webhook/accendi_luce');
            console.log('Risposta dal webhook:', response.status);  // Aggiunto per debug
            res.status(200).send('Luce accesa');
        } catch (error) {
            console.error('Errore nell\'invio al webhook:', error.message);
            res.status(500).send('Errore nell\'accensione della luce');
        }
    } else {
        res.status(403).send('Accesso negato');
    }
});

app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
