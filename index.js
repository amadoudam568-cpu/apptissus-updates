const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// 🛡️ --- VOS IDENTIFIANTS PERSONNELS (À CHANGER ICI) ---
const CLOUD_USER = "mon_admin";   // Votre nom d'utilisateur
const CLOUD_PASS = "Tissu99!";    // Votre mot de passe secret
// ----------------------------------------------------

// Fonction de sécurité pour vérifier l'accès
const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  const expectedAuth = Buffer.from(`${CLOUD_USER}:${CLOUD_PASS}`).toString('base64');
  
  if (auth === expectedAuth) {
    next();
  } else {
    console.log("Tentative d'accès refusée !");
    res.status(401).send('Accès non autorisé');
  }
};

// Route pour le voyant VERT de l'application
app.get('/health', checkAuth, (req, res) => {
  res.status(200).send('OK');
});

// Route pour recevoir les ventes de l'application
app.post('/api/sales', checkAuth, (req, res) => {
  console.log("Nouvelle vente reçue :", req.body.number);
  // Ici le serveur enregistre la vente
  res.status(201).json({ status: "Succès", message: "Vente sauvegardée au Cloud" });
});

app.get('/', (req, res) => {
  res.send('<h1>Serveur AppTissu PRO en ligne</h1><p>En attente de connexion sécurisée...</p>');
});

app.listen(port, () => {
  console.log('Serveur Pro démarré sur le port ' + port);
});