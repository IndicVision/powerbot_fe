// init
let retrieval_url = "https://retrieval-be.onrender.com";
let chat_url = "https://indic-power-4735675067c5.herokuapp.com";

let sessionId = Math.floor(100000 + Math.random() * 900000);
let testing = false;
if (!testing) {init_retriever()};
let retrieved;
let response;

const inputField = document.getElementById('userInput');
inputField.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

var messages = [{
    "role":"system",
    "content":`You are an assistant for question-answering tasks.
    Use the attached information to answer the question.
    If asked for a graph, generate python code that will draw the graph`
}];

// helper functions

function sendMessage() {
    chatBox = document.getElementById("chats");
    var inputField = document.getElementById("userInput");
    let message = inputField.value;
    inputField.value = "";

    let messageDiv = document.createElement("div");
    messageDiv.classList.add("msg", "message");
    messageDiv.innerText = message;
    chatBox.appendChild(messageDiv)

    messages.push({
        "role":"user",
        "content":[{"type":"text", "text":message}]
    })
    if (!testing) {send_request()}
}

function format_response () {
    chatBox = document.getElementById("chats");
    let responseDiv = document.createElement("div");
    responseDiv.classList.add("msg", "response");
    if (data.image) {
        responseDiv.innerHTML = `
            ${marked.parse(data.response)}
            <img style="max-width: 700px;"src="data:image/png;base64, ${data.image}">`;
    } else {
        responseDiv.innerHTML = marked.parse(data.response);
    }
    chatBox.appendChild(responseDiv);
}

// api calls

async function init_retriever () {
    fetch(retrieval_url+"/init", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            collection: "pdr_power_data",
            session: sessionId
        })
    })  
    .then(response => response.json())
    .then(data => {
        const responseDiv = document.createElement("div");
        responseDiv.innerText = data.status
        document.body.appendChild(responseDiv)
        setTimeout(() => {
            responseDiv.remove();
        }, 2000);
    })
    .catch(error => {
        console.error("Error: ", error);
    })
}

async function send_request () {
    await fetch(retrieval_url+"/retrieve", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: messages,
            session: sessionId
        })
    })
    .then(response => response.json())
    .then(data => {
        retrieved = data.retrieved;
        messages[messages.length-1]["content"].push({
            "type":"text",
            "text":`CONTEXT: ${retrieved}`
        })
    })
    await fetch(chat_url+"/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: messages,
            retrieved: retrieved
        })
    })
    .then(response => response.json())
    .then(data => {
        response = data.response;
        chatBox = document.getElementById("chats");
        let responseDiv = document.createElement("div");
        responseDiv.classList.add("msg", "response");
        console.log(data)
        if (data.image) {
            responseDiv.innerHTML = `
                ${marked.parse(data.response)}
                <img style="max-width: 400px;"src="data:image/png;base64, ${data.image}">`;
        } else {
            responseDiv.innerHTML = marked.parse(data.response);
        }
        chatBox.appendChild(responseDiv)
    }) 
    .catch(error => {
        console.error("Error: ", error);
    })
}
