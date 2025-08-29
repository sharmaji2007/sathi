import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

// Initialize Gemini with better error handling
let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
    console.log('✅ Gemini initialized successfully');
  } else {
    console.log('⚠️ No Gemini API key found - using fallback responses');
  }
} catch (error) {
  console.error('❌ Error initializing Gemini:', error);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasPicovoiceKey: !!process.env.PICOVOICE_ACCESS_KEY,
    geminiInitialized: !!genAI
  });
});

// Chat endpoint with Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    
    if (!message || message.trim() === '') {
      return res.json({ 
        reply: "Hey there! I'm Sathi, your supportive study buddy and wellness companion. How are you feeling today? I'm here to help with stress, study tips, or just to chat! 🌟" 
      });
    }

    // If Gemini is not available, use fallback responses
    if (!genAI) {
      const fallbackResponses = [
        "Hey there! I'm having some technical issues right now, but I want you to know your feelings matter. Try taking 3 deep breaths - inhale for 4, hold for 4, exhale for 6. You've got this! 💪",
        "Thanks for reaching out! While I'm temporarily unavailable, remember to stay hydrated and take short study breaks. A 5-minute walk or some gentle stretching can work wonders for your mood.",
        "I hear you, and I care about how you're feeling. Even though I can't respond properly right now, try journaling your thoughts or doing some face yoga - it's amazing how much it helps!",
        "Your message is important to me. While I'm experiencing some issues, try the Pomodoro technique: 25 minutes of focused work, then a 5-minute break. It's a game-changer for student stress!",
        "I'm here for you, even if I can't respond as usual. Remember to get 7-9 hours of sleep tonight and maybe try some magnesium-rich foods like nuts or dark chocolate for natural stress relief."
      ];
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return res.json({ reply: randomResponse });
    }

    console.log('🤖 Making Gemini API call for:', message.substring(0, 50) + '...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      {
        text: `You are Sathi, a supportive and empathetic mental health companion for students. Your role is to provide practical, actionable advice and emotional support.

IMPORTANT GUIDELINES:
1. NEVER suggest visiting a psychiatrist or doctor unless the user explicitly asks about medical treatment or shows serious suicidal/harmful intent.

2. ALWAYS provide supportive, actionable advice focused on:
   • Breathing exercises: Anulom Vilom, deep breathing (4-4-6 pattern), face yoga, progressive muscle relaxation
   • Nutritional support: zinc, magnesium, iron, vitamin B12, proper hydration, balanced meals
   • Stress management: journaling, meditation, daily walks, yoga, mindfulness exercises
   • Positive routines: sleep schedule (7-9 hours), study breaks (Pomodoro technique), screen-time control, morning routines

3. Keep your tone:
   • Friendly, motivating, and empathetic like a supportive mentor
   • Student-focused and practical
   • Encouraging and solution-oriented
   • Warm and understanding

4. For serious concerns (suicidal thoughts, self-harm):
   • First provide immediate emotional support and safety suggestions
   • Then gently suggest professional help as a supportive option
   • Always prioritize the user's safety and wellbeing

5. Keep responses concise (2-3 sentences) but warm and encouraging.

Remember: You're a supportive friend and mentor, not a medical professional. Focus on practical wellness strategies that students can implement immediately.`
      },
      {
        text: message
      }
    ]);
    
    const reply = result.response.text() || 'I understand. How are you feeling right now?';
    console.log('✅ Gemini response received');
    
    res.json({ reply });
    
  } catch (error) {
    console.error('❌ Chat API Error:', error.message);
    
    // Provide helpful fallback response
    const errorResponses = [
      "Hey! I'm having some connection issues, but your feelings are totally valid. Try this quick stress-buster: close your eyes and take 3 deep breaths. You're doing great! 🌟",
      "Thanks for reaching out! While I'm experiencing some technical difficulties, remember to stay hydrated and maybe try some gentle neck stretches. Small self-care moments make a big difference!",
      "I care about how you're feeling, even if I can't respond properly right now. Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. It really helps!"
    ];
    
    const fallbackResponse = errorResponses[Math.floor(Math.random() * errorResponses.length)];
    res.json({ reply: fallbackResponse });
  }
});

// Voice endpoint (text-only for now)
app.post('/api/voice', async (req, res) => {
  try {
    const { message } = req.body || {};
    
    if (!message) {
      return res.json({ 
        replyText: "Hey there! I'm Sathi, your voice-enabled study buddy. How are you feeling today? I'm here to help with stress, study tips, or just to chat! 🌟" 
      });
    }

    // Use the chat endpoint
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
  console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`🎤 Picovoice Key: ${process.env.PICOVOICE_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`🤖 Gemini Client: ${genAI ? '✅ Ready' : '❌ Not available'}`);
});


