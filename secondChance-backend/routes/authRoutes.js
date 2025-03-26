const express = require('express');
const router = express.Router();

// Route de test - Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 🔐 Ici tu feras la vérification dans la base (Exemple simplifié)
    if (username === 'admin' && password === 'password') {
        res.json({ message: '✅ Connexion réussie', token: 'fake-jwt-token' });
    } else {
        res.status(401).json({ message: '❌ Identifiants invalides' });
    }
});

// Route de test - Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // 🔐 En vrai, tu stockeras dans ta DB
    res.status(201).json({ message: `✅ Utilisateur ${username} enregistré !` });
});

module.exports = router;
