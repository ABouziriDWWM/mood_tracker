// backend/server.js

const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors()); // Autorise les requêtes cross-origin
app.use(express.json()); // Permet de lire le JSON des requêtes

// --- Configuration de la base de données ---
const uri = "mongodb://localhost:27017"; // Votre chaîne de connexion MongoDB
const client = new MongoClient(uri);
let db;

async function connectToDb() {
  try {
    await client.connect();
    db = client.db("moodflow"); // Nom de la base de données
    console.log("Connecté à la base de données MongoDB");
  } catch (err) {
    console.error("Erreur de connexion à MongoDB", err);
    process.exit(1);
  }
}

// --- Routes de l'API ---

// Route pour l'inscription (POST /api/register)
app.post("/api/register", async (req, res) => {
  const { username, email, password, displayName } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  const usersCollection = db.collection("users");

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await usersCollection.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "Nom d'utilisateur ou email déjà utilisé." });
  }

  // Hacher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Créer le nouvel utilisateur
  const newUser = {
    username,
    email,
    passwordHash,
    profile: {
      displayName: displayName || username,
      avatar: "😊", // Avatar par défaut
    },
    createdAt: new Date(),
  };

  try {
    const result = await usersCollection.insertOne(newUser);
    res
      .status(201)
      .json({
        message: "Utilisateur créé avec succès",
        userId: result.insertedId,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'utilisateur." });
  }
});

// Route pour la connexion (POST /api/login)
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body; // L'utilisateur peut se connecter avec son username ou email

  if (!username || !password) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  const usersCollection = db.collection("users");
  const user = await usersCollection.findOne({
    $or: [{ username: username }, { email: username }],
  });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé." });
  }

  // Vérifier le mot de passe
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Mot de passe incorrect." });
  }

  // Ne pas renvoyer le hash du mot de passe
  const { passwordHash, ...userWithoutPassword } = user;
  res
    .status(200)
    .json({ message: "Connexion réussie", user: userWithoutPassword });
});

// --- Démarrage du serveur ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  connectToDb();
});
