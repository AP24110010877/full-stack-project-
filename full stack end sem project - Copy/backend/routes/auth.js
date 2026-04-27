const express = require('express');
const { register, login, getMe } = require('../controller/authController');

const router = express.Router();

const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;
