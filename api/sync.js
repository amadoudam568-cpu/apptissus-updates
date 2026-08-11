// Note : Sur Vercel (gratuit), les données s'effacent après quelques minutes d'inactivité.
// C'est parfait pour un test, mais pour une boutique réelle, il faudra lier une base de données.
let cloudStore = {}; 

export default function handler(req, res) {
  if (req.method === 'POST') {
    cloudStore = req.body;
    return res.status(200).json({ status: "Success" });
  }
  res.status(200).json(cloudStore);
}