const express = require('express');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');
const {
  createNote,
  getNotes,
  updateNote,
  deleteNote
} = require('../controllers/notesController');

const router = express.Router();

router.use(protect, authorizeRoles('user', 'admin'));

router.post('/', createNote);
router.get('/', getNotes);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;