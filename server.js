import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is not set!');
  console.error('Please set your OpenAI API key in Render environment variables.');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Speech-to-Text: Accepts audio (webm/ogg/wav/m4a/mp3), returns transcript text
app.post('/api/stt', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Missing audio file' });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'gpt-4o-transcribe',
      // Fallback models: 'whisper-1' (if available)
    });

    // Cleanup uploaded file
    fs.unlink(req.file.path, () => {});
    res.json({ text: transcription.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Chat: Accepts {message, history}, returns assistant text
app.post('/api/chat', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.',
        reply: 'I apologize, but I cannot respond right now. The AI service is not properly configured. Please contact the administrator.'
      });
    }

    const { message, history } = req.body || {};
    const messages = [
      ...(Array.isArray(history) ? history : []),
      { role: 'user', content: message || '' }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7
    });

    const reply = response.choices?.[0]?.message?.content || '';
    res.json({ reply });
  } catch (err) {
    console.error('Chat API Error:', err);
    res.status(500).json({ 
      error: 'Chat failed', 
      reply: 'I apologize, but I encountered an error. Please try again later.'
    });
  }
});

// Text-to-Speech: Accepts {text, voice}, returns audio base64 (mp3)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });

    const speech = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: voice || 'alloy',
      input: text,
      format: 'mp3'
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    const base64 = audioBuffer.toString('base64');
    res.json({ audio: base64, mimeType: 'audio/mpeg' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'TTS failed' });
  }
});

// Combined Voice endpoint: accepts audio, does STT->Chat->TTS
app.post('/api/voice', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Missing audio file' });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'gpt-4o-transcribe'
    });
    const userText = transcription.text || '';

    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: userText }],
      temperature: 0.7
    });
    const replyText = chat.choices?.[0]?.message?.content || '';

    const speech = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: replyText,
      format: 'mp3'
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    const base64 = audioBuffer.toString('base64');

    fs.unlink(req.file.path, () => {});
    res.json({ userText, replyText, audio: base64, mimeType: 'audio/mpeg' });
  } catch (err) {
    console.error(err);
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: 'Voice flow failed' });
  }
});

// Serve static frontend
app.use(express.static('public'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));


