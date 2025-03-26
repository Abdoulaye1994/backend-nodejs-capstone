const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { connectToDatabase } = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';
if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath, { recursive: true });

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

/**
 * GET all secondChanceItems
 */
router.get('/', async (req, res, next) => {
  logger.info('/ called');
  try {
    const db = await connectToDatabase();                                // Step 2 Task 1
    const collection = db.collection("secondChanceItems");               // Step 2 Task 2
    const secondChanceItems = await collection.find({}).toArray();       // Step 2 Task 3
    res.json(secondChanceItems);                                         // Step 2 Task 4
  } catch (e) {
    logger.error('Oops something went wrong', e);
    next(e);
  }
});

/**
 * POST - Add a new item with image upload
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const db = await connectToDatabase();                                // Step 3 Task 1
    const collection = db.collection("secondChanceItems");               // Step 3 Task 2

    // Step 3 Task 3: Create new item from body
    const newItem = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.file ? `/images/${req.file.filename}` : null
    };

    // Step 3 Task 4: Get last ID, increment
    const lastItem = await collection.find().sort({ id: -1 }).limit(1).toArray();
    newItem.id = lastItem.length > 0 ? lastItem[0].id + 1 : 1;

    // Step 3 Task 5: Add createdAt
    newItem.createdAt = new Date();

    // Step 3 Task 6: Insert the new item
    await collection.insertOne(newItem);
    res.status(201).json(newItem);
  } catch (e) {
    logger.error('Error adding new item', e);
    next(e);
  }
});

/**
 * GET a single secondChanceItem by ID
 */
// routes/secondChanceItemsRoutes.js

// Récupérer un item par ID
router.get('/:id', async (req, res) => {
    try {
        console.log('ID reçu dans la requête:', req.params.id); // Affiche l'ID reçu
        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');

        // Recherche de l'élément par ID (en tant qu'entier)
        const item = await collection.findOne({ id: parseInt(req.params.id) });

        if (!item) {
            console.log('Item non trouvé');
            return res.status(404).json({ error: 'Item non trouvé' });
        }

        console.log('Item trouvé:', item);
        res.json(item); // Retourne l'élément trouvé
    } catch (error) {
        console.error('Erreur lors de la récupération de l’item:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l’item' });
    }
});



/**
 * PUT - Update an existing item
 */
router.put('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();                                // Step 5 Task 1
    const collection = db.collection("secondChanceItems");               // Step 5 Task 2

    const updatedItem = await collection.findOneAndUpdate(
      { id: parseInt(req.params.id) },                                   // Step 5 Task 3
      { $set: req.body },                                                // Step 5 Task 4
      { returnDocument: 'after' }
    );

    if (!updatedItem.value) {
      return res.status(404).json({ error: 'Item non trouvé' });         // Step 5 Task 5
    }

    res.json(updatedItem.value);
  } catch (e) {
    logger.error('Error updating item', e);
    next(e);
  }
});

/**
 * DELETE - Delete an existing item
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();                                // Step 6 Task 1
    const collection = db.collection("secondChanceItems");               // Step 6 Task 2

    const deletedItem = await collection.findOneAndDelete({ id: parseInt(req.params.id) }); // Step 6 Task 3

    if (!deletedItem.value) {
      return res.status(404).json({ error: 'Item non trouvé' });         // Step 6 Task 4
    }

    res.json({ message: 'Item supprimé', deletedItem: deletedItem.value });
  } catch (e) {
    logger.error('Error deleting item', e);
    next(e);
  }
});

module.exports = router;
