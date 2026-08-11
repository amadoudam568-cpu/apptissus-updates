const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

// 🛡️ IDENTIFIANTS APP
const CLOUD_USER = "admin_tissu";  
const CLOUD_PASS = "Pass2026!";    

// 🌍 LIEN MONGODB
const MONGO_URI = "mongodb+srv://amadoudam568_db_user:mByDycFfVVC6ma9F@cluster0.myuegss.mongodb.net/apptissu?retryWrites=true&w=majority";

console.log("Démarrage du serveur...");

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ CONNECTÉ À MONGODB ATLAS"))
  .catch(err => console.error("❌ ERREUR MONGODB :", err.message));

const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
const Sale = mongoose.model('Sale', new mongoose.Schema({}, { strict: false }));

const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  const expectedAuth = Buffer.from(`${CLOUD_USER}:${CLOUD_PASS}`).toString('base64');
  if (auth === expectedAuth) return next();
  console.log("🚫 Tentative d'accès refusée (Mauvais Login/Pass)");
  res.status(401).send('Accès refusé');
};

app.get('/health', checkAuth, (req, res) => res.status(200).send('OK'));

app.post('/sync/push', checkAuth, async (req, res) => {
  const { products, sales } = req.body;
  console.log(`📩 Réception de ${products?.length || 0} produits et ${sales?.length || 0} ventes`);
  try {
    if (products && products.length > 0) {
      for (let p of products) {
        await Product.findOneAndUpdate({ name: p.name.trim() }, p, { upsert: true });
      }
      console.log("💾 Produits sauvegardés dans MongoDB");
    }
    if (sales && sales.length > 0) {
      for (let s of sales) {
        await Sale.findOneAndUpdate({ num: s.num }, s, { upsert: true });
      }
      console.log("💾 Ventes sauvegardées dans MongoDB");
    }
    res.status(200).json({ status: "Success" });
  } catch (err) {
    console.error("❌ Erreur d'écriture :", err.message);
    res.status(500).send(err.message);
  }
});

app.get('/sync/pull', checkAuth, async (req, res) => {
  const products = await Product.find();
  const sales = await Sale.find();
  res.json({ products, sales });
});

app.listen(port, () => console.log('🚀 Serveur en ligne sur le port ' + port));