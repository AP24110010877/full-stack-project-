const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  category: {
    type: String,
    enum: ['Fruits', 'Vegetables', 'Dairy', 'House Essentials', 'Others'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantityType: {
    type: String,
    enum: ['Kg/Gram', 'Liter', 'Pieces'],
    required: true
  },
  quantityValue: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String, // Can be a URL or a base64 string or an explicit path
    default: ''
  },
  isPurchased: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
