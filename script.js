// DOM
const url = "https://powerbot-be.onrender.com;
const chatBox = document.getElementById('chats');
var messages = [{
    "role":"system",
    "content":`You are an assistant for question-answering tasks.
    Use the attached information to answer the question.
    If asked for a graph, generate python code that will draw the graph (in size (6,8))`
}];

const inputField = document.getElementById('userInput');
inputField.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

if (chatBox.childNodes.length === 3) {
    instructionMsgDiv = document.createElement('div');
    instructionMsgDiv.classList.add('instruct-msg');
    instructionMsgDiv.innerHTML = `
        <h2 style="text-align: center;">Connecting to server...</h2>
    `;
    chatBox.appendChild(instructionMsgDiv);
}

checkAPIStatus();

// API Calls

async function checkAPIStatus(){
    let instructionMsgDiv = document.querySelector('.instruct-msg')
    instructionMsgDiv.innerHTML = `
        <h2 style="text-align: center;">Instructions</h2>
        <div class="statusMsg" style="text-align: center"> Connecting to API... </div>
        <p>The IndicVision PowerBot is a retrieval augmented question-answering chatbot designed to answer queries and generate graphs based on the information content provided in the following documents:</p>
        <ul>
        <li>Report of the Comptroller and Auditor General of India on Public Sector Undertakings for the year ended 31 March 2018
        <li>Report of the Comptroller and Auditor General of India on Public Sector Undertakings for the year ended 31 March 2018
        </ul>
    `;
    let statusMessageDiv = document.querySelector(".statusMsg")
    try {
        const response = await fetch(url+"/init");
        if (response.ok) {
            statusMessageDiv.textContent = "Connected to API"
            setTimeout(() => {
                statusMessageDiv.remove();
            }, 2000);
        }
    } catch (error) {
        console.error(error);
        statusMessageDiv.textContent = "Connection failed, please refresh"
    }
}

async function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    if (instructionMsgDiv) {
        chatBox.removeChild(instructionMsgDiv);
        instructionMsgDiv = null;
    }
    if (userInput.trim() !== "") {
        const userMessageDiv = document.createElement('div')
        userMessageDiv.classList.add('message');
        userMessageDiv.textContent = userInput;
        chatBox.appendChild(userMessageDiv)
        inputField.value = "";

        messages.push({
            "role":"user",
            "content":[{"type":"text", "text":userInput}]
        })
        await fetch(url+"/chat", {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: userInput,
                messages: messages,
            })
        })
        .then(response => response.json())
        .then(data => {
            const responseDiv = document.createElement("div");
            responseDiv.classList.add("response");
            console.log(data)
            if (data.image) {
                responseDiv.innerHTML = `
                    <img src="images/logo.png" id="logo">
                    ${marked.parse(data.response)}
                    <img style="max-width: 400px;"src="data:image/png;base64, ${data.image}">`;
            } else {
                responseDiv.innerHTML = `
                    <img src="images/logo.png" id="logo">
                    ${marked.parse(data.response)}`;
            }
            console.log(data.messages)
            messages = data.messages
            messages.push({
                "role":"assistant",
                "content":data.response
            })
            chatBox.appendChild(responseDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => {
            console.error("Error: ", error);
        })
    }
}
