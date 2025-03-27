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
        const newUser = await usersCollection.insertOne({ username, password: hashedPassword });

        res.status(201).json({ 
            message: `✅ Utilisateur ${username} enregistré avec succès !`,
            user: { id: newUser.insertedId, username } // Retourne l'utilisateur sans le mot de passe
        });
    } catch (error) {
        console.error('❌ Erreur lors de l’inscription :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

/**
 * 📌 Route de connexion (Login)
 */
router.post('/login', async (req, res) => {
    console.log(req.body); // 👈 Ajoute ceci pour voir les données envoyées

    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "❌ Tous les champs sont requis." });
    }

    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");

        const theUser = await collection.findOne({ email: req.body.email });
        if (!theUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcryptjs.compare(req.body.password, theUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Wrong password' });
        }

        const payload = { user: { id: theUser._id.toString() } };
        const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.json({ authtoken, userName: theUser.firstName, userEmail: theUser.email });
    } catch (e) {
        console.error(e);
        return res.status(500).send('Internal server error');
    }
});


module.exports = router;
