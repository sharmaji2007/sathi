# Voice-based AI Assistant (Node + Express)

This project records mic audio in the browser, sends it to a backend, performs Speech-to-Text → Chat → Text-to-Speech using OpenAI, and plays the AI's voice reply.

## Features
- Record audio in browser via MediaRecorder
- STT: Transcribe speech to text
- Chat: Send user text to OpenAI and get assistant reply
- TTS: Convert reply text to speech and return base64 mp3
- Combined endpoint that chains STT → Chat → TTS in one call

## Prerequisites
- Node.js 18+
- An OpenAI API key

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
PORT=3001
```

## Run

```bash
npm run dev
```

Open `http://localhost:3001` and click Start Recording, then Stop. You should see the transcribed text, the assistant reply, and hear the spoken response.

## API Endpoints
- POST `/api/stt` multipart/form-data with `audio` field → `{ text }`
- POST `/api/chat` JSON `{ message, history? }` → `{ text }`
- POST `/api/tts` JSON `{ text, voice? }` → `{ audio: base64, mimeType }`
- POST `/api/voice` multipart/form-data with `audio` → `{ userText, replyText, audio, mimeType }`

## Notes
- Models used: `gpt-4o-transcribe` (STT), `gpt-4o-mini` (chat), `gpt-4o-mini-tts` (TTS). Adjust to your access/availability.
- The frontend is a simple static page in `public/index.html`. Replace with React/Vue easily; the contract is just the `/api/voice` endpoint.
- The backend uses Bearer auth via `OPENAI_API_KEY` from `.env`.

## Production Considerations
- Validate audio duration/size and enforce rate limits
- Add retries and structured error handling
- Serve over HTTPS
- Consider streaming responses for lower latency



