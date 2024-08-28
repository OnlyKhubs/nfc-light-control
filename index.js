const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Rotta GET per accendere la luce automaticamente quando si accede al sito
app.get('/', async (req, res) => {
    try {
        console.log('Invio richiesta al webhook...');
        const response = await axios.post('https://dipnoan-bee-5481.dataplicity.io/api/webhook/accendi_luce');
        console.log('Risposta dal webhook:', response.status);
        res.send(`
            <html>
                <head>
                    <title>Luce Accesa</title>
                </head>
                <body>
                    <h1>La luce è stata accesa!</h1>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Errore nell\'invio al webhook:', error.message);
        res.status(500).send('Errore nell\'accensione della luce');
    }
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
