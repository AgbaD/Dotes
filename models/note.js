const { Schema, model } = require("mongoose");

// The structure of the Note

const NoteSchema = new Schema({
    title:{
        type: String,
        required: [true, "a title is required"],
    },
    content:{
        type: String,
        required: [true, "Please write something"]
    },
    authorId:{
        type: String,
        required: [true, "An author ID is required"]
    },
    isPublic:{
        type: Boolean,
        default: true,
    }
})

const Note = model("note", NoteSchema);

module.exports = Note;