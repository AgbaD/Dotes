document.querySelector('.login-form').addEventListener('submit',login);

function login(e){
    e.preventDefault()

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    
    var params = {"email":email, "password": password};

    var xhr = new XMLHttpRequest();
    xhr.open("POST","https://dotess.herokuapp.com/login",true);
    xhr.setRequestHeader("Content-Type","application/json");

    xhr.onload = function(){
        if(this.status == 200){
            var body = this.response ;
            var data = JSON.parse(body);
            alert(data.message);
        }else{
            alert('Please Retry!');
        }
    };
    xhr.send(JSON.stringify(params));
};


