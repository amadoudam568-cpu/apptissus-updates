const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

let cloudProducts = {}; 
let cloudSales = {};

app.get('/health', (req, res) => res.status(200).send('OK'));

// PUSH : On enregistre les changements (Entrées ou Sorties)
app.post('/sync/push', (req, res) => {
  const { products, sales } = req.body;
  
  if (products) {
    products.forEach(p => {
      const key = p.name.trim().toLowerCase();
      // On accepte la nouvelle quantité, quelle qu'elle soit
      cloudProducts[key] = { ...p, serverTime: Date.now() };
    });
  }

  if (sales) {
    sales.forEach(s => {
      cloudSales[s.num] = s;
    });
  }

  res.status(200).json({ status: "OK" });
});

// PULL : On renvoie les données à l'autre téléphone
app.get('/sync/pull', (req, res) => {
  res.json({
    products: Object.values(cloudProducts),
    sales: Object.values(cloudSales)
  });
});

app.listen(port, () => console.log('Serveur Temps Réel prêt !'));