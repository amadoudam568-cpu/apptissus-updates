const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

// Mémoire Globale Unique (La "Source de Vérité")
let masterStore = {
  categories: [],
  products: [],
  clients: [],
  suppliers: [],
  sales: [],
  transactions: [],
  lastSync: Date.now()
};

app.get('/health', (req, res) => res.status(200).send('OK'));

// PUSH : On remplace le Cloud par les dernières infos du téléphone le plus actif
app.post('/sync/push', (req, res) => {
  masterStore = { ...req.body, lastSync: Date.now() };
  console.log("Synchronisation miroir effectuée !");
  res.status(200).json({ status: "Success" });
});

// PULL : Tous les téléphones reçoivent cet état exact
app.get('/sync/pull', (req, res) => {
  res.json(masterStore);
});

app.listen(port, () => console.log('Serveur AppTissu CLOUD v4 prêt !'));