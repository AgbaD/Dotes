const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Note = require("./models/note");
const User = require("./models/user");
require('dotenv').config();



//initialize express app
const app = express();

// `================---------------------------- APP MIDDLEWARE -----------------------=====================\\

app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// `================-----------------------------------------------------------------------=====================\\

// `================------------------------------ CREATE SERVER ---------------------------=====================\\

// create http server
const httpServer = http.createServer(app);

// initialize socket.io
const io = socketio(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "https://dotessocket.herokuapp.com/", "http://127.0.0.1:5000", "dotes.netlify.app"]
    }
});

// `================-----------------------------------------------------------------------=====================\\



// `================------------------------------ CONNECT DATABASE ------------------------=====================\\
const dbUri = `mongodb+srv://drell:${process.env.MONGOPASSWORD}@cluster0.ppcp1.mongodb.net/Dotes?retryWrites=true&w=majority`;
mongoose.connect(dbUri, {useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false, useNewUrlParser: true} )
.then(response => {
    console.log("connected to db");

     ////////////////////////////////// start server after connecting to db //////////////////////////
    httpServer.listen(process.env.PORT || 3000, console.log("server is running on ports 3000"));
})
.catch(err => console.log(err.message));
// `================-------------------------------------------------------------------------=====================\\



// `================---------------------------- SOCKET MIDDLEWARE ---------------------------=====================\\
io.use(async (socket, next)=>{
    const token = socket.handshake.auth.token;
  if(token){
    jwt.verify(token, process.env.JWTSECRET, (err, decodedToken)=> {
        if(err){
            const err = new Error("not authorized");
            err.data = {content: "bad token"};
            socket.emit("not authorized", {
                error: "not authorized"
            });
            next(err)
        }else{
            User.find({email: decodedToken.email})
            .then(user => {
                if(user.length < 1){
                    const error = new Error("user does not exist");
                    next(error)
                }else{
                socket.username = decodedToken.email;
                socket.public_id = decodedToken.id;
                    console.log(user[0].is_admin)
                if(user[0].is_admin == true){
                    socket.role = "admin";
                }else{
                    socket.role = "staff";
                }
                next();
            }
            })
            .catch(err => {
                console.log(err)
                const error = new Error(err)
                next(error)
            })
            console.log(decodedToken);
            
        }

    })
  }else{
      const err = new Error("not authorized");
      err.data = {content: "no token"};
      socket.emit("not authorized", {
        error: "not authorized"
    });
      next(err)
  }
});
// `================-----------------------------------------------------------------------=====================\\
const verifyToken = (token) => {
    jwt.verify(token, process.env.JWTSECRET, (err, decodedToken) => {
        if(err){
            return "Bad token";
        }else{
            return decodedToken.email;
        }
    })
}


// `===============-------------------------SOCKET EVENT LISTENERS AND FUNCTIONS -----------------====================\\
io.on("connection", socket => {
    socket.emit("get username", socket.username, socket.role);
        const count = io.engine.clientsCount;
        console.log(`${count} users are connected`)
        ////////////////////////////// this would be changed to the user id
        socket.join(socket.username);
        socket.join("general");
        console.log(socket.rooms)
        console.log(`${socket.username} is online`);
        

      

    //////////////////////////////////////// listen for note message //////////////////////
    //get notes
    socket.on("get notes", (user, destination, token) =>{
        const userToken = verifyToken(token);
        if(userToken === "Bad token"){
           socket.emit("bad token", user)
        }else{
        if(destination === "general"){
            Note.find({destination})
            .then(notes => {
               notes.forEach(note => {
                   socket.emit("message", note)
               })
            })
            .catch(err => console.log(err))
        }else{
            Note.find({$or: [{destination: destination, sender: socket.username}, {destination: socket.username, sender: destination}]})
        .then(notes => {
            console.log(notes)
           notes.forEach(note => {
               socket.emit("message", note)
           })
        })
        .catch(err => console.log(err))
        }
    }
    });

    // post a note
    socket.on("send note", (msg, destination, token) =>{
        const userToken = verifyToken(token);
        if(userToken === "Bad token"){
            console.log(userToken)
           socket.emit("bad token", user)
        }else{
        if(destination === "general"){
            Note.create({ message: msg, sender: socket.username, destination})
            .then(note => {
                io.to(destination).to(socket.username).emit("message", note);
            })
            .catch(err => {
                socket.emit("send note error", err);
                console.log(err);
            })
        }else{
            Note.create({ message: msg, sender: socket.username, destination})
            .then(note => {
                io.to(destination).to(socket.username).emit("message", note);
            })
            .catch(err => {
                socket.emit("send note error", err);
                console.log(err);
            })
        }
    }
      
    });

    // delete note
    socket.on("delete note", (id, token, callback) => {
        const userToken = verifyToken(token);
        if(userToken === "Bad token"){
           socket.emit("bad token", user)
        }else{
        Note.findById(id).
        then(note=> {

            if(note.sender === socket.username || socket.role === "admin"){
                Note.findByIdAndDelete(id).
                then(deletedNote => {
                    console.log(deletedNote)
                    callback({
                        deleted: true,
                        id: deletedNote._id
                    })
                })
            }else{
                callback({
                    deleted: false,
                    reason: "not authorized to delete"
                })
            }
        })
        .catch(err => {
            console.log(err);
            socket.emit("note error", err)
        })
    }
    })
    socket.on("Deleted", (id) => {
        io.emit("remove note", id);
    })

    // acknowledge note

    socket.on("acknowledge", (id, callback) => {
        Note.findById(id).
        then(note => {
            if(note.destination === socket.username){
                Note.findByIdAndUpdate(id, {acknowledge: true})
                .then(updatedNote => {
                    io.emit("update acknowledge status", updatedNote._id)
                    callback({
                        status: true
                    })
                })
                .catch(err => {
                    console.log(err);
                    socket.emit("note error", err)
                });

            }else{
                callback({
                    status: false,
                    reason: "note was not directed to you"
                })
            }
        })
    })

    // when user disconnects
    socket.on("disconnecting", (reason) => {
        console.log( socket.username + " disconnected")
        console.log(io.engine.clientsCount + " users left");
    });

})
// `================-----------------------------------------------------------------------=====================\\

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
});
app.post("/token", (req, res) => {
    const {email, id} = req.body;
    const token = jwt.sign(req.body, process.env.JWTSECRET, { expiresIn: 2*60*60});
    res.json({token});
})

// `==============--------------------------- LISTEN FOR REQUESTS ------------------------------------================\\



// `================-----------------------------------------------------------------------=====================\\