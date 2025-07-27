import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus, MessageSquare, Menu, X, Sparkles, Trash2, Sun, Moon, Mic, MicOff, Download, Settings, Search, FileText, Palette, Zap, Heart, Smile, ThumbsUp, ThumbsDown, Copy, Share2, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import { useHotkeys } from 'react-hotkeys-hook';
import copy from 'copy-to-clipboard';
import { FaReact, FaJs, FaPython, FaHtml5, FaCss3Alt, FaDatabase } from 'react-icons/fa';

const ChatInterface = () => {
  // Core state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);

  // Theme and UI state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // AI and Voice state
  const [aiMode, setAiMode] = useState('friendly');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Reactions and interactions
  const [messageReactions, setMessageReactions] = useState({});
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // AI Modes configuration
  const aiModes = {
    friendly: {
      name: "Friendly",
      description: "Casual and helpful conversations",
      prompt: "You are Zenochat, a helpful AI assistant. Answer the user's question directly and clearly. Be conversational and friendly while providing accurate, useful information."
    },
    professional: {
      name: "Professional", 
      description: "Formal and business-like",
      prompt: "You are Zenochat, a professional AI assistant. Answer the user's question directly with clear, concise, and formal responses. Focus on accuracy and actionable insights."
    },
    creative: {
      name: "Creative",
      description: "Artistic and imaginative",
      prompt: "You are Zenochat, a creative AI assistant. Answer the user's question directly while providing imaginative and innovative perspectives when appropriate."
    },
    technical: {
      name: "Technical",
      description: "Code and technical focus",
      prompt: "You are Zenochat, a technical AI assistant. Answer the user's question directly with detailed technical explanations and code examples when relevant. Be precise and accurate."
    }
  };

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      setRecognition(recognition);
    }
  }, []);

  // Keyboard shortcuts
  useHotkeys('ctrl+enter', () => {
    if (inputMessage.trim()) sendMessage();
  });
  
  useHotkeys('ctrl+n', () => {
    startNewChat();
  });
  
  useHotkeys('ctrl+k', () => {
    setShowSearch(!showSearch);
  });

  // File dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    },
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false)
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: inputMessage,
        sessionId: sessionId
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (recognition && !isListening) {
      recognition.start();
      setIsListening(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const addReaction = (messageId, reaction) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), reaction]
    }));
  };

  const copyMessage = (text, messageId) => {
    copy(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const exportChat = () => {
    const chatData = {
      title: `Zenochat Conversation - ${new Date().toLocaleDateString()}`,
      messages: messages,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenochat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareChat = () => {
    const chatText = messages.map(m => `${m.sender}: ${m.text}`).join('\n\n');
    copy(chatText);
    alert('Chat copied to clipboard!');
  };

  const filteredChatHistory = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const clearChat = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.delete(`${API_URL}/api/chat/${sessionId}`);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    // Save current chat to history if it has messages
    if (messages.length > 0) {
      const chatToSave = {
        id: currentChatId || sessionId,
        title: messages[0]?.text?.substring(0, 30) + (messages[0]?.text?.length > 30 ? '...' : ''),
        messages: [...messages],
        timestamp: new Date().toLocaleString()
      };
      
      setChatHistory(prev => {
        // Remove if already exists, then add to beginning
        const filtered = prev.filter(chat => chat.id !== chatToSave.id);
        return [chatToSave, ...filtered];
      });
    }
    
    // Start new chat
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    setCurrentChatId(newSessionId);
    setMessages([]);
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setSessionId(chat.id);
      setCurrentChatId(chat.id);
    }
  };

  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:relative ${sidebarOpen ? 'w-80 max-w-[85vw]' : 'w-0'} h-full bg-gradient-to-b from-gray-600 via-gray-700 to-black border-r-4 border-gray-800 transition-all duration-500 ease-in-out overflow-hidden shadow-2xl z-50`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 lg:p-8 border-b-4 border-gray-800 bg-gradient-to-r from-gray-700 via-gray-800 to-black">
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Bot size={20} className="lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">Zenochat</h1>
                <p className="text-gray-300 text-sm lg:text-lg">AI Assistant</p>
              </div>
            </div>
            <button 
              onClick={startNewChat}
              className="w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 text-base lg:text-lg text-white hover:bg-gray-600 rounded-2xl transition-all duration-300 border-2 border-gray-600 hover:border-gray-500 hover:shadow-lg transform hover:scale-105 bg-gradient-to-r from-gray-600 to-gray-700"
            >
              <Plus size={18} className="lg:w-5 lg:h-5" />
              New Chat
            </button>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>
          )}

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="space-y-2 lg:space-y-3">
              {filteredChatHistory.map((chat) => (
                <div 
                  key={chat.id}
                  className={`group flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-lg rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                    currentChatId === chat.id 
                      ? 'bg-gray-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => loadChat(chat.id)}
                >
                  <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                    <MessageSquare size={16} className="lg:w-5 lg:h-5" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium text-sm lg:text-base">{chat.title}</div>
                      <div className="text-xs text-gray-400 truncate">{chat.timestamp}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-500 rounded-lg transition-all duration-300 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={12} className="lg:w-4 lg:h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 lg:p-6 border-t border-gray-700 bg-gray-800 rounded-t-3xl shadow-lg transition-all duration-500 ease-in-out">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">Settings</h3>
              
              {/* Clear Chat Option */}
              <div className="space-y-3">
                <button
                  onClick={clearChat}
                  disabled={messages.length === 0}
                  className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-2xl text-white transition-all duration-300 flex items-center gap-2 lg:gap-3 text-sm lg:text-base ${
                    messages.length === 0 
                      ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Trash2 size={16} className="lg:w-5 lg:h-5" />
                  <span>Clear Chat</span>
                </button>
              </div>
            </div>
          )}

          {/* Settings Button */}
          <div className="p-3 lg:p-4 border-t border-gray-700">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`w-full flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-2 lg:py-3 rounded-2xl transition-all duration-300 text-sm lg:text-base ${
                showSettings 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Settings size={18} className="lg:w-5 lg:h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 lg:p-6 border-b-4 shadow-lg ${
          isDarkMode 
            ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' 
            : 'border-gray-400 bg-gradient-to-r from-white to-gray-50'
        }`}>
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 lg:p-3 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-110 ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              {sidebarOpen ? <X size={20} className="lg:w-6 lg:h-6" /> : <Menu size={20} className="lg:w-6 lg:h-6" />}
            </button>
            <h2 className={`text-lg lg:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Chat with Zenochat</h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Voice Input */}
            <button
              onClick={startVoiceInput}
              disabled={isListening}
              className={`p-2 lg:p-3 rounded-2xl transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff size={18} className="lg:w-5 lg:h-5" /> : <Mic size={18} className="lg:w-5 lg:h-5" />}
            </button>

            {/* Search */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 lg:p-3 rounded-2xl transition-all duration-300 ${
                showSearch 
                  ? 'bg-blue-500 text-white' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Search"
            >
              <Search size={18} className="lg:w-5 lg:h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 lg:p-3 rounded-2xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} className="lg:w-5 lg:h-5" /> : <Moon size={18} className="lg:w-5 lg:h-5" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto ${
          isDarkMode 
            ? 'bg-gray-800' 
            : 'bg-gradient-to-b from-purple-50 to-pink-50'
        }`}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-full text-center px-4 lg:px-6 py-6 lg:py-8">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-500 to-gray-700 rounded-3xl flex items-center justify-center mb-6 lg:mb-8 shadow-xl transform hover:scale-110 transition-transform duration-300">
                <Sparkles size={32} className="lg:w-10 lg:h-10 text-white" />
              </div>
              <h2 className={`text-2xl lg:text-3xl font-bold mb-3 lg:mb-4 ${
                isDarkMode 
                  ? 'text-white' 
                  : 'text-gray-800 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent'
              }`}>Welcome to Zenochat!</h2>
              <p className={`max-w-xl mb-6 lg:mb-8 text-base lg:text-lg leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Your AI assistant. Ask me anything - I can help with questions, coding, writing, analysis, and much more!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 max-w-2xl w-full">
                                  <div className={`p-4 lg:p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'
                  }`}>
                    <h3 className={`font-bold mb-2 text-sm lg:text-base ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>💡 Ask Questions</h3>
                    <p className={`text-xs lg:text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Get answers to any questions</p>
                  </div>
                <div className={`p-4 lg:p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' 
                    : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm lg:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>💻 Code Help</h3>
                  <p className={`text-xs lg:text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Programming and debugging</p>
                </div>
                <div className={`p-4 lg:p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' 
                    : 'bg-gradient-to-br from-orange-100 to-yellow-100 border-orange-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm lg:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>✍️ Writing</h3>
                  <p className={`text-xs lg:text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Essays, emails, content</p>
                </div>
                <div className={`p-4 lg:p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' 
                    : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm lg:text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>📊 Analysis</h3>
                  <p className={`text-xs lg:text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Data analysis and insights</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-6xl mx-auto">
                        {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 lg:gap-6 p-4 lg:p-8 ${
                  message.sender === 'user' 
                    ? isDarkMode 
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200'
                    : isDarkMode 
                      ? 'bg-gradient-to-r from-gray-800 to-gray-900' 
                      : 'bg-gradient-to-r from-purple-100 to-pink-100'
                }`}
              >
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  message.sender === 'user' ? 'bg-gradient-to-br from-gray-500 to-gray-700' : 'bg-gradient-to-br from-purple-500 to-pink-600'
                }`}>
                  {message.sender === 'user' ? (
                    <User size={20} className="lg:w-6 lg:h-6 text-white" />
                  ) : (
                    <Bot size={20} className="lg:w-6 lg:h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  {/* Message Content */}
                  <div className={`text-base lg:text-lg leading-relaxed font-medium ${
                    message.isError 
                      ? 'text-red-600' 
                      : isDarkMode 
                        ? 'text-white' 
                        : 'text-gray-800'
                  }`}>
                    {message.sender === 'bot' ? (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div className="relative">
                                <SyntaxHighlighter
                                  style={tomorrow}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-lg my-2"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                                <button
                                  onClick={() => copyMessage(String(children), message.id)}
                                  className="absolute top-2 right-2 p-1 bg-gray-800 text-white rounded opacity-0 hover:opacity-100 transition-opacity"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    ) : (
                      message.text
                    )}
                  </div>

                  {/* File Attachments */}
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-200 rounded-lg">
                          <FileText size={16} className="text-gray-600" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Actions */}
                  <div className="flex items-center justify-between mt-3">
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {message.timestamp}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Copy Button */}
                      <button
                        onClick={() => copyMessage(message.text, message.id)}
                        className={`p-1 rounded transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-600' 
                            : 'hover:bg-gray-300'
                        }`}
                        title="Copy message"
                      >
                        {copiedMessageId === message.id ? (
                          <span className="text-green-600 text-xs">Copied!</span>
                        ) : (
                          <Copy size={14} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                        )}
                      </button>

                      {/* Reactions */}
                      {message.sender === 'bot' && (
                        <div className="flex items-center gap-1">
                          {['👍', '❤️', '😂', '😮', '😢', '😡'].map((reaction) => (
                            <button
                              key={reaction}
                              onClick={() => addReaction(message.id, reaction)}
                              className={`p-1 rounded transition-colors text-sm ${
                                isDarkMode 
                                  ? 'hover:bg-gray-600' 
                                  : 'hover:bg-gray-300'
                              }`}
                            >
                              {reaction}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reactions Display */}
                  {messageReactions[message.id] && messageReactions[message.id].length > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      {messageReactions[message.id].map((reaction, index) => (
                        <span key={index} className={`text-sm px-2 py-1 rounded-full ${
                          isDarkMode 
                            ? 'bg-gray-600' 
                            : 'bg-gray-300'
                        }`}>
                          {reaction}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className={`flex gap-6 p-8 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900' 
                  : 'bg-gradient-to-r from-purple-100 to-pink-100'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 lg:p-8 border-t-4 shadow-lg ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
            : 'bg-gradient-to-r from-white to-gray-50 border-gray-400'
        }`}>
          <div className="max-w-6xl mx-auto">
            


            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-200 rounded-lg">
                    <FileText size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message"
                disabled={isLoading}
                rows={1}
                className={`w-full px-4 lg:px-6 py-3 lg:py-4 pr-28 lg:pr-32 border-2 rounded-2xl resize-none focus:outline-none focus:ring-2 transition-all duration-300 text-base lg:text-lg font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-400' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400 text-gray-800 placeholder-gray-600 focus:border-gray-600 focus:ring-gray-300'
                }`}
                style={{ minHeight: '50px', maxHeight: '150px' }}
              />
              
              {/* Action Buttons */}
              <div className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 lg:gap-2">
                <button
                  onClick={startVoiceInput}
                  disabled={isListening}
                  className={`p-1.5 lg:p-2 rounded-xl transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : isDarkMode 
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                        : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                  }`}
                  title="Voice Input"
                >
                  {isListening ? <MicOff size={14} className="lg:w-4 lg:h-4" /> : <Mic size={14} className="lg:w-4 lg:h-4" />}
                </button>

                <button
                  {...getRootProps()}
                  className={`p-1.5 lg:p-2 rounded-xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                      : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                  }`}
                  title="Upload Files"
                >
                  <FileText size={14} className="lg:w-4 lg:h-4" />
                </button>
                <input {...getInputProps()} />
                
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 lg:p-3 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                >
                  <Send size={18} className="lg:w-5 lg:h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className={`flex flex-col items-center mt-3 text-xs lg:text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-2 lg:gap-4 mb-2 text-center">
                <span className="text-center">BY THE ORDER OF THE PEAKY FUCKIN BLINDERS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 