const router = require("express").Router();
const {getNotes, addNote, updateNote, deleteNote} = require("../controller/notesController")

//get notes
router.get('/', getNotes);

//create a new note
router.post('/new', addNote);

//update note
router.put("/edit/:id", updateNote);

//delete note
router.delete('/delete/:id', deleteNote);

module.exports = router

