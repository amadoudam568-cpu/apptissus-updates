const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

const CLOUD_USER = "admin_tissu";  
const CLOUD_PASS = "Pass2026!";    
const MONGO_URI = "mongodb+srv://amadoudam568_db_user:mByDycFfVVC6ma9F@cluster0.myuegss.mongodb.net/apptissu?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI).then(() => console.log("✅ MongoDB Atlas Connected"));

const schemas = { strict: false };
const Product = mongoose.model('Product', new mongoose.Schema({}, schemas));
const Sale = mongoose.model('Sale', new mongoose.Schema({}, schemas));
const Client = mongoose.model('Client', new mongoose.Schema({}, schemas));
const OnlineOrder = mongoose.model('OnlineOrder', new mongoose.Schema({}, schemas));

// 🛡️ AUTHENTIFICATION STANDARD (v7)
const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  const expectedAuth = "Basic " + Buffer.from(`${CLOUD_USER}:${CLOUD_PASS}`).toString('base64');
  
  if (auth === expectedAuth) return next();
  console.log("🚫 Accès refusé (Mauvais identifiants)");
  res.status(401).send('Unauthorized');
};

app.get('/health', checkAuth, (req, res) => res.status(200).send('OK'));

app.post('/sync/push', checkAuth, async (req, res) => {
  const data = req.body;
  try {
    if (data.products) for (let p of data.products) await Product.findOneAndUpdate({ name: p.name.trim() }, p, { upsert: true });
    if (data.sales) for (let s of data.sales) await Sale.findOneAndUpdate({ num: s.num }, s, { upsert: true });
    if (data.clients) for (let c of data.clients) await Client.findOneAndUpdate({ name: c.name.trim() }, c, { upsert: true });
    if (data.onlineOrders) {
      for (let o of data.onlineOrders) {
        const existing = await OnlineOrder.findOne({ orderNumber: o.orderNumber });
        if (!existing || o.updated > (existing.updated || 0)) {
          await OnlineOrder.findOneAndUpdate({ orderNumber: o.orderNumber }, o, { upsert: true });
        }
      }
    }
    res.status(200).json({ status: "Success" });
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/sync/pull', checkAuth, async (req, res) => {
  const results = {
    products: await Product.find(),
    sales: await Sale.find(),
    clients: await Client.find(),
    onlineOrders: await OnlineOrder.find()
  };
  res.json(results);
});

app.listen(port, () => console.log('🚀 Server v7 LIVE on port ' + port));