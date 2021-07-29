const {Schema, model} = require("mongoose");
const moment = require("moment");

const NoteSchema = new Schema({
    message: {
        type: String,
        required: [true, "Note has no message"]
    },
    sender:{
        type: String,
        required:[true, "Note has no sender"]
    },
    destination:{
        type: String,
        required: [true, "Message has no destination"]
    },
    acknowleged:{
        type: Boolean,
        default: false
    },
    time: {
        type: String,
        default: moment().format("h:mm a")
    }

});

const Note = model('note', NoteSchema);

module.exports = Note;
