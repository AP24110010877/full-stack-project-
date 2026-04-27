const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const List = require('../models/List');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer storage for handling local image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Save to an 'uploads' directory
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get items for a list
router.get('/:listId', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list || list.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'List not found or unauthorized' });
    }

    const items = await Item.find({ listId: req.params.listId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add an item to a list
router.post('/:listId', auth, upload.single('imageFile'), async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list || list.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'List not found or unauthorized' });
    }

    const { category, name, price, quantityType, quantityValue, imageUrl } = req.body;
    
    let imagePath = '';
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
    } else if (imageUrl) {
      imagePath = imageUrl;
    }

    const newItem = new Item({
      listId: req.params.listId,
      category,
      name,
      price: Number(price),
      quantityType,
      quantityValue: Number(quantityValue),
      image: imagePath
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Toggle Item Purchase status
router.put('/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const list = await List.findById(item.listId);
    if (list.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    item.isPurchased = !item.isPurchased;
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an Item
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const list = await List.findById(item.listId);
    if (list.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
