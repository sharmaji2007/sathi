import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

// Emergency Safety System
const EMERGENCY_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'self harm', 'cut myself', 'hurt myself', 'no reason to live',
  'everyone would be better', 'no one cares', 'worthless', 'hopeless',
  'give up', 'can\'t take it anymore', 'tired of living', 'end it all',
  'suicidal', 'self-harm', 'self harm', 'cutting', 'overdose', 'poison',
  'hang myself', 'jump off', 'crash car', 'gun', 'pills', 'bleed out'
];

const EMERGENCY_RESPONSES = [
  "I'm really concerned about what you're saying. You matter, and your life has value. Please call the National Suicide Prevention Lifeline at 988 or text HOME to 741741 for immediate support. You're not alone, and there are people who care about you and want to help.",
  "I hear how much pain you're in, and I want you to know that you don't have to go through this alone. Please reach out to the Crisis Text Line by texting HOME to 741741, or call 988 for the Suicide Prevention Lifeline. Your feelings are valid, and help is available 24/7.",
  "I'm worried about you, and I want you to stay safe. Please call 988 right now - it's the Suicide Prevention Lifeline, and they have trained counselors available 24/7. You're important, and there are people who want to support you through this difficult time."
];

// Email configuration for emergency alerts
const EMAIL_CONFIG = {
  recipient: 'sharmajitesh2007@gmail.com', // Hardcoded for demo
  subject: '🚨 Emergency Alert - Sathi AI Assistant',
  from: 'sathi-ai@demo.com'
};

// Create email transporter (using Gmail SMTP for demo)
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Emergency notification system with real email alerts
async function sendEmergencyNotification(userMessage) {
  console.log('🚨 EMERGENCY ALERT TRIGGERED 🚨');
  console.log('User message:', userMessage);
  console.log('📧 Sending email to:', EMAIL_CONFIG.recipient);
  
  try {
    // Create email transporter
    const transporter = createEmailTransporter();
    
    // Email content
    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.recipient,
      subject: EMAIL_CONFIG.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2 style="color: #dc2626; margin-top: 0;">Sathi AI Assistant - Emergency Detection</h2>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">⚠️ User Message Detected:</h3>
              <p style="font-style: italic; color: #374151;">"${userMessage}"</p>
            </div>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">✅ Immediate Actions Taken:</h3>
              <ul style="color: #374151;">
                <li>Emergency response message sent to user</li>
                <li>Helpline information provided (988, Crisis Text Line)</li>
                <li>Supportive resources shared</li>
                <li>This alert email sent to counselor</li>
              </ul>
            </div>
            
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <h3 style="color: #3b82f6; margin-top: 0;">📞 Emergency Helplines:</h3>
              <p style="color: #374151; margin: 5px 0;"><strong>Suicide Prevention Lifeline:</strong> 988</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Available:</strong> 24/7</p>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0;">
              <h3 style="color: #d97706; margin-top: 0;">⚠️ Next Steps:</h3>
              <ul style="color: #374151;">
                <li>Review the user's message for severity</li>
                <li>Consider immediate intervention if needed</li>
                <li>Follow up with appropriate support resources</li>
                <li>Document the incident for future reference</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 15px; background-color: #f3f4f6;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                This is an automated alert from Sathi AI Assistant.<br>
                Timestamp: ${new Date().toLocaleString()}<br>
                System: Emergency Safety Protocol v1.0
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Emergency email sent successfully');
    console.log('📧 Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send emergency email:', error.message);
    
    // Fallback: Log to console for demo purposes
    console.log('📧 EMAIL CONTENT (Demo Mode):');
    console.log('To:', EMAIL_CONFIG.recipient);
    console.log('Subject:', EMAIL_CONFIG.subject);
    console.log('Body: Emergency alert triggered for user message containing suicidal/self-harm content');
    console.log('User message:', userMessage);
    
    return { success: false, error: error.message };
  }
}

// Check for emergency keywords
function checkForEmergency(message) {
  const lowerMessage = message.toLowerCase();
  const detectedKeywords = EMERGENCY_KEYWORDS.filter(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  if (detectedKeywords.length > 0) {
    console.log('⚠️ Emergency keywords detected:', detectedKeywords);
    return true;
  }
  return false;
}

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
    geminiInitialized: !!genAI,
    emergencySystem: 'active'
  });
});

// Emergency notification endpoint (for demo purposes)
app.post('/api/emergency', async (req, res) => {
  const { message, userInfo } = req.body;
  console.log('🚨 Emergency notification received:', { message, userInfo });
  
  // Send real emergency email
  const result = await sendEmergencyNotification(message);
  
  res.json({ 
    success: result.success, 
    message: result.success ? 'Emergency email sent successfully' : 'Emergency email failed, but logged',
    timestamp: new Date().toISOString(),
    emailSent: result.success
  });
});

// Chat endpoint with Gemini and emergency safety
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    
    if (!message || message.trim() === '') {
      return res.json({ 
        reply: "Hey there! I'm Sathi, your supportive study buddy and wellness companion. How are you feeling today? I'm here to help with stress, study tips, or just to chat! 🌟" 
      });
    }

    // 🚨 EMERGENCY SAFETY CHECK
    if (checkForEmergency(message)) {
      console.log('🚨 EMERGENCY DETECTED - Providing immediate support');
      
      // Send emergency notification (async)
      sendEmergencyNotification(message).then(result => {
        if (result.success) {
          console.log('✅ Emergency email sent successfully');
        } else {
          console.log('⚠️ Emergency email failed, but user support provided');
        }
      });
      
      // Return emergency response
      const emergencyResponse = EMERGENCY_RESPONSES[Math.floor(Math.random() * EMERGENCY_RESPONSES.length)];
      
      return res.json({ 
        reply: emergencyResponse,
        emergency: true,
        helpline: {
          suicide_prevention: '988',
          crisis_text: '741741',
          message: 'Text HOME to 741741 or call 988 for immediate support'
        }
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

    // 🚨 EMERGENCY SAFETY CHECK for voice
    if (checkForEmergency(message)) {
      console.log('🚨 EMERGENCY DETECTED in voice input - Providing immediate support');
      
      // Send emergency notification (async)
      sendEmergencyNotification(message).then(result => {
        if (result.success) {
          console.log('✅ Emergency email sent successfully');
        } else {
          console.log('⚠️ Emergency email failed, but user support provided');
        }
      });
      
      // Return emergency response
      const emergencyResponse = EMERGENCY_RESPONSES[Math.floor(Math.random() * EMERGENCY_RESPONSES.length)];
      
      return res.json({ 
        replyText: emergencyResponse,
        emergency: true,
        helpline: {
          suicide_prevention: '988',
          crisis_text: '741741',
          message: 'Text HOME to 741741 or call 988 for immediate support'
        }
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
  console.log(`🚨 Emergency Safety System: ✅ Active`);
  console.log(`📧 Emergency Email: ${EMAIL_CONFIG.recipient}`);
  console.log(`📧 Email Config: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing (will use demo mode)'}`);
});


