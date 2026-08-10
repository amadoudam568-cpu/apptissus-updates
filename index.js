const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

// Mémoire Universelle (Miroir)
let storeData = {
  products: {},
  sales: {},
  saleItems: {},
  clients: {},
  suppliers: {},
  transactions: {},
  movements: {},
  lastSync: Date.now()
};

app.get('/health', (req, res) => res.status(200).send('OK'));

// PUSH & MERGE : On fusionne les données reçues avec celles du Cloud
app.post('/sync/push', (req, res) => {
  const data = req.body;
  const now = Date.now();

  // Fusion intelligente par ID ou Nom
  const merge = (cloud, local, key) => {
    if (!local) return;
    local.forEach(item => {
      const id = item[key];
      if (!cloud[id] || (item.updated && item.updated > cloud[id].updated)) {
        cloud[id] = item;
      }
    });
  };

  merge(storeData.products, data.products, 'name');
  merge(storeData.sales, data.sales, 'num');
  merge(storeData.clients, data.clients, 'name');
  merge(storeData.suppliers, data.suppliers, 'name');
  merge(storeData.transactions, data.transactions, 'id');
  
  storeData.lastSync = now;
  res.status(200).json({ status: "Synced" });
});

// PULL : Le téléphone récupère TOUT l'univers de la boutique
app.get('/sync/pull', (req, res) => {
  res.json({
    products: Object.values(storeData.products),
    sales: Object.values(storeData.sales),
    clients: Object.values(storeData.clients),
    suppliers: Object.values(storeData.suppliers),
    transactions: Object.values(storeData.transactions)
  });
});

app.listen(port, () => console.log('Serveur Miroir Total v3 en ligne !'));