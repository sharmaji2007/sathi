# Deploy Sathi - Mental Health Companion

## Option 1: Render.com (Recommended - Free)

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub account** (if not already connected)
4. **Select your repository**: `sharmaji2007/sathi`
5. **Configure the service**:
   - **Name**: `sathi-mental-health`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. **Add Environment Variables**:
   - Click "Environment" tab
   - Add: `OPENAI_API_KEY` = your OpenAI API key
   - Add: `PORT` = `3001`
7. **Click "Create Web Service"**
8. **Wait for deployment** (2-3 minutes)
9. **Your app will be live at**: `https://sathi-mental-health.onrender.com`

## Option 2: Railway.app (Alternative - Free tier)

1. **Go to [railway.app](https://railway.app)** and sign up
2. **Click "New Project" → "Deploy from GitHub repo"**
3. **Select your repository**: `sharmaji2007/sathi`
4. **Add Environment Variables**:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `PORT` = `3001`
5. **Deploy automatically**
6. **Get your live URL** from the dashboard

## Option 3: Manual Upload (If you prefer)

If you want to upload files manually:

1. **Zip your project folder**
2. **Go to [netlify.com](https://netlify.com)** or **[vercel.com](https://vercel.com)**
3. **Drag and drop your zip file**
4. **Configure environment variables**
5. **Deploy**

## Important Notes:

- **HTTPS Required**: Modern browsers require HTTPS for microphone access
- **API Key**: Keep your OpenAI API key secure and never commit it to Git
- **Free Tier Limits**: Render/Railway free tiers have usage limits
- **Custom Domain**: You can add a custom domain later

## Troubleshooting:

- If deployment fails, check the build logs
- Ensure all files are in the correct structure
- Verify your OpenAI API key is valid
- Check that the port configuration is correct
