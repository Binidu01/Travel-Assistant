# travel-assistant-ai

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

An AI-powered conversational assistant for discovering hotels and planning trips across Sri Lanka.

---

## Overview

A chat interface that helps users find hotels, compare prices, and get recommendations anywhere in Sri Lanka. Powered by a self-hosted Ollama LLM. The API is fully stateless — conversation history is managed on the client and sent with each request.

---

## Environment Variables

Create a `.env` file in the project root:

```env
OLLAMA_API_KEY=your_api_key_here
OLLAMA_API_URL=https://ollama.com/api/chat
OLLAMA_MODEL=gpt-oss:120b-cloud
OLLAMA_TEMPERATURE=0.8
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `OLLAMA_API_KEY` | ![required](https://img.shields.io/badge/required-FF4444?style=flat-square) | — | API key for the Ollama endpoint |
| `OLLAMA_API_URL` | ![optional](https://img.shields.io/badge/optional-gray?style=flat-square) | `https://ollama.com/api/chat` | Ollama chat endpoint |
| `OLLAMA_MODEL` | ![optional](https://img.shields.io/badge/optional-gray?style=flat-square) | `gpt-oss:120b-cloud` | Model used for responses |
| `OLLAMA_TEMPERATURE` | ![optional](https://img.shields.io/badge/optional-gray?style=flat-square) | `0.8` | Model temperature (0.0 – 1.0) |

> ![warning](https://img.shields.io/badge/⚠️_Never_commit_.env_to_version_control-FFAA00?style=flat-square)

---

## Chat API

![POST](https://img.shields.io/badge/POST-/api/chat-4CAF50?style=flat-square)

**Request body:**
```json
{
  "message": "Hotels in Kandy",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! How can I help?" }
  ]
}
```

**Response:**
```json
{
  "reply": "## Hotels in Kandy\n...",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! How can I help?" },
    { "role": "user", "content": "Hotels in Kandy" },
    { "role": "assistant", "content": "## Hotels in Kandy\n..." }
  ],
  "metadata": {
    "history_length": 4,
    "timestamp": "2025-01-01T12:00:00.000Z"
  }
}
```

![GET](https://img.shields.io/badge/GET-/api/chat-2196F3?style=flat-square) Health check — returns service status.

---

## Conversation Memory

![Stateless](https://img.shields.io/badge/Stateless_API-6366F1?style=flat-square)
![Context](https://img.shields.io/badge/15_message_context_window-8B5CF6?style=flat-square)
![Client](https://img.shields.io/badge/History_stored_on_client-EC4899?style=flat-square)

- The server holds no session state — no Maps, no cleanup intervals
- The client stores the `history` array returned by each response
- On every request the client sends the full history back to the server
- The server trims to the last 14 entries and appends the new message, keeping context at 15 messages max

---

## AI Behaviour

![Scope](https://img.shields.io/badge/Scope-Sri_Lanka_Hotels_Only-0EA5E9?style=flat-square)
![Model](https://img.shields.io/badge/Model-gpt--oss:120b--cloud-10B981?style=flat-square)
![Markdown](https://img.shields.io/badge/Responses-Markdown_formatted-F59E0B?style=flat-square)

The assistant is restricted to Sri Lanka hotels and accommodations only. It will:

- Greet users with a time-appropriate greeting
- Answer questions about prices, locations, amenities, and recommendations
- Format all responses in Markdown with relevant emojis
- Politely decline any off-topic questions
- Remember context across the conversation