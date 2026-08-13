const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

const CLOUD_USER = "admin_tissu";  
const CLOUD_PASS = "Pass2026!";    
const MONGO_URI = "mongodb+srv://amadoudam568_db_user:mByDycFfVVC6ma9F@cluster0.myuegss.mongodb.net/apptissu?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI).then(() => console.log("✅ MongoDB Atlas Connected"));

// MODÈLES
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
const Sale = mongoose.model('Sale', new mongoose.Schema({}, { strict: false }));
const Client = mongoose.model('Client', new mongoose.Schema({}, { strict: false }));
const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));
const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
const OnlineOrder = mongoose.model('OnlineOrder', new mongoose.Schema({}, { strict: false }));
const OnlineOrderItem = mongoose.model('OnlineOrderItem', new mongoose.Schema({}, { strict: false }));

const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth === Buffer.from(`${CLOUD_USER}:${CLOUD_PASS}`).toString('base64')) return next();
  res.status(401).send('Unauthorized');
};

app.get('/health', checkAuth, (req, res) => res.status(200).send('OK'));

app.post('/sync/push', checkAuth, async (req, res) => {
  const { products, sales, clients, transactions, suppliers, categories, onlineOrders, onlineOrderItems } = req.body;
  try {
    if (products) for (let p of products) await Product.findOneAndUpdate({ name: p.name.trim() }, p, { upsert: true });
    if (sales) for (let s of sales) await Sale.findOneAndUpdate({ num: s.num }, s, { upsert: true });
    if (clients) for (let c of clients) await Client.findOneAndUpdate({ name: c.name.trim() }, c, { upsert: true });
    if (transactions) for (let t of transactions) await Transaction.findOneAndUpdate({ desc: t.desc, date: t.date }, t, { upsert: true });
    if (suppliers) for (let s of suppliers) await Supplier.findOneAndUpdate({ name: s.name.trim() }, s, { upsert: true });
    if (categories) for (let c of categories) await Category.findOneAndUpdate({ name: c.name.trim() }, c, { upsert: true });
    
    // Commandes en ligne
    if (onlineOrders) for (let o of onlineOrders) await OnlineOrder.findOneAndUpdate({ orderNumber: o.orderNumber }, o, { upsert: true });
    if (onlineOrderItems) {
      for (let oi of onlineOrderItems) {
        await OnlineOrderItem.findOneAndUpdate({ orderNumber: oi.orderNumber, productName: oi.productName }, oi, { upsert: true });
      }
    }
    res.status(200).json({ status: "Success" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/sync/pull', checkAuth, async (req, res) => {
  try {
    const products = await Product.find();
    const sales = await Sale.find();
    const clients = await Client.find();
    const transactions = await Transaction.find();
    const suppliers = await Supplier.find();
    const categories = await Category.find();
    const onlineOrders = await OnlineOrder.find();
    const onlineOrderItems = await OnlineOrderItem.find();
    res.json({ products, sales, clients, transactions, suppliers, categories, onlineOrders, onlineOrderItems });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => console.log('🚀 Server v5 ready'));