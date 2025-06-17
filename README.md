# Gemini Verse Generator

Transform your creative ideas into beautiful verses, then into AI-generated music using Google Gemini and Suno AI.

## 🎵 What It Does

1. **Idea to Verse**: Enter your creative idea and AI generates a poetic verse
2. **Verse to Music**: Transform that verse into a complete song with vocals or instrumental
3. **Real-time Notifications**: Get notified when your music is ready
4. **Download & Play**: Listen in-browser or download your generated music

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **AI Services**: 
  - Google Gemini (verse generation)
  - Suno AI (music generation)
- **Real-time Updates**: HTTP polling with callback system
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, you'll need:

1. **Google Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create or sign in to your Google account
   - Generate an API key
   - Free tier available with generous limits

2. **Suno API Key**
   - Visit [Suno API Documentation](https://docs.sunoapi.org)
   - Sign up for an account
   - Get your API key from the dashboard
   - Paid service with various pricing tiers

## 🚀 Getting Started

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

### 3. Set Up Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Required: Google Gemini API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Required: Suno API Key  
SUNO_API_KEY=your_suno_api_key_here

# Optional: Custom callback URL (auto-detected if not set)
# CALLBACK_BASE_URL=https://yourdomain.com
\`\`\`

**Important**: Never commit your \`.env.local\` file to version control. It's already included in \`.gitignore\`.

### 4. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test the Setup

1. Visit [http://localhost:3000/setup](http://localhost:3000/setup) to verify your API keys are working
2. Try generating a verse from an idea
3. Generate music from your verse

## 🎯 How to Use

### Step 1: Generate a Verse
1. Enter your creative idea (e.g., "A sunset over the ocean")
2. Click "Generate Verse"
3. Review the generated verse
4. Click "Regenerate" if you want a different version, or "Make Music" to proceed

### Step 2: Configure Music Settings
1. **Choose Model**: 
   - V3.5 (Faster, good quality)
   - V4 (Balanced - recommended)
   - V4.5 (Best quality, slower)
2. **Select Type**:
   - With Vocals (singing based on your verse)
   - Instrumental (music only)

### Step 3: Generate Music
1. Click "Generate Music"
2. Wait for the music to be created (2-5 minutes)
3. You'll see real-time status updates
4. When complete, you can play the music in-browser or download it

## 🔧 Features

### Verse Generation
- Powered by Google Gemini AI
- Supports various creative prompts
- Regenerate option for different variations
- Rate limited to prevent abuse

### Music Generation
- Powered by Suno AI
- Multiple model options (V3.5, V4, V4.5)
- Vocal and instrumental options
- Real-time status updates
- Automatic callback system

### User Interface
- Clean, responsive design
- Real-time notifications
- Audio player with controls
- Download functionality
- Debug tools for troubleshooting

## 🐛 Troubleshooting

### Common Issues

#### "API key not configured" Error
- Make sure your \`.env.local\` file exists in the root directory
- Verify your API keys are correct and have no extra spaces
- Restart the development server after adding environment variables

#### Verse Generation Fails
- Check your Google Gemini API key
- Verify you haven't exceeded the free tier limits
- Try a shorter or simpler prompt

#### Music Generation Fails
- Verify your Suno API key is correct
- Check if you have sufficient credits in your Suno account
- Try a shorter verse (Suno has character limits)

#### Music Completed But Not Showing
- Check the browser console for errors
- Visit \`/manual-check\` and enter your task ID
- Ensure your app is accessible from the internet (for callbacks)

### Debug Tools

The app includes several debug pages:

- \`/setup\` - Check API configuration
- \`/debug-suno\` - Test Suno API integration
- \`/debug-callback\` - Test callback system
- \`/manual-check\` - Manually check music status
- \`/test-notifications\` - Test notification system

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - \`GOOGLE_GENERATIVE_AI_API_KEY\`
     - \`SUNO_API_KEY\`
   - Deploy!

3. **Automatic Features**:
   - \`VERCEL_URL\` is automatically set
   - Callback URLs work automatically
   - HTTPS enabled by default

### Deploy to Other Platforms

For other platforms:
1. Set the same environment variables
2. Optionally set \`CALLBACK_BASE_URL\` to your domain
3. Ensure your platform supports Node.js API routes

## 📁 Project Structure

\`\`\`
Music_Generator/
├── app/
│   ├── api/                    # API routes
│   │   ├── check-setup/        # Verify API configuration
│   │   ├── generate-verse/     # Gemini verse generation
│   │   ├── generate-music/     # Suno music generation
│   │   ├── music-callback/     # Suno callback handler
│   │   └── ws-notify/          # Notification system
│   ├── debug-*/                # Debug pages
│   ├── manual-check/           # Manual music status check
│   ├── setup/                  # Setup instructions
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main application
├── components/
│   └── ui/                     # shadcn/ui components
├── hooks/
│   └── use-music-notifications.ts  # Real-time notifications
├── lib/
│   └── utils.ts                # Utility functions
├── public/                     # Static assets
├── .env.local                  # Environment variables (create this)
├── .gitignore                  # Git ignore rules
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind configuration
└── README.md                   # This file
\`\`\`

## 🔑 API Keys Setup Guide

### Getting Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add it to your \`.env.local\` file

### Getting Suno API Key

1. Visit [Suno API](https://docs.sunoapi.org)
2. Create an account
3. Navigate to your dashboard
4. Find your API key
5. Add it to your \`.env.local\` file

## 💡 Tips for Best Results

### Verse Generation
- Be specific with your ideas
- Use descriptive language
- Keep prompts under 500 characters
- Try different angles if first result isn't perfect

### Music Generation
- Shorter verses work better (under 200 words)
- V4 model offers the best balance
- Vocal mode works well with lyrical verses
- Instrumental mode is great for abstract verses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature-name\`
3. Make your changes
4. Test thoroughly
5. Commit: \`git commit -m 'Add feature'\`
6. Push: \`git push origin feature-name\`
7. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for verse generation
- [Suno AI](https://suno.ai/) for music generation
- [Next.js](https://nextjs.org/) for the framework
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Use the debug pages (\`/setup\`, \`/debug-suno\`, etc.)
3. Check the browser console for error messages
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment details

---

**Transform your creativity into music with AI!** 🎵✨
