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

// Initialize OpenAI with better error handling
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY.trim() // Trim whitespace
    });
    console.log('✅ OpenAI initialized successfully');
  } else {
    console.log('⚠️ No OpenAI API key found - using fallback responses');
  }
} catch (error) {
  console.error('❌ Error initializing OpenAI:', error);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    hasApiKey: !!process.env.OPENAI_API_KEY,
    apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    openaiInitialized: !!openai
  });
});

// Simple chat endpoint with fallback responses
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    
    if (!message || message.trim() === '') {
      return res.json({ 
        reply: "Hello! I'm your Sathi companion. How can I help you today?" 
      });
    }

    // If OpenAI is not available, use fallback responses
    if (!openai) {
      const fallbackResponses = [
        "I understand you're reaching out. While I'm having technical difficulties, remember that you're not alone. Consider talking to a friend, family member, or mental health professional.",
        "Thank you for sharing. I'm currently experiencing some issues, but I want you to know that your feelings are valid. Take a deep breath and know that this moment will pass.",
        "I hear you. Even though I can't respond properly right now, please remember to be kind to yourself. You're doing the best you can.",
        "Your message is important. While I'm temporarily unavailable, try some deep breathing exercises: inhale for 4 counts, hold for 4, exhale for 6.",
        "I'm here for you, even if I can't respond as usual. Remember that seeking help is a sign of strength, not weakness."
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return res.json({ reply: randomResponse });
    }

    console.log('🤖 Making OpenAI API call for:', message.substring(0, 50) + '...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use more reliable model
      messages: [
        {
          role: 'system',
          content: 'You are Sathi, a compassionate mental health companion. Provide supportive, helpful responses focused on mental wellness, stress management, and emotional support. Keep responses concise but warm and encouraging.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const reply = response.choices?.[0]?.message?.content || 'I understand. How are you feeling right now?';
    console.log('✅ OpenAI response received');
    
    res.json({ reply });
    
  } catch (error) {
    console.error('❌ Chat API Error:', error.message);
    
    // Provide helpful fallback response
    const errorResponses = [
      "I'm having trouble connecting right now, but I want you to know that your feelings matter. Try taking a few deep breaths and remember that this moment is temporary.",
      "I'm experiencing some technical difficulties, but please know that you're not alone. Consider reaching out to someone you trust or a mental health professional.",
      "I can't respond properly at the moment, but I care about your wellbeing. Remember to be gentle with yourself today."
    ];
    
    const fallbackResponse = errorResponses[Math.floor(Math.random() * errorResponses.length)];
    res.json({ reply: fallbackResponse });
  }
});

// Simple voice endpoint (text-only for now)
app.post('/api/voice', async (req, res) => {
  try {
    const { message } = req.body || {};
    
    if (!message) {
      return res.json({ 
        replyText: "Hello! I'm your voice assistant. How can I help you today?" 
      });
    }

    // For now, just use the chat endpoint
    const chatResponse = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await chatResponse.json();
    res.json({ replyText: data.reply });
    
  } catch (error) {
    console.error('❌ Voice API Error:', error.message);
    res.json({ 
      replyText: "I'm having trouble with voice processing right now. Please try the text chat instead." 
    });
  }
});

// Serve static frontend
app.use(express.static('public'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`🤖 OpenAI Client: ${openai ? '✅ Ready' : '❌ Not available'}`);
});


