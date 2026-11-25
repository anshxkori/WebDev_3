const Note = require('../models/Note');
const { appEvents } = require('../events/eventHandler');

// @desc    Create a new note
// @route   POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const note = new Note({
      title: title.trim(),
      content: content.trim(),
      owner: req.user.id,
    });

    await note.save();

    // Trigger Node.js EventEmitter event
    appEvents.emit('noteCreated', {
      noteId: note._id.toString(),
      title: note.title,
      userId: req.user.id,
    });

    // Return created note (Matches screenshot Fig 2 / Fig 4 bottom: Status 201 Created)
    return res.status(201).json({
      _id: note._id,
      title: note.title,
      content: note.content,
      owner: note.owner,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    console.error('Create note error:', error);
    return res.status(500).json({ message: 'Error creating note', error: error.message });
  }
};

// @desc    Get all notes for authenticated user
// @route   GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    // Only return notes belonging to the authenticated user (Screenshot Fig 2 top)
    const notes = await Note.find({ owner: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    return res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

// @desc    Get a single note by ID
// @route   GET /api/notes/:id
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Ownership check
    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this note' });
    }

    return res.status(200).json(note);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching note', error: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Ownership check
    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own notes' });
    }

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();

    await note.save();

    // Trigger Node.js EventEmitter event
    appEvents.emit('noteUpdated', {
      noteId: note._id.toString(),
      title: note.title,
      userId: req.user.id,
    });

    return res.status(200).json(note);
  } catch (error) {
    console.error('Update note error:', error);
    return res.status(500).json({ message: 'Error updating note', error: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Ownership check
    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own notes' });
    }

    await note.deleteOne();

    // Trigger Node.js EventEmitter event
    appEvents.emit('noteDeleted', {
      noteId: req.params.id,
      userId: req.user.id,
    });

    return res.status(200).json({
      message: 'Note deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Delete note error:', error);
    return res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};
