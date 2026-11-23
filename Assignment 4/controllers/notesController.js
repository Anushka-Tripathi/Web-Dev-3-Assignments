const Note = require('../models/Note');
const appEvents = require('../events/appEvents');

const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const note = await Note.create({
      title,
      content,
      owner: req.user._id
    });

    appEvents.emit('note:created', note);

    return res.status(201).json({
      _id: note._id,
      title: note.title,
      content: note.content,
      owner: note.owner,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create note' });
  }
};

const getNotes = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const notes = await Note.find(filter).sort({ createdAt: 1 });
    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }

    if (req.body.title !== undefined) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;

    const updated = await note.save();
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();
    appEvents.emit('note:deleted', note._id, req.user._id);

    return res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete note' });
  }
};

module.exports = { createNote, getNotes, updateNote, deleteNote };