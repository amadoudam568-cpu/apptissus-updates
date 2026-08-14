const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

const CLOUD_USER = "admin_tissu";  
const CLOUD_PASS = "Pass2026!";    
const MONGO_URI = "mongodb+srv://amadoudam568_db_user:mByDycFfVVC6ma9F@cluster0.myuegss.mongodb.net/apptissu?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI).then(() => console.log("✅ MongoDB Cloud Pro ready"));

const schemas = { strict: false };
const Product = mongoose.model('Product', new mongoose.Schema({}, schemas));
const Sale = mongoose.model('Sale', new mongoose.Schema({}, schemas));
const Client = mongoose.model('Client', new mongoose.Schema({}, schemas));
const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, schemas));
const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, schemas));
const Category = mongoose.model('Category', new mongoose.Schema({}, schemas));
const OnlineOrder = mongoose.model('OnlineOrder', new mongoose.Schema({}, schemas));
const OnlineOrderItem = mongoose.model('OnlineOrderItem', new mongoose.Schema({}, schemas));

const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth === Buffer.from(`${CLOUD_USER}:${CLOUD_PASS}`).toString('base64')) return next();
  res.status(401).send('Unauthorized');
};

app.post('/sync/push', checkAuth, async (req, res) => {
  const data = req.body;
  try {
    if (data.products) for (let p of data.products) await Product.findOneAndUpdate({ name: p.name.trim() }, p, { upsert: true });
    if (data.sales) for (let s of data.sales) await Sale.findOneAndUpdate({ num: s.num }, s, { upsert: true });
    if (data.clients) for (let c of data.clients) await Client.findOneAndUpdate({ name: c.name.trim() }, c, { upsert: true });
    
    // Priorité aux commandes les plus récentes (v6)
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
    onlineOrders: await OnlineOrder.find(),
    transactions: await Transaction.find(),
    suppliers: await Supplier.find(),
    categories: await Category.find()
  };
  res.json(results);
});

app.listen(port, () => console.log('🚀 Server v6 is LIVE'));