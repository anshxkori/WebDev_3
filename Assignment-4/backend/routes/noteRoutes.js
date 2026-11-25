const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All note routes require authentication via authMiddleware
router.use(authMiddleware);

router.route('/')
  .get(noteController.getNotes)
  .post(noteController.createNote);

router.route('/:id')
  .get(noteController.getNoteById)
  .put(noteController.updateNote)
  .delete(noteController.deleteNote);

module.exports = router;
