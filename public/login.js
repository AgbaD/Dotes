/*
PLEASE NOTE:
 * I just emulated a sample login process 
 * Blank will send you the fetch url
 * the main.js is where the main stuffs are
*/



const loginForm = document.getElementById("login");
loginForm.addEventListener("submit", e =>{
    e.preventDefault();
    // change to email later
    const email = loginForm['username'].value.trim();
    const id = loginForm['public_id'].value;
    fetch("https://dotessocket.herokuapp.com/token", {
        method: "POST",
        body: JSON.stringify({email, id}),
        headers: {"Content-Type": "application/json"}
    })
    .then(response => {
        response.json()
        .then(data => {
            console.log(data)
            localStorage.setItem("token", data.token);
            location.assign("index.html");
        })
    })
    .catch(err => console.log(err))
    // localStorage.setItem("username", username);
    
});