# Zenochat 🤖

A beautiful and modern chatbot application powered by Google's Gemini AI API. Built with React frontend and Node.js backend.

## Features ✨

- 🤖 **AI-Powered Chat**: Powered by Google's Gemini AI
- 💬 **Real-time Messaging**: Instant responses with typing indicators
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 📱 **Responsive**: Works perfectly on desktop and mobile
- 🧹 **Chat Management**: Clear chat history functionality
- ⚡ **Fast & Lightweight**: Built with Vite for optimal performance

## Tech Stack 🛠️

### Frontend
- React 19
- Vite
- Axios
- Lucide React (Icons)
- Modern CSS with gradients and animations

### Backend
- Node.js
- Express.js
- Google Generative AI (Gemini)
- CORS enabled
- Environment variable support

## Prerequisites 📋

Before you begin, ensure you have:
- Node.js (v16 or higher)
- npm or yarn
- A Google Gemini API key

## Setup Instructions 🚀

### 1. Clone and Navigate
```bash
cd zenochat
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
# Edit config.env and add your Gemini API key
```

### 3. Configure API Key
Edit `backend/config.env` and replace `your_gemini_api_key_here` with your actual Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=5000
```

### 4. Frontend Setup
```bash
# Navigate to react directory
cd ../react

# Install dependencies
npm install
```

### 5. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd react
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints 📡

- `POST /api/chat` - Send a message to the chatbot
- `DELETE /api/chat/:sessionId` - Clear chat history for a session

## Project Structure 📁

```
zenochat/
├── backend/
│   ├── server.js          # Express server with Gemini integration
│   ├── package.json       # Backend dependencies
│   └── config.env         # Environment variables
├── react/
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatInterface.jsx  # Main chat component
│   │   ├── App.jsx        # Main app component
│   │   ├── App.css        # Styling
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
└── README.md
```

## Getting Your Gemini API Key 🔑

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in `backend/config.env`

## Usage 💬

1. Open the application in your browser
2. Type your message in the input field
3. Press Enter or click the send button
4. The AI will respond with helpful information
5. Use the trash icon to clear chat history

## Customization 🎨

### Styling
- Modify `react/src/App.css` to change colors, fonts, and layout
- The app uses CSS custom properties for easy theming

### AI Behavior
- Adjust temperature and max tokens in `backend/server.js`
- Modify the system prompt for different AI personalities

## Troubleshooting 🔧

### Common Issues

1. **API Key Error**: Ensure your Gemini API key is correctly set in `config.env`
2. **CORS Error**: The backend is configured with CORS, but check if ports match
3. **Port Already in Use**: Change the port in `config.env` if 5000 is occupied

### Debug Mode
- Backend logs are displayed in the terminal
- Check browser console for frontend errors
- Network tab shows API requests

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

This project is open source and available under the MIT License.

## Support 💪

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the console logs
3. Ensure all dependencies are installed
4. Verify your API key is valid

---

**Happy Chatting! 🎉** .