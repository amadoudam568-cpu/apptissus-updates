const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100mb' }));

const CLOUD_USER = "admin_tissu";  
const CLOUD_PASS = "Pass2026!";    
const MONGO_URI = "mongodb+srv://amadoudam568_db_user:mByDycFfVVC6ma9F@cluster0.myuegss.mongodb.net/apptissu?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI).then(() => console.log("🚀 Miroir Turbo v14 Ready"));

const schemas = { strict: false };
const Product = mongoose.model('Product', new mongoose.Schema({}, schemas));
const Sale = mongoose.model('Sale', new mongoose.Schema({}, schemas));
const Client = mongoose.model('Client', new mongoose.Schema({}, schemas));
const OnlineOrder = mongoose.model('OnlineOrder', new mongoose.Schema({}, schemas));
const OnlineOrderItem = mongoose.model('OnlineOrderItem', new mongoose.Schema({}, schemas));
const Workshop = mongoose.model('Workshop', new mongoose.Schema({}, schemas));
const Lookbook = mongoose.model('Lookbook', new mongoose.Schema({}, schemas));

const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth === "Basic " + Buffer.from(`${CLOUD_USER}:${CLOUD_PASS}`).toString('base64')) return next();
  res.status(401).send('Unauthorized');
};

// ⚡ FONCTION TURBO : ENREGISTREMENT GROUPÉ
async function bulkUpsert(model, data, filterKey) {
  if (!data || data.length === 0) return;
  const ops = data.map(item => ({
    updateOne: {
      filter: { [filterKey]: item[filterKey] },
      update: { $set: item },
      upsert: true
    }
  }));
  await model.bulkWrite(ops);
}

app.post('/sync/push', checkAuth, async (req, res) => {
  const d = req.body;
  try {
    // On enregistre tout en mode "Turbo"
    await Promise.all([
      bulkUpsert(Product, d.products, 'name'),
      bulkUpsert(Sale, d.sales, 'num'),
      bulkUpsert(Client, d.clients, 'name'),
      bulkUpsert(OnlineOrder, d.onlineOrders, 'orderNumber'),
      bulkUpsert(OnlineOrderItem, d.onlineOrderItems, 'productName'),
      bulkUpsert(Workshop, d.workshop, 'num'),
      bulkUpsert(Lookbook, d.lookbook, 'date')
    ]);
    res.status(200).json({ status: "Turbo Synced" });
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/sync/pull', checkAuth, async (req, res) => {
  try {
    const [products, sales, clients, onlineOrders, onlineOrderItems, workshop, lookbook] = await Promise.all([
      Product.find().limit(500),
      Sale.find().sort({date: -1}).limit(50),
      Client.find(),
      OnlineOrder.find().sort({date: -1}).limit(30),
      OnlineOrderItem.find().limit(100),
      Workshop.find().limit(50),
      Lookbook.find().limit(20)
    ]);
    res.json({ products, sales, clients, onlineOrders, onlineOrderItems, workshop, lookbook });
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(port, () => console.log('🚀 Server v14 running on ' + port));