const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Note = require('../Models/Note');

/////////////////////////////////////Route 1: Get all notes: GET "/api/notes/createuser" no login required///////////////////////////////
router.get('/fetchallnotes', fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.send(notes);
  } catch (error) {
    console.error('in notes.js line 13', error.message);
    res.status(500).send('Intarnal server Error Occured');
  }
});

/////////////////////////////////////Route 2: POST add a new notes: POST "/api/notes/addnote" no login required///////////////////////////////
router.post(
  '/addnote',
  fetchUser,
  [
    body('title', 'enter a valid title').isLength({ min: 3 }),
    body('description', 'enter valied description').isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //if there error return bad requast and error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();

      res.send(savedNote);
    } catch (error) {
      console.error('in notes.js line  40', error.message);
      res.status(500).send('Intarnal server Error Occured');
    }
  }
);
/////////////////////////////////////Route 3:  update a existing notes: POST "/api/notes/updatenote" no login required///////////////////////////////
router.put('/updatenote/:id', fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  //create new note object
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }

  ///find the note to be updated and update it
  console.log(req.params.id);
  let note = await Note.findById(req.params.id);
  console.log('user', note);
  if (!note) {
    res.status(404).send('Not Found');
  }
  if (note._id.toString() !== req.user.id) {
    res.status(401).send('Not Allowed');
  }

  note = await Note.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.json(note);
});

/////////////////////////////////////Route 4:  delete a existing notes: POST "/api/notes/deletenote" no login required///////////////////////////////
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).send('Not Found');
    }
    if (note.user.toString() !== req.user.id) {
      res.status(401).send('Not Allowed');
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ success: 'note has been deleted', note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Intarnal server Error Occured');
  }
});
module.exports = router;
