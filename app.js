const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const CORS = require("cors");
const morgan = require("morgan");
const noteRoutes = require("./routes/notesRoutes");
const {requiresAuth} = require("./middleware/authMiddleware")

// initialize app
const app = express();

//middleware
app.use(express.json())
app.use(CORS());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(morgan('dev'));

//connect to db
const dbURI = `mongodb+srv://drell:${process.env.MONGO_PASSWORD}@cluster0.6r9xp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
.then(response =>{
    console.log("connected to db");
    app.listen("3000", console.log("server is running"));
})

//routes
app.use("/dotes", requiresAuth, noteRoutes);

