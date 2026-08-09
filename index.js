const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Augmentation de la limite pour accepter les photos (100 Mo)
app.use(express.json({ limit: '100mb' }));

let cloudProducts = {}; 
let cloudSales = {};

app.get('/health', (req, res) => res.status(200).send('OK'));

app.post('/sync/push', (req, res) => {
  const { products, sales } = req.body;
  if (products) {
    products.forEach(p => {
      const key = p.name.trim().toLowerCase();
      // On garde tout, y compris la photo
      cloudProducts[key] = { ...p, serverTime: Date.now() };
    });
  }
  if (sales) {
    sales.forEach(s => { cloudSales[s.num] = s; });
  }
  res.status(200).json({ status: "OK" });
});

app.get('/sync/pull', (req, res) => {
  res.json({
    products: Object.values(cloudProducts),
    sales: Object.values(cloudSales)
  });
});

app.listen(port, () => console.log('Serveur Miroir avec Photos prêt !'));