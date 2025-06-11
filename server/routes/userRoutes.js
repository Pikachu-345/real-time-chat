const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { searchUser } = require('../controllers/userController')

const router = express.Router();

router.post('/search', protect, searchUser);

module.exports = router;