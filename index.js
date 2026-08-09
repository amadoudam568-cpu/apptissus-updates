const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

// Mémoire universelle de la boutique
let appTissuStore = {
  products: [],
  sales: [],
  clients: [],
  suppliers: [],
  transactions: [],
  movements: [],
  workshop: [],
  lastGlobalSync: Date.now()
};

app.get('/health', (req, res) => res.status(200).send('OK'));

// PUSH : Le téléphone envoie TOUT son état actuel
app.post('/sync/push', (req, res) => {
  const data = req.body;
  appTissuStore = { ...data, lastGlobalSync: Date.now() };
  console.log("Mise à jour Miroir réussie !");
  res.status(200).json({ status: "Success" });
});

// PULL : L'autre téléphone récupère TOUT l'état actuel
app.get('/sync/pull', (req, res) => {
  res.json(appTissuStore);
});

app.listen(port, () => console.log('Serveur Miroir Total en ligne !'));