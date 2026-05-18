const express = require('express');
const router = express.Router();
const { getRooms, createRoom, joinRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRooms);
router.post('/', protect, createRoom);
router.post('/:id/join', protect, joinRoom);

module.exports = router;
