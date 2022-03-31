const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const fetchuser = require("../middleware/fetchuser")
const { body, validationResult } = require('express-validator');

//Route:1 Get all the notes from user using: GET /api/notes/fetchallnotes .Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error");
    }
})

//Route:2 Add notes using: POST /api/notes/addnote
router.post('/addnote', [
    body('title', 'Enter valid title').isLength({ min: 3 }),
    body('description', 'Description must be greater than 5').isLength({ min: 5 }),
], fetchuser, async (req, res) => {
    try {
        const errors = validationResult(req);
        //if there are errors then return bad request and the error
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, tag } = req.body;
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error");
    }
})

//Route:3 Updating an exisiting note: PUT /api/notes/updatenote/:id
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body;

    //creating newNote object
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };

    //find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) {
        return res.status(404).send("Not found");
    }
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed");
    }
    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.json({ note });
})

//Route:4 Deleting an exisiting note: POST /api/notes/deletenote/:id
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    //find the note to be deleted and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
        return res.status(404).send("Not found");
    }
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed");
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ "Success": "note has been deleted", "note": note });
})
module.exports = router;