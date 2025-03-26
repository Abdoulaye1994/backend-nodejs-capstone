const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDatabase } = require('../models/db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key'; // Clé JWT

/**
 * 📌 Route d'inscription (Register)
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: '❌ Tous les champs sont requis.' });
        }

        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '❌ Nom d’utilisateur déjà pris.' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérer le nouvel utilisateur
        await usersCollection.insertOne({ username, password: hashedPassword });

        res.status(201).json({ message: `✅ Utilisateur ${username} enregistré avec succès !` });
    } catch (error) {
        console.error('❌ Erreur lors de l’inscription :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

/**
 * 📌 Route de connexion (Login)
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: '❌ Tous les champs sont requis.' });
        }

        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        // Vérifier si l'utilisateur existe
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: '❌ Identifiants invalides' });
        }

        // Vérification du mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '❌ Identifiants invalides' });
        }

        // Générer un vrai token JWT
        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: '✅ Connexion réussie', token });
    } catch (error) {
        console.error('❌ Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

module.exports = router;
