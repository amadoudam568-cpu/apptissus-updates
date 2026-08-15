const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

const CLOUD_USER = "admin_tissu";  
const CLOUD_PASS = "Pass2026!";    
const MONGO_URI = "mongodb+srv://amadoudam568_db_user:mByDycFfVVC6ma9F@cluster0.myuegss.mongodb.net/apptissu?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI).then(() => console.log("✅ Miroir Cloud v8 Actif"));

const schemas = { strict: false };
const Product = mongoose.model('Product', new mongoose.Schema({}, schemas));
const Sale = mongoose.model('Sale', new mongoose.Schema({}, schemas));
const Client = mongoose.model('Client', new mongoose.Schema({}, schemas));
const OnlineOrder = mongoose.model('OnlineOrder', new mongoose.Schema({}, schemas));
const OnlineOrderItem = mongoose.model('OnlineOrderItem', new mongoose.Schema({}, schemas));
const Workshop = mongoose.model('Workshop', new mongoose.Schema({}, schemas));

// 🛡️ SÉCURITÉ RENFORCÉE v8
const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  const expectedAuth = "Basic " + Buffer.from(`${CLOUD_USER}:${CLOUD_PASS}`).toString('base64');
  if (auth === expectedAuth) return next();
  res.status(401).send('Access Denied');
};

app.get('/health', checkAuth, (req, res) => res.status(200).send('OK'));

app.post('/sync/push', checkAuth, async (req, res) => {
  const data = req.body;
  try {
    // Synchronisation Intelligente (Upsert)
    if (data.products) for (let p of data.products) await Product.findOneAndUpdate({ name: p.name.trim() }, p, { upsert: true });
    if (data.sales) for (let s of data.sales) await Sale.findOneAndUpdate({ num: s.num }, s, { upsert: true });
    if (data.clients) for (let c of data.clients) await Client.findOneAndUpdate({ name: c.name.trim() }, c, { upsert: true });
    if (data.workshop) for (let w of data.workshop) await Workshop.findOneAndUpdate({ num: w.num }, w, { upsert: true });
    
    if (data.onlineOrders) {
      for (let o of data.onlineOrders) {
        const existing = await OnlineOrder.findOne({ orderNumber: o.orderNumber });
        if (!existing || o.updated > (existing.updated || 0)) {
          await OnlineOrder.findOneAndUpdate({ orderNumber: o.orderNumber }, o, { upsert: true });
        }
      }
    }
    
    if (data.onlineOrderItems) {
      for (let oi of data.onlineOrderItems) {
        await OnlineOrderItem.findOneAndUpdate({ orderNumber: oi.orderNumber, productName: oi.productName }, oi, { upsert: true });
      }
    }
    
    res.status(200).json({ status: "Universal Sync Success" });
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/sync/pull', checkAuth, async (req, res) => {
  try {
    const results = {
      products: await Product.find(),
      sales: await Sale.find(),
      clients: await Client.find(),
      onlineOrders: await OnlineOrder.find(),
      onlineOrderItems: await OnlineOrderItem.find(),
      workshop: await Workshop.find()
    };
    res.json(results);
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(port, () => console.log('🚀 Server v8 ready'));