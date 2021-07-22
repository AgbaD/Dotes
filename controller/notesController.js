const Note = require("../models/note");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

var authorId;
// decode token
const tokenDecoder = (req, res, token) => {
   
}

// get notes
const getNotes = (req, res) => {
    Note.find()
    .then(notes =>{
        console.log(notes)
        res.status(200).json({notes})
    })
}

// add note
const addNote = async (req, res) => {
    const token = req.headers.authorization;
    var {title, content, isPublic} = req.body;
    if(token){
        // verify the token
        jwt.verify(token, process.env.JWTSECRET, (err, decodedToken) =>{
            if(err){
                console.log(err)
                res.status(400).json({error: "bad token"})
            }else{
                console.log(decodedToken)
                //get the id of the user from the token
                 const authorId = decodedToken.id;

                 // all conditions are satisfied.. now create note
                Note.create({title, content, authorId, isPublic})
                .then(note =>{
                    console.log(note)
                    res.status(200).json({note})
                })
                .catch(err =>{
                    console.log(err);
                    res.status(400).json({error: err})
                })
    
                
                }
        })

    }else{
       res.status(400).json({error: "bad auth: No authorization token"}) 
    }


    
}

//update note
const updateNote = async (req, res) => {
    // get the token from the header
    const token = req.headers.authorization;
    //get the id of the note from the request
    const id = req.params.id;
    if(token){
        // verify the token
        jwt.verify(token, process.env.JWTSECRET, (err, decodedToken) => {
            if(err){
                console.log(err);
                res.status(400).json({error: "bad token"});
            }else{
                const userId = decodedToken.id;
                
                // find the note
                Note.findById(id)
                .then(note => {
                    // check if author id matches the userId or admin id
                    if(note.authorId == userId || userId == "admin id"){
                        Note.findByIdAndUpdate(id, req.body)
                        .then(updatedNote => {
                            res.status(200).json({updatedNote})
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(400).json({error: err});
                        })
                    }else{
                        res.status(400).json({error: "user not authorized to update note"})
                    }
                })
                .catch(err => {
                    console.log(err)
                    res.status(400).json({error: err})
                })

            }
        })
    }else{
        res.status(400).json({error: "bad auth: user not authorized"})
    }

}

//delete note
const deleteNote = (req, res, next) => {
  // get the token from the header
  const token = req.headers.authorization;
  //get the id of the note from the request
  const id = req.params.id;
  if(token){
      // verify the token
      jwt.verify(token, process.env.JWTSECRET, (err, decodedToken) => {
          if(err){
              console.log(err);
              res.status(400).json({error: "bad token"});
          }else{
              const userId = decodedToken.id;
              
              // find the note
              Note.findById(id)
              .then(note => {
                  // check if author id matches the userId or admin id
                  if(note.authorId == userId || userId == "admin id"){
                      Note.findByIdAndDelete(id)
                      .then(deletedNote => {
                          res.status(200).json({deletedNote})
                      })
                      .catch(err => {
                          console.log(err);
                          res.status(400).json({error: err});
                      })
                  }else{
                      res.status(400).json({error: "user not authorized to delete note"})
                  }
              })
              .catch(err => {
                  console.log(err)
                  res.status(400).json({error: err})
              })

          }
      })
  }else{
      res.status(400).json({error: "bad auth: user not authorized"})
  }

}
module.exports = {getNotes, addNote, updateNote, deleteNote}