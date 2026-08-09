const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Base de données intelligente
let cloudProducts = {}; // On stocke par nom/code-barres pour fusionner
let cloudSales = {};

app.get('/health', (req, res) => res.status(200).send('OK'));

// PUSH : On fusionne au lieu de tout écraser
app.post('/sync/push', (req, res) => {
  const { products, sales } = req.body;
  const now = Date.now();

  // Fusion des produits : on garde toujours le plus récent ou la plus petite quantité (vente)
  if (products) {
    products.forEach(p => {
      const key = p.name.trim().toLowerCase();
      if (!cloudProducts[key] || p.qty < cloudProducts[key].qty) {
         cloudProducts[key] = { ...p, lastSync: now };
      }
    });
  }

  // Fusion des ventes
  if (sales) {
    sales.forEach(s => {
      cloudSales[s.num] = s;
    });
  }

  res.status(200).json({ status: "Synced" });
});

// PULL : On renvoie la base fusionnée
app.get('/sync/pull', (req, res) => {
  res.json({
    products: Object.values(cloudProducts),
    sales: Object.values(cloudSales)
  });
});

app.listen(port, () => console.log('Cerveau Intelligent en ligne !'));