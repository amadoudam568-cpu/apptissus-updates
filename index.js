const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

let cloudProducts = {}; 
let cloudSales = {};

app.get('/health', (req, res) => res.status(200).send('OK'));

app.post('/sync/push', (req, res) => {
  const { products, sales } = req.body;
  if (products) {
    products.forEach(p => {
      const key = p.name.trim().toLowerCase();
      // On ne met à jour que si la donnée reçue est plus récente ou contient une photo
      if (!cloudProducts[key] || p.updated > cloudProducts[key].updated || p.photo) {
        cloudProducts[key] = { ...p, serverTime: Date.now() };
      }
    });
  }
  if (sales) {
    sales.forEach(s => { cloudSales[s.num] = s; });
  }
  res.status(200).json({ status: "Synced" });
});

app.get('/sync/pull', (req, res) => {
  res.json({
    products: Object.values(cloudProducts),
    sales: Object.values(cloudSales)
  });
});

app.listen(port, () => console.log('Serveur AppTissu Temps Réel v2 prêt !'));