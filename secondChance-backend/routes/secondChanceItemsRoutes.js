const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { connectToDatabase } = require('../models/db');
const logger = require('../logger');

// Définition du répertoire d'upload
const directoryPath = 'public/images';
if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath, { recursive: true });

// Configuration de multer avec validation du type de fichier
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, directoryPath),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('❌ Format de fichier non autorisé !'), false);
};
const upload = multer({ storage, fileFilter });

/**
 * GET - Récupérer tous les items
 */
router.get('/', async (req, res, next) => {
    try {
        console.log('Route GET /api/secondchance/ appelée');
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");

        const secondChanceItems = await collection.find({}).toArray();
        if (secondChanceItems.length === 0) {
            return res.status(404).json({ error: 'Aucun élément trouvé' });
        }
        res.json(secondChanceItems);
    } catch (e) {
        logger.error('Erreur lors de la récupération des éléments:', e);
        next(e);
    }
});

/**
 * POST - Ajouter un nouvel item avec upload d'image
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
      const db = await connectToDatabase();
      const collection = db.collection("secondChanceItems");

      // Vérification des entrées
      const { name, description, price } = req.body;
      if (!name || !description || !price) {
          return res.status(400).json({ error: '❌ Tous les champs sont requis.' });
      }

      // Création de l'élément
      const newItem = {
          name,
          description,
          price: parseFloat(price),
          imageUrl: req.file ? `/images/${req.file.filename}` : null,
          createdAt: new Date()
      };

      // Générer un ID unique
      const lastItem = await collection.find().sort({ id: -1 }).limit(1).toArray();
      newItem.id = (lastItem.length > 0 && lastItem[0].id) ? lastItem[0].id + 1 : 1;

      // Insérer dans la base de données
      await collection.insertOne(newItem);
      res.status(201).json(newItem);
  } catch (e) {
      console.error('❌ Erreur lors de l’ajout d’un nouvel item', e);
      next(e);
  }
});


/**
 * GET - Récupérer un item par ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('secondChanceItems');

        const item = await collection.findOne({ id: parseInt(req.params.id) });
        if (!item) return res.status(404).json({ error: 'Item non trouvé' });

        res.json(item);
    } catch (error) {
        logger.error('Erreur lors de la récupération de l’item', error);
        next(error);
    }
});

/**
 * PUT - Mettre à jour un item existant
 */
router.put('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");

        const updatedItem = await collection.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { $set: req.body },
            { returnDocument: 'after' }
        );

        if (!updatedItem.value) {
            return res.status(404).json({ error: 'Item non trouvé' });
        }

        res.json(updatedItem.value);
    } catch (e) {
        logger.error('Erreur lors de la mise à jour', e);
        next(e);
    }
});

/**
 * DELETE - Supprimer un item
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");

        const deletedItem = await collection.findOneAndDelete({ id: parseInt(req.params.id) });

        if (!deletedItem.value) {
            return res.status(404).json({ error: 'Item non trouvé' });
        }

        res.json({ message: '✅ Item supprimé', deletedItem: deletedItem.value });
    } catch (e) {
        logger.error('Erreur lors de la suppression', e);
        next(e);
    }
});

module.exports = router;
