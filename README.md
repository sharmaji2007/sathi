# Sathi Voice Assistant

A voice-enabled AI mental health companion built with Node.js, Gemini AI, and Picovoice.

## Features

- 🎤 **Voice Recognition**: Click microphone to start speaking
- 🤖 **AI Chat**: Powered by Google Gemini AI
- 🎵 **Text-to-Speech**: AI responses are spoken back to you
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔒 **Privacy-Focused**: Uses Picovoice for offline voice processing

## Quick Start

### 1. Set Environment Variables
Create a `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PICOVOICE_ACCESS_KEY=WRE4wcoNmd30qFyA8xA4NHBnWKe3t5FMxbW0wZCADhGSO3mu8/0R9Q==
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Application
```bash
npm start
```

### 4. Access the App
- **Main App**: http://localhost:3001
- **Voice Assistant**: http://localhost:3001/voice-chat.html

## Usage

### Voice Assistant
1. Click the microphone button to start listening
2. Speak your message clearly
3. The AI will respond both in text and speech
4. Click the microphone again to stop listening

### Text Chat
1. Type your message in the text input
2. Press Enter or click Send
3. Get AI response with typing animation

## API Endpoints

- `GET /health` - Check server status
- `POST /api/chat` - Send text message, get AI response
- `POST /api/voice` - Voice processing endpoint

## Technologies Used

- **Backend**: Node.js, Express.js
- **AI**: Google Gemini API
- **Voice**: Picovoice (Porcupine + Web Voice Processor)
- **Frontend**: HTML, TailwindCSS, JavaScript
- **TTS**: Web Speech API

## Deployment

### Render.com
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically

### Environment Variables for Render:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PICOVOICE_ACCESS_KEY`: Your Picovoice access key
- `PORT`: 3001 (or let Render set it)

## Browser Support

- Chrome/Edge: Full voice support
- Firefox: Limited voice support
- Safari: Basic functionality

## Troubleshooting

### Voice Not Working?
1. Check browser permissions for microphone
2. Ensure you're using HTTPS (required for voice)
3. Try refreshing the page
4. Check browser console for errors

### AI Not Responding?
1. Verify your Gemini API key is set correctly
2. Check the server logs for errors
3. Ensure you have sufficient Gemini API credits

## License

MIT License - Feel free to use and modify!



