const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Item = require('../models/Item');
const auth = require('../middleware/authMiddleware');
const excelJS = require('exceljs');

// Get all lists for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single list by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });
    
    if (list.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new list
router.post('/', auth, async (req, res) => {
  try {
    const newList = new List({
      name: req.body.name,
      userId: req.user.id
    });
    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a list
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });
    
    // Ensure user owns this list
    if (list.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete associated items
    await Item.deleteMany({ listId: req.params.id });
    await list.deleteOne();

    res.json({ message: 'List removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Export list to Excel
router.get('/:id/export', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list || list.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'List not found' });
    }

    const items = await Item.find({ listId: req.params.id });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Grocery List');

    worksheet.columns = [
      { header: 'Item Name', key: 'name', width: 20 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Purchased', key: 'isPurchased', width: 15 },
    ];

    items.forEach(item => {
      worksheet.addRow({
        name: item.name,
        category: item.category,
        quantity: `${item.quantityValue} ${item.quantityType}`,
        price: item.price,
        isPurchased: item.isPurchased ? 'Yes' : 'No'
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `${list.name.replace(/\s+/g, '_')}_Grocery.xlsx`
    );

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
