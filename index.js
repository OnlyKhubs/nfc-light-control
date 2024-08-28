const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/nfc-scan', async (req, res) => {
    const { userId } = req.body;

    if (userId === 'authorized_user_id') {
        try {
            // Invia una richiesta POST al webhook di Home Assistant per accendere la luce
            await axios.post('https://dipnoan-bee-5481.dataplicity.io/api/webhook/accendi_luce');
            res.status(200).send('Luce accesa');
        } catch (error) {
            console.error(error);
            res.status(500).send('Errore nell\'accensione della luce');
        }
    } else {
        res.status(403).send('Accesso negato');
    }
});

app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
