const input = document.getElementById("userInput");
const welcomeScreen = document.getElementById("welcome");
const dots = document.querySelector(".dots");
const mute = document.querySelector(".mute");
const sidebar = document.getElementById("sidebar");
let speechEnabled = true;
let inputText = "";
let messages = [];
let currentChat = []; // <<< REQUIRED
let activeChatId = null;   // 👈 tracks currently open chat
const menuBtn = document.getElementById("menuBtn");
const chatArea = document.getElementById("chatArea");


// Load chats from localStorage if exist
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

/* ------------------- SIDEBAR + CHAT HISTORY ------------------- */

function generateChatId() {
    return "chat_" + Date.now();
}

function renderChats() {
    const list = document.getElementById("chatList");
    if (!list) return;

    list.innerHTML = "";

    chatHistory.forEach((chat, index) => {
        const chatRow = document.createElement("div");
        chatRow.style.display = "flex";
        chatRow.style.alignItems = "center";
        chatRow.style.justifyContent = "space-between";
        chatRow.style.marginBottom = "6px";

        const chatItem = document.createElement("div");
        chatItem.className = "chat-item";
        chatItem.innerText = chat.title;
        chatItem.style.flex = "1";        // so text doesn't shrink

        // Load old chat on click
        chatItem.onclick = () => {
            chatArea.innerHTML = "";
            welcomeScreen.style.display = "none";

            activeChatId = chat.id;
            currentChat = [...chat.messages];

            messages = chat.messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            chat.messages.forEach(m => {
                if (m.image) {
                    chatArea.innerHTML += `
                        <div class="botMsg" style="padding:10px;">
                            <p>Generated Image:</p>
                            <img src="${m.image}" style="max-width:100%;border-radius:12px;">
                        </div>
                    `;
                } else {
                    chatArea.innerHTML += `
                        <div class="${m.role === "user" ? "userMsg" : "botMsg"}">
                            ${formatMessage(m.content)}
                        </div>
                    `;
                }
            });

            // Add copy buttons to code blocks in old chat
            chatArea.querySelectorAll(".copy-btn").forEach(btn => {
                btn.onclick = () => {
                    const code = btn.parentElement.querySelector("code").innerText;
                    navigator.clipboard.writeText(code)
                        .then(() => {
                            btn.innerText = "Copied!";
                            setTimeout(() => btn.innerText = "Copy", 1500);
                        })
                        .catch(() => alert("Failed to copy"));
                };
            });
        };

        // ---------------- DELETE BUTTON ----------------
        const del = document.createElement("button");
        del.innerText = "✖";
        del.style.background = "transparent";
        del.style.border = "none";
        del.style.color = "#ff5555";
        del.style.fontSize = "15px";
        del.style.cursor = "pointer";
        del.style.marginLeft = "8px";
        del.title = "Delete Chat";

        del.onclick = (e) => {
            e.stopPropagation(); //Prevents Clicking delete from opening the chat

            chatHistory = chatHistory.filter(c => c.id !== chat.id);
            localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

            if (activeChatId === chat.id) {
                newChat();
            }

            renderChats();
        };

        chatRow.appendChild(chatItem);
        chatRow.appendChild(del);
        list.appendChild(chatRow);
    });
}

function saveChat() {
    if (currentChat.length === 0) return;

    const existingIndex = chatHistory.findIndex(
        chat => chat.id === activeChatId
    );

    const chatData = {
        id: activeChatId,
        title: currentChat.find(m => m.role === "user")?.content.slice(0, 30) || "New Chat",
        messages: [...currentChat]
    };

    if (existingIndex !== -1) {
        chatHistory[existingIndex] = chatData; // update
    } else {
        chatHistory.push(chatData); // new
    }

    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    renderChats();
}

function newChat() {
    if (currentChat.length > 0) saveChat();

    currentChat = [];
    messages = [];
    activeChatId = generateChatId();

    chatArea.innerHTML = "";
    welcomeScreen.style.display = "block";
}

// Sidebar toggle
document.getElementById("menuBtn").addEventListener("click", () => {
    sidebar.style.left = "0px";
});
document.addEventListener("click", function (event) {
    if (!sidebar.contains(event.target) && event.target !== menuBtn) {
        sidebar.style.left = "-300px";   // fixed px
    }
});

// ---- New Chat Button ----
document.getElementById("newChatBtn").onclick = () => {
    newChat();
    sidebar.style.left = "-300px"; // close sidebar after clicking
};

renderChats();  // load on startup

/* ------------------- SPEECH BUTTON ------------------- */

