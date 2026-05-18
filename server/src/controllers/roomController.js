const Room = require('../models/Room');
const Message = require('../models/Message');

// GET /api/rooms — get all public rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/rooms — create a room
const createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name is required' });

    const existing = await Room.findOne({ name: name.trim() });
    if (existing) return res.status(400).json({ message: 'Room name already taken' });

    const room = await Room.create({
      name: name.trim(),
      description: description || '',
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    await room.populate('createdBy', 'username');
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/rooms/:id/join
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRooms, createRoom, joinRoom };
