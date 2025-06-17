# 🎵 Gemini Verse Generator

Transform your creative ideas into beautiful verses and then into music using AI! This application combines Google's Gemini AI for verse generation with Suno AI for music creation.

![Gemini Verse Generator](https://v0-gemini-verse-generator.vercel.app)

## ✨ Features

- **🤖 AI-Powered Verse Generation**: Uses Google Gemini to create verses from your ideas
- **🎼 Music Creation**: Transforms verses into full songs using Suno AI
- **🎛️ Customizable Options**: Choose between different Suno models (V3.5, V4, V4.5)
- **🎵 Music Types**: Generate instrumental or vocal music
- **⚡ Real-time Notifications**: Get notified when your music is ready
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔄 Async Processing**: Music generation happens in the background
- **🎧 In-browser Playback**: Listen to your music immediately
- **💾 Download Support**: Download your generated music files

## 🚀 Live Demo

Visit the live application: [https://v0-gemini-verse-generator.vercel.app](https://v0-gemini-verse-generator.vercel.app)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key
- Suno AI API key

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/Music_Generator.git
cd Music_Generator
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Google Gemini API Key (Required)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Suno AI API Key (Required)
SUNO_API_KEY=your_suno_api_key_here

# Production callback URL (automatically configured for Vercel)
PRODUCTION_CALLBACK_URL=https://v0-gemini-verse-generator.vercel.app
\`\`\`

### 4. Get API Keys

#### Google Gemini API Key:
1. Visit [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

#### Suno AI API Key:
1. Visit [Suno AI API](https://apibox.erweima.ai)
2. Sign up for an account
3. Generate an API key
4. Copy the key to your `.env.local` file

### 5. Run Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How to Use

### Step 1: Enter Your Idea
- Type your creative idea in the text area
- Keep it under 500 characters for best results
- Example: "A lonely astronaut floating in space, dreaming of home"

### Step 2: Generate Verse
- Click "Generate Verse" to create a verse from your idea
- Review the generated verse
- Click "Try Again" if you want a different version

### Step 3: Configure Music Settings
- **Model Selection**: Choose between Suno V3.5, V4, or V4.5
  - V3.5: Faster generation
  - V4: Balanced quality and speed (recommended)
  - V4.5: Best quality, takes longer
- **Music Type**: Toggle between instrumental and vocal music

### Step 4: Generate Music
- Click "I Love It! Make Music" to start music generation
- Wait 2-5 minutes for the music to be created
- You'll be notified automatically when it's ready

### Step 5: Enjoy Your Music
- Listen to your music in the browser
- Download the MP3 file
- Share your creation!

## 🔧 Technical Details

### Architecture
- **Frontend**: Next.js 14 with React
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI Integration**: Google Gemini API + Suno AI API
- **Deployment**: Vercel (with automatic callback URL configuration)

### Callback System
The application uses a sophisticated callback system:
- **Production URL**: `https://v0-gemini-verse-generator.vercel.app/api/music-callback`
- **Real-time Polling**: Checks for completed music every 2 seconds
- **Session Management**: Each user gets a unique session ID for tracking

### API Endpoints
- `/api/generate-verse` - Creates verses using Gemini AI
- `/api/generate-music` - Starts music generation with Suno AI
- `/api/music-callback` - Receives completed music from Suno AI
- `/api/check-setup` - Verifies API key configuration
- `/api/ws-notify` - Handles real-time notifications

## 🐛 Troubleshooting

### Common Issues

#### "API configuration required"
- Ensure both `GOOGLE_GENERATIVE_AI_API_KEY` and `SUNO_API_KEY` are set
- Check that API keys are valid and active

#### "Quota exceeded" errors
- Visit [Google AI Studio](https://aistudio.google.com) to check usage
- Enable billing if using the free tier extensively

#### Music generation stuck
- Check the debug pages: `/debug-suno` and `/debug-callback`
- Verify the callback URL is reachable
- Look for task IDs in browser console

#### No music received
- Visit `/manual-check` with your task ID
- Check server logs for callback data
- Ensure your deployment URL is accessible

### Debug Tools

The application includes several debug pages:

- **`/debug-suno`**: Test Suno API connection and parameters
- **`/debug-callback`**: Test the callback notification system
- **`/manual-check`**: Manually check music status with task ID
- **`/test-notifications`**: Test the real-time notification system

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to Vercel**:
   \`\`\`bash
   npm i -g vercel
   vercel
   \`\`\`

2. **Set Environment Variables** in Vercel dashboard:
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `SUNO_API_KEY`

3. **Deploy**:
   \`\`\`bash
   vercel --prod
   \`\`\`

The callback URL is automatically configured to use your Vercel deployment URL.

### Deploy to Other Platforms

For other platforms, update the callback URL in the code:

\`\`\`typescript
// In app/api/generate-music/route.ts
const baseUrl = "https://your-domain.com"
\`\`\`

## 📁 Project Structure

\`\`\`
├── app/
│   ├── api/                 # API routes
│   │   ├── generate-verse/  # Gemini AI integration
│   │   ├── generate-music/  # Suno AI integration
│   │   ├── music-callback/  # Callback handler
│   │   └── ws-notify/       # Notification system
│   ├── debug-*/            # Debug pages
│   ├── manual-check/       # Manual status checker
│   └── page.tsx            # Main application
├── components/
│   └── ui/                 # shadcn/ui components
├── hooks/
│   └── use-music-notifications.ts  # Real-time notifications
└── lib/
    └── utils.ts            # Utility functions
\`\`\`

## 🎛️ Configuration Options

### Suno AI Models
- **V3_5**: Fastest generation, good quality
- **V4**: Balanced speed and quality (default)
- **V4_5**: Best quality, slower generation

### Music Types
- **Vocal**: Includes singing based on your verse
- **Instrumental**: Music only, no vocals

### Rate Limits
- **Gemini API**: Varies by plan and region
- **Suno API**: Check your plan limits
- **Built-in Protection**: Automatic rate limiting in the app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Use the built-in debug tools
3. Check server logs in Vercel dashboard
4. Open an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - Browser console logs
   - Server logs (if available)

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for verse generation
- [Suno AI](https://suno.ai/) for music creation
- [Vercel](https://vercel.com/) for hosting and deployment
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

---

**Made with ❤️ using AI and creativity**