document.getElementById("speechToggle").addEventListener("click", () => {
    speechSynthesis.cancel();
    speechEnabled = !speechEnabled;
    if (!speechEnabled) {
        mute.setAttribute("src", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48ZyBmaWxsPSJub25lIj48cGF0aCBkPSJtMTIuNTkzIDIzLjI1OGwtLjAxMS4wMDJsLS4wNzEuMDM1bC0uMDIuMDA0bC0uMDE0LS4wMDRsLS4wNzEtLjAzNXEtLjAxNi0uMDA1LS4wMjQuMDA1bC0uMDA0LjAxbC0uMDE3LjQyOGwuMDA1LjAybC4wMS4wMTNsLjEwNC4wNzRsLjAxNS4wMDRsLjAxMi0uMDA0bC4xMDQtLjA3NGwuMDEyLS4wMTZsLjAwNC0uMDE3bC0uMDE3LS40MjdxLS4wMDQtLjAxNi0uMDE3LS4wMThtLjI2NS0uMTEzbC0uMDEzLjAwMmwtLjE4NS4wOTNsLS4wMS4wMWwtLjAwMy4wMTFsLjAxOC40M2wuMDA1LjAxMmwuMDA4LjAwN2wuMjAxLjA5M3EuMDE5LjAwNS4wMjktLjAwOGwuMDA0LS4wMTRsLS4wMzQtLjYxNHEtLjAwNS0uMDE4LS4wMi0uMDIybS0uNzE1LjAwMmEuMDIuMDIgMCAwIDAtLjAyNy4wMDZsLS4wMDYuMDE0bC0uMDM0LjYxNHEuMDAxLjAxOC4wMTcuMDI0bC4wMTUtLjAwMmwuMjAxLS4wOTNsLjAxLS4wMDhsLjAwNC0uMDExbC4wMTctLjQzbC0uMDAzLS4wMTJsLS4wMS0uMDF6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEzLjI2IDMuM2ExLjEgMS4xIDAgMCAxIDEuNzM0Ljc4bC4wMDYuMTE0djE1LjYxMmExLjEgMS4xIDAgMCAxLTEuNjQzLjk1N2wtLjA5Ni0uMDYyTDYuNjggMTZINGEyIDIgMCAwIDEtMS45OTUtMS44NUwyIDE0di00YTIgMiAwIDAgMSAxLjg1LTEuOTk0TDQgOGgyLjY4em00LjMyNiA1Ljg3MkwxOSAxMC41ODZsMS40MTQtMS40MTRhMSAxIDAgMSAxIDEuNDE0IDEuNDE0TDIwLjQxNCAxMmwxLjQxNCAxLjQxNGExIDEgMCAwIDEtMS40MTQgMS40MTVMMTkgMTMuNDE0bC0xLjQxNCAxLjQxNWExIDEgMCAwIDEtMS40MTQtMS40MTVMMTcuNTg2IDEybC0xLjQxNC0xLjQxNGExIDEgMCAxIDEgMS40MTQtMS40MTQiLz48L2c+PC9zdmc+");
    }
    else {
        mute.setAttribute("src", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBmaWxsPSIjZmZmZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC42IDUuMTVhLjUuNSAwIDAgMSAuNjgzLS4xODNhMy40OTggMy40OTggMCAwIDEgLjAwMyA2LjA2YS41LjUgMCAwIDEtLjUwMS0uODY1YTIuNSAyLjUgMCAwIDAgMS4yNDctMi4xNjVhMi41IDIuNSAwIDAgMC0xLjI1LTIuMTY0YS41LjUgMCAwIDEtLjE4My0uNjgzeiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTEuNSAyLjM0YS41LjUgMCAwIDEgLjY2My0uMjQ2YTYuNSA2LjUgMCAwIDEgMi43NiAyLjRhNi40OSA2LjQ5IDAgMCAxIDAgNy4wMmE2LjUgNi41IDAgMCAxLTIuNzYgMi40YS41LjUgMCAxIDEtLjQxNy0uOTA5YTUuNCA1LjQgMCAwIDAgMi4zMy0yLjAzYTUuNTEgNS41MSAwIDAgMC0uMDAyLTUuOTRhNS41IDUuNSAwIDAgMC0yLjM0LTIuMDNhLjUuNSAwIDAgMS0uMjQ2LS42NjN6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJtNCA1bDMuMTctMi43N2EuNS41IDAgMCAxIC44MjkuMzc2djEwLjhhLjUuNSAwIDAgMS0uODI5LjM3Nkw0IDExLjAxMkgxLjVhMS41IDEuNSAwIDAgMS0xLjUtMS41di0zYTEuNSAxLjUgMCAwIDEgMS41LTEuNUg0eiIvPjwvc3ZnPg==");
    }
});

function speak(text) {
    if (!speechEnabled) return;
    speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speechSynthesis.speak(speech);
}

/* ------------------- CHAT RESPONSE ------------------- */

// function escapeHTML(str) {
//     return str
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;");
// }

// ---------------- Updated formatMessage with copy buttons ----------------
function formatMessage(text) {
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Code blocks with copy button
    text = text.replace(/```([\s\S]*?)```/g, (_, code) => {
        const escapedCode = code.trim();
        return `
        <div class="code-block-container" style="position:relative;">
            <pre class="code-block"><code>${escapedCode}</code></pre>
            <button class="copy-btn" style="
                position:absolute;
                top:5px;
                right:5px;
                padding:3px 6px;
                font-size:12px;
                cursor:pointer;
                border:none;
                border-radius:4px;
                background:#4caf50;
                color:white;
                
            ">Copy</button>
        </div>
        `;
    });

    text = text.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    text = text.replace(/^- (.*)$/gm, "<li>$1</li>");
    text = text.replace(/(<li>.*<\/li>)+/gs, match => `<ul>${match}</ul>`);
    text = text.replace(/`([^`]+)`/g, "<code class='inline-code'>$1</code>");

    const blocks = text.split(/\n\s*\n/);

    return blocks
        .map(block => {
            if (/^<(h3|ul|pre|div)/.test(block.trim())) return block;
            return `<p>${block.trim()}</p>`;
        })
        .join("");
}

function displayData(data, query) {
    if (dots) dots.style.display = "none";

    const result = data.choices[0].message.content;
    chatArea.style.display = "block";
    welcomeScreen.style.display = "none";

    chatArea.innerHTML += `<p class="userMsg">${query}</p>`;
    chatArea.innerHTML += `
        <div class="botMsg">
            ${formatMessage(result)}
        </div>
    `;

    // store inside current chat
    currentChat.push({ role: "user", content: query });
    currentChat.push({ role: "assistant", content: result });

    // Add copy functionality to code blocks
    chatArea.querySelectorAll(".copy-btn").forEach(btn => {
        btn.onclick = () => {
            const code = btn.parentElement.querySelector("code").innerText;
            navigator.clipboard.writeText(code)
                .then(() => {
                    btn.innerText = "Copied!";
                    setTimeout(() => btn.innerText = "Copy", 1500);
                })
                .catch(() => alert("Failed to copy"));
        };
    });

    speak(result);
}


function triggerChat() {
    const query = input.value.trim();
    if (!query) return;

    chatArea.innerHTML += `<p class="userMsg">${query}</p>`;
    welcomeScreen.style.display = "none";
    chatArea.scrollTop = chatArea.scrollHeight;

    const typing = showTypingIndicator();

    messages.push({ role: "user", content: query });

    fetch("https://chatgpt-42.p.rapidapi.com/chat", {
        method: "POST",
        headers: {
            "x-rapidapi-key": "4d27d93e95msh2a5360fbc54ec8cp18967cjsnb0d2bdd271da",
            "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages
        })
    })
    .then(res => res.json())
    .then(data => {
        typing.remove();

        const reply = data.choices[0].message.content;
        messages.push({ role: "assistant", content: reply });

        chatArea.innerHTML += `
            <div class="botMsg">${formatMessage(reply)}</div>
        `;

        currentChat.push({ role: "user", content: query });
        currentChat.push({ role: "assistant", content: reply });

        chatArea.scrollTop = chatArea.scrollHeight;
        saveChat();
        speak(reply);
    })
    .catch(() => {
        typing.remove();
        chatArea.innerHTML += `
            <div class="botMsg">⚠️ Error connecting to AI</div>
        `;
    });

    input.value = "";
}





/* ------------------- IMAGE GENERATION ------------------- */

function displayIMG(apiResponse) {
    if (dots) dots.style.display = "none";

    const userMsg = messages[messages.length - 1]?.content || "";
    const imgURL = apiResponse?.result?.data?.results?.[0]?.origin;

    if (!imgURL) return;

    chatArea.style.display = "block";
    welcomeScreen.style.display = "none";

    chatArea.innerHTML += `

        <div class="botMsg" style="padding:10px;">
            <p style="margin-bottom:8px;">Generated Image:</p>
            <img 
                src="${imgURL}"
                style="max-width:100%; border-radius:12px;"
                loading="lazy"
            />
        </div>
    `;

    currentChat.push({ role: "user", content: userMsg });
    currentChat.push({
        role: "assistant",
        content: "[Image generated]",
        image: imgURL
    });

    saveChat();
}

function triggerImage() {
    const desc = input.value.trim();
    if (!desc) return;

    chatArea.innerHTML += `<p class="userMsg">${desc}</p>`;
    welcomeScreen.style.display = "none";

    if (dots) dots.style.display = "flex";

    messages.push({ role: "user", content: desc });

    fetch("https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php", {
        method: "POST",
        headers: {
            "x-rapidapi-key": "4d27d93e95msh2a5360fbc54ec8cp18967cjsnb0d2bdd271da",
            "x-rapidapi-host": "ai-text-to-image-generator-flux-free-api.p.rapidapi.com",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: desc,
            style_id: 4,
            size: "1-1"
        })
    })
    .then(res => res.json())
    .then(displayIMG)
    .catch(err => {
        if (dots) dots.style.display = "none";
        console.error(err);
        chatArea.innerHTML += `<div class="botMsg">⚠️ Image generation failed</div>`;
    });

    input.value = "";
}


/* ------------------- MESSAGE CHECK ------------------- */

function isImageRequest(text) {
    const keywords = ["generate", "create", "draw", "make", "image", "photo", "picture", "art", "design"];
    return keywords.some(word => text.toLowerCase().includes(word));
}

function chatCheck() {
    const text = input.value.trim();
    if (!text) return;

    if (isImageRequest(text)) triggerImage();
    else triggerChat();
}

document.addEventListener("keydown", e => {
    if (e.key === "Enter") chatCheck();
});


function showTypingIndicator() {
    const div = document.createElement("div");
    div.className = "botMsg";
    div.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
    return div;
}


renderChats();