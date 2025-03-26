require('dotenv').config();
const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL;
const dbName = "secondChance";

let dbInstance;

async function connectToDatabase() {
    if (dbInstance) return dbInstance; // Évite de recréer la connexion

    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log("✅ Connecté à MongoDB");
        dbInstance = client.db(dbName);
        return dbInstance;
    } catch (error) {
        console.error("❌ Erreur de connexion MongoDB :", error);
        throw error;
    }
}

// Exportation de la fonction connectToDatabase
module.exports = { connectToDatabase };
