const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

// 🛡️ --- SÉCURITÉ ACCÈS APPLICATION ---
const CLOUD_USER = "admin_tissu";  
const CLOUD_PASS = "Pass2026!";    

// 🌍 --- CONNEXION COFFRE-FORT DONNÉES (MONGODB) ---
const MONGO_URI = "mongodb+srv://amadoudam568_db_user:mByDycFfVVC6ma9F@cluster0.myuegss.mongodb.net/apptissu?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connecté au coffre-fort MongoDB Atlas !"))
  .catch(err => console.error("❌ Erreur de connexion MongoDB :", err));

// DÉFINITION DES MODÈLES (Structure des données)
const ProductSchema = new mongoose.Schema({ name: String, qty: Number, price: Number, category: String, updated: Number, photo: String }, { strict: false });
const SaleSchema = new mongoose.Schema({ num: String, total: Number, date: Number }, { strict: false });
const Product = mongoose.model('Product', ProductSchema);
const Sale = mongoose.model('Sale', SaleSchema);

// Fonction de vérification de l'identité (Auth)
const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  const expectedAuth = Buffer.from(`${CLOUD_USER}:${CLOUD_PASS}`).toString('base64');
  if (auth === expectedAuth) return next();
  res.status(401).send('Accès refusé');
};

// --- ROUTES ---

app.get('/health', checkAuth, (req, res) => res.status(200).send('OK'));

// PUSH : Enregistrer les changements dans le coffre-fort
app.post('/sync/push', checkAuth, async (req, res) => {
  const { products, sales } = req.body;
  try {
    if (products) {
      for (let p of products) {
        await Product.findOneAndUpdate({ name: p.name.trim() }, p, { upsert: true });
      }
    }
    if (sales) {
      for (let s of sales) {
        await Sale.findOneAndUpdate({ num: s.num }, s, { upsert: true });
      }
    }
    res.status(200).json({ status: "Synced to Atlas" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PULL : Récupérer tout le coffre-fort
app.get('/sync/pull', checkAuth, async (req, res) => {
  try {
    const products = await Product.find();
    const sales = await Sale.find();
    res.json({ products, sales });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/', (req, res) => res.send('<h1>Serveur AppTissu CLOUD PRO</h1><p>Base de données MongoDB Active.</p>'));

app.listen(port, () => console.log('Serveur Pro MongoDB en ligne !'));