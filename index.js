const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Permet de lire les gros volumes de données (tissus, ventes, etc.)
app.use(express.json({ limit: '50mb' }));

// Mémoire temporaire pour stocker vos données de boutique
let cloudDatabase = {
  products: [],
  sales: [],
  clients: [],
  lastUpdated: Date.now()
};

// 1. Vérification de santé (pour le voyant VERT)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 2. ENVOYER des données au Cloud (Téléphone -> Serveur)
app.post('/sync/push', (req, res) => {
  const authHeader = req.headers['authorization'];
  console.log("Tentative de synchronisation reçue...");
  
  cloudDatabase = req.body; // On enregistre tout dans le cloud
  cloudDatabase.lastUpdated = Date.now();
  
  console.log("Boutique mise à jour sur le Cloud !");
  res.status(200).json({ status: "Success", message: "Données sauvegardées" });
});

// 3. RÉCUPÉRER les données du Cloud (Serveur -> Téléphone)
app.get('/sync/pull', (req, res) => {
  res.json(cloudDatabase);
});

app.get('/', (req, res) => {
  res.send('<h1>Serveur AppTissu Connecté !</h1><p>Votre base de données partagée est prête.</p>');
});

app.listen(port, () => {
  console.log('Cerveau Cloud en ligne sur le port ' + port);
});