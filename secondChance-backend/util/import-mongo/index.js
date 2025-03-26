require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

// Check if MONGO_URL is correctly loaded
if (!process.env.MONGO_URL) {
    console.error('❌ MONGO_URL not found in .env');
    process.exit(1);
}

const url = process.env.MONGO_URL;
const filename = `${__dirname}/secondChanceItems.json`;
const dbName = 'secondChance';
const collectionName = 'secondChanceItems';

// Load data from JSON file
const data = JSON.parse(fs.readFileSync(filename, 'utf8')).docs;

async function loadData() {
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log("✅ Connected successfully to MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const documents = await collection.find({}).toArray();

        if (documents.length === 0) {
            const insertResult = await collection.insertMany(data);
            console.log(`✅ Inserted ${insertResult.insertedCount} documents`);
        } else {
            console.log("ℹ️ Items already exist in DB");
        }
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.close();
    }
}


loadData();

module.exports = {
    loadData,
  };
