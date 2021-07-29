/*
 * You can change most of the variable names to suit your design
 * BUT PLEASE DON'T CHANGE THE NAME OF THE SOCKET EMIT EVENTS AND THE SOCKET LISTENERS AND TOKEN TO EVERY SOCKET EMIT EVENTS;
 * 
 * 
 *                  DESIGN
 *  USERS CAN CREATE A PUBLIC NOTE WHERE ALL USERS CAN SEE
 *  USERS CAN SEND PRIVATE NOTE TO OTHER COLLEAGES
 *  USERS CAN CHOOSE TO DELETE SENT NOTES
*/

// `================------------------------------------------------DOM QUERIES ---------------------------------------=====================\\
const publicNoteForm = document.getElementById("public-note-form");
const publicNoteBox = document.getElementById("public-note-box");
const user = document.getElementById("user");
const destinationTitle = document.getElementById("destination-title");
const privateNoteBody = document.getElementById("modal-note-body");
const privateNoteDestination = document.getElementById("private-destination");
const privateNoteForm = document.getElementById("private-note-form")
var username;

// `================----------------------------------------------------------------------------------------------------=====================\\

// `================-------------------------------------CONFIGURE SOCKET DETAILS FROM TOKEN ----------------------------=====================\\
const token = localStorage.getItem("token");
socket = io("https://dotessocket.herokuapp.com", {
    auth:{
        token
    },
});

    
    //socket.connect();
    
 // `================----------------------------------------------------------------------------------------------------=====================\\


 // `================-----------------------------------------SOCKET EVENT LISTENERS ------------------------------------=====================\\
 
 // Connection
 socket.on("connect", ()=>{
    socket.emit("get notes", username, "general", token);
 });

 socket.on("get username", (username, role)=> {
    username = username;
    user.innerHTML = username;
 // listen anytime a message is reciecieved 
 socket.on("message", note =>{ 
     if(note.destination === "general"){
<<<<<<< HEAD
=======
         console.log(role)
>>>>>>> 355f77af563ec380245c54ea2522329243206518
        if(note.sender === username || role == "admin" ){
            publicNoteBox.innerHTML += `<div class="note" id="${note._id}" data-doc="${note._id}">
            <p style="margin-bottom: 5px"><b> from ${note.sender} </b><i style="color:grey">${note.time}</i></p> 
            <p>${note.message}</p>
            <button class="delete" data-doc="${note._id}">Delete</button>
            </div>`;
         }else{
            publicNoteBox.innerHTML += `<div class="note" id="${note._id}" data-doc="${note._id}">
            <p style="margin-bottom: 5px"><b> from ${note.sender} </b><i style="color:grey">${note.time}</i></p> 
            <p>${note.message}</p>
            </div>`;
         }
     
         publicNoteBox.scrollTop = publicNoteBox.scrollHeight;
    
     }else{
        if(note.sender === username || role == "admin" ){
            privateNoteBody.innerHTML += `<div class="note" id="${note._id}" data-doc="${note._id}">
            <p style="margin-bottom: 5px"><b> from ${note.sender} </b><i style="color:grey">${note.time}</i></p> 
            <p>${note.message}</p>
            <button class="delete" data-doc="${note._id}">Delete</button>
            </div>`;
         }else{
            privateNoteBody.innerHTML += `<div class="note" id="${note._id}" data-doc="${note._id}">
            <p style="margin-bottom: 5px"><b> from ${note.sender} </b><i style="color:grey">${note.time}</i></p> 
            <p>${note.message}</p>
            </div>`;
         }
     
         privateNoteBody.scrollTop = privateNoteBody.scrollHeight;
          //  const acknowledgeBtns = document.getElementsByClassName("acknowledge");
    //  for(let i = 0; i < acknowledgeBtns.length; i++){
    //     const acknowledgeBtn = acknowledgeBtns[i];
    //     acknowledgeBtn.addEventListener("click", e => {
    //         const id = e.target.parentElement.dataset.doc;
    //         socket.emit("acknowledge", id, (response)=> {
    //             if(response.status === true){
    //                 acknowledgeBtn.innerHTML = "acknowledged";
    //             }else{
    //                 alert(response.reason);
    //             }
    //         })
    //     })
    //  }
     }
    
     // delete note
     const deleteBtns = document.getElementsByClassName("delete");
     for (let i = 0; i < deleteBtns.length; i++) {
         const deleteBtn = deleteBtns[i];
         
         deleteBtn.addEventListener("click", (e) =>{
            const id = deleteBtn.dataset.doc
            socket.emit("delete note", id, token, (response)=>{
                // alert(response.deleted)
                if(response.deleted === true){
                    socket.emit("Deleted", response.id, token);
                }
           });
           })
           
     }
 


 });

 // acknowledge note 
// socket.on('update acknowledge status', id =>{
    // alert("update")
    //  const noteDiv = document.getElementById(id);
    //  if(noteDiv.querySelector(".acknowledge")){
    //      alert("true")
    //  }
    //  const acknowledgeStatus = noteDiv.querySelector(".acknowledge");
    //  acknowledgeStatus.innerHTML = "acknowledged"
// });

 // remove deleted note
 socket.on("remove note", id=>{
    document.getElementById(id).remove();
 });

 // Connection Error
 socket.on("connect_error", err=>{
     if(err == "Error: not authorized"){
         location.assign('/login.html');
     }else{
         console.log(err);
     }
 })

})
 // `================------------------------- WHERE THE ACTION TAKES PLACE (DOM EVENT LISTENERS) -----------------------=====================\\

 //send general note
 publicNoteForm.addEventListener("submit", e => {
    e.preventDefault();
    const message = publicNoteForm['messageBox'].value.trim();
    const destination = publicNoteForm['destination'].value;
    socket.emit("send note", message, destination, token);
})

//send get private notes 
const PrivateRoomBtns = document.getElementsByClassName("private-room-btn");
for (let i = 0; i < PrivateRoomBtns.length; i++) {
    const privateRoomBtn = PrivateRoomBtns[i];
    const destination = privateRoomBtn.innerHTML;
    privateRoomBtn.addEventListener("click", e =>{
        e.preventDefault();
        privateNoteBody.innerHTML = '';
        destinationTitle.innerHTML = destination;
        privateNoteDestination.value = destination;
        socket.emit("get notes",username, destination, token); 
    })
}

// send private notes
privateNoteForm.addEventListener("submit", e => {
    e.preventDefault();
    const destination = privateNoteForm['private-destination'].value;
    const message = privateNoteForm['private-message'].value;
    socket.emit("send note", message, destination, token)
});

// `================----------------------------------------------------------------------------------------------------=====================\\
