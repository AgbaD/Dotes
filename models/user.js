const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    fullname:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    workspace:{
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean
    }

})
const User = model('user', UserSchema);

module.exports = User;