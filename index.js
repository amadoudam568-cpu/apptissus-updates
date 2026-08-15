const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

const CLOUD_USER = "admin_tissu";  
const CLOUD_PASS = "Pass2026!";    
const MONGO_URI = "mongodb+srv://amadoudam568_db_user:mByDycFfVVC6ma9F@cluster0.myuegss.mongodb.net/apptissu?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI).then(() => console.log("✅ Miroir Pro v10 - Sync Totale"));

const schemas = { strict: false };
const Product = mongoose.model('Product', new mongoose.Schema({}, schemas));
const Sale = mongoose.model('Sale', new mongoose.Schema({}, schemas));
const Client = mongoose.model('Client', new mongoose.Schema({}, schemas));
const OnlineOrder = mongoose.model('OnlineOrder', new mongoose.Schema({}, schemas));
const OnlineOrderItem = mongoose.model('OnlineOrderItem', new mongoose.Schema({}, schemas));

const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth === "Basic " + Buffer.from(`${CLOUD_USER}:${CLOUD_PASS}`).toString('base64')) return next();
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
        await OnlineOrder.findOneAndUpdate({ orderNumber: o.orderNumber }, o, { upsert: true });
      }
    }
    // NOUVEAU v10 : Sauvegarde des articles
    if (data.onlineOrderItems) {
      for (let oi of data.onlineOrderItems) {
        await OnlineOrderItem.findOneAndUpdate({ orderNumber: oi.orderNumber, productName: oi.productName }, oi, { upsert: true });
      }
    }
    
    res.status(200).json({ status: "Synced" });
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/sync/pull', checkAuth, async (req, res) => {
  try {
    const results = {
      products: await Product.find().limit(500),
      sales: await Sale.find().sort({date: -1}).limit(100),
      clients: await Client.find(),
      onlineOrders: await OnlineOrder.find().sort({date: -1}).limit(50),
      onlineOrderItems: await OnlineOrderItem.find().limit(200) // ON ENVOIE ENFIN LES ARTICLES !
    };
    res.json(results);
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(port, () => console.log('🚀 Server v10 ready'));