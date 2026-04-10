# Kalix AI 🤖

A sleek, dark-themed AI chat web application powered by GPT-4o-mini and a Flux-based image generation API. Kalix supports multi-turn conversations, AI image generation, text-to-speech, and persistent chat history — all in a clean, responsive single-page interface.

---

## ✨ Features

- **AI Chat** — Multi-turn conversations using GPT-4o-mini via the RapidAPI ChatGPT-42 endpoint
- **Image Generation** — Text-to-image generation using the Flux Free API, triggered automatically by image-related keywords
- **Text-to-Speech** — AI responses are read aloud using the browser's Web Speech API, with a toggle button in the navbar
- **Persistent Chat History** — Conversations are saved to `localStorage` and restored on reload
- **Sidebar Chat Manager** — Browse, load, and delete previous chats from a slide-out sidebar
- **New Chat** — Start a fresh conversation at any time without losing previous ones
- **Smart Message Routing** — Automatically detects whether a message is a chat query or an image request
- **Markdown-like Formatting** — Bot responses render code blocks (with copy buttons), inline code, headings, and bullet lists
- **Responsive Design** — Works on desktop, tablet, and mobile screens

---

## 🗂️ Project Structure

```
kalix-ai/
├── index.html       # Main UI layout, styles, and HTML structure
├── script.js        # All app logic: chat, image gen, speech, history
└── image.png        # Kalix logo (favicon + welcome screen)
```

---

## 🚀 Getting Started

No build step or dependencies required. This is a pure HTML + JavaScript project.

1. Clone or download this repository.
2. Place `index.html`, `script.js`, and `image.png` in the same folder.
3. Open `index.html` in any modern browser.

> **Note:** The app uses hardcoded RapidAPI keys in `script.js`. Replace them with your own keys before deploying publicly (see [Configuration](#-configuration)).

---

## ⚙️ Configuration

The following API keys are embedded in `script.js` and should be replaced with your own:

```js
// Chat API
headers: {
    "x-rapidapi-key": "YOUR_RAPIDAPI_KEY",
    "x-rapidapi-host": "chatgpt-42.p.rapidapi.com"
}

// Image Generation API
headers: {
    "x-rapidapi-key": "YOUR_RAPIDAPI_KEY",
    "x-rapidapi-host": "ai-text-to-image-generator-flux-free-api.p.rapidapi.com"
}
```

Sign up at [RapidAPI](https://rapidapi.com) to obtain your key.

---

## 💬 Usage

| Action | How |
|--------|-----|
| Send a message | Type and press **Enter** or click **➤** |
| Generate an image | Include words like *generate*, *draw*, *create*, *picture*, etc. |
| Toggle speech | Click the speaker icon in the top-right navbar |
| Open chat history | Click **☰** (hamburger menu) in the top-left |
| Start a new chat | Click **+ New Chat** in the sidebar |
| Delete a chat | Click **✖** next to a chat in the sidebar |
| Copy code from a response | Click the **Copy** button on any code block |

---

## 🧠 How It Works

### Chat Routing

Every message is checked by `isImageRequest()`, which scans for keywords like `generate`, `draw`, `image`, `photo`, `art`, etc. If matched, the message is routed to `triggerImage()`; otherwise it goes to `triggerChat()`.

### Chat (GPT-4o-mini)

`triggerChat()` maintains a rolling `messages` array (the full conversation history) and sends it to the ChatGPT-42 RapidAPI endpoint on every turn, enabling multi-turn context.

### Image Generation (Flux)

`triggerImage()` sends the prompt to the Flux Free API with `style_id: 4` and `size: "1-1"`. The returned image URL is rendered directly into the chat area.

### Persistence

`saveChat()` serializes the current conversation to `localStorage` under a unique `chat_id`. On load, `renderChats()` reads this data and populates the sidebar. Chats are updated in-place on subsequent messages.

### Text-to-Speech

`speak()` uses `window.speechSynthesis` (Web Speech API) with `en-US` locale. Speech can be toggled on/off without refreshing the page.

---

## 🎨 UI Highlights

- Dark theme (`#0e0e0e` background) with a gradient logo title
- Floating logo animation on the welcome screen
- Animated typing indicator (bouncing dots) while waiting for a response
- Bubble-style chat messages — user messages right-aligned, bot messages left-aligned
- Sidebar slides in/out and closes automatically when clicking outside
- Fully responsive via CSS media queries for mobile, tablet, and desktop

---

## 🔒 Security Notice

> API keys are currently hardcoded in `script.js`. **Do not expose this project publicly** without moving keys to a backend proxy or environment variable system. Anyone with access to your source code can use your API quota.

---

## 🛠️ Technologies Used

- **HTML5 / CSS3** — UI structure and styling
- **Vanilla JavaScript** — All logic, no frameworks
- **Web Speech API** — Text-to-speech
- **localStorage** — Chat persistence
- **RapidAPI** — GPT-4o-mini (ChatGPT-42) and Flux image generation
- **Google Fonts** — Inter and Google Sans typefaces

---

## 📄 License

This project is open for personal and educational use. Please replace API keys and review RapidAPI's terms of service before any commercial deployment.
