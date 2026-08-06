const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// IMPORTANT : C'est cette ligne qui fait passer le voyant au VERT
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('Serveur AppTissu prêt !');
});

app.listen(port, () => {
  console.log('Serveur en ligne sur le port ' + port);
});