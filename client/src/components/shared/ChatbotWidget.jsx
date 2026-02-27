import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

/**
 * ChatbotWidget Component
 * A floating chat widget with AI-powered responses
 */
const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [faqs, setFaqs] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch FAQs on mount
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await axios.get(`${API_BASE}/chatbot/faq`);
                setFaqs(res.data);
            } catch (err) {
                console.error('Failed to fetch FAQs:', err);
            }
        };
        fetchFaqs();
    }, []);

    // Add initial greeting when opening
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 1,
                    type: 'bot',
                    content: "Hi! I'm your NexHire assistant. How can I help you today?",
                    timestamp: new Date()
                }
            ]);
        }
    }, [isOpen]);

    // Focus input when opening
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async (messageText = inputValue) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: messageText.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const res = await axios.post(`${API_BASE}/chatbot/message`, {
                message: messageText.trim(),
                sessionId
            });

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: res.data.response,
                intent: res.data.intent,
                confidence: res.data.confidence,
                interactionId: res.data.interactionId,
                timestamp: new Date()
            };

            if (!sessionId) {
                setSessionId(res.data.sessionId);
            }

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error('Chatbot error:', err);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: "Sorry, I'm having trouble responding right now. Please try again later.",
                isError: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleFaqClick = (question) => {
        sendMessage(question);
    };

    const handleFeedback = async (messageId, wasHelpful) => {
        const message = messages.find(m => m.id === messageId);
        if (!message?.interactionId) return;

        try {
            await axios.post(`${API_BASE}/chatbot/feedback`, {
                interactionId: message.interactionId,
                wasHelpful
            });

            // Update message to show feedback was given
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, feedbackGiven: wasHelpful } : m
            ));
        } catch (err) {
            console.error('Feedback error:', err);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-8 right-8 w-14 h-14 lg:w-16 lg:h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/30 hover:scale-110 transition-all z-[100] ${isOpen ? 'hidden' : 'animate-bounce'}`}
            >
                <MessageCircle size={24} className="text-white lg:w-7 lg:h-7" />
            </button>

            {/* Chat Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-end justify-end p-4 lg:p-8">
                    <div className="w-full max-w-[400px] h-[500px] lg:h-[550px] glass-card rounded-[2rem] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                        {/* Chat Header */}
                        <div className="p-4 lg:p-6 bg-indigo-600 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-white font-black text-sm">NexHire Assistant</div>
                                    <div className="text-white/70 text-[10px] font-bold uppercase">AI-Powered Help</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {msg.type === 'bot' && (
                                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex-shrink-0 flex items-center justify-center">
                                            <MessageCircle size={14} className="text-white" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] ${msg.type === 'user'
                                        ? 'bg-indigo-500 text-white rounded-2xl rounded-tr-none'
                                        : 'bg-[var(--bg-accent)] text-[var(--text-primary)] rounded-2xl rounded-tl-none'
                                        } p-3 text-xs font-medium whitespace-pre-wrap`}>
                                        {msg.content}
                                        <div className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
                                            {formatTime(msg.timestamp)}
                                        </div>

                                        {/* Feedback buttons for bot messages */}
                                        {msg.type === 'bot' && !msg.isError && msg.interactionId && (
                                            <div className="flex gap-2 mt-2 pt-2 border-t border-[var(--border-primary)]">
                                                {msg.feedbackGiven ? (
                                                    <span className="text-[10px] text-[var(--text-muted)]">
                                                        Thanks for feedback!
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleFeedback(msg.id, true)}
                                                            className="flex items-center gap-1 text-[10px] text-emerald-500 hover:text-emerald-400"
                                                        >
                                                            <ThumbsUp size={12} /> Helpful
                                                        </button>
                                                        <button
                                                            onClick={() => handleFeedback(msg.id, false)}
                                                            className="flex items-center gap-1 text-[10px] text-rose-500 hover:text-rose-400"
                                                        >
                                                            <ThumbsDown size={12} /> Not helpful
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex-shrink-0 flex items-center justify-center">
                                        <MessageCircle size={14} className="text-white" />
                                    </div>
                                    <div className="bg-[var(--bg-accent)] p-3 rounded-2xl rounded-tl-none">
                                        <Loader2 size={16} className="text-indigo-500 animate-spin" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies - Show more FAQs with categories */}
                        {messages.length <= 2 && faqs.length > 0 && (
                            <div className="px-4 pb-2">
                                <div className="text-[10px] text-[var(--text-muted)] mb-2 font-bold uppercase">Quick Questions</div>
                                <div className="flex flex-wrap gap-2">
                                    {faqs.slice(0, 8).map((faq) => (
                                        <button
                                            key={faq.id}
                                            onClick={() => handleFaqClick(faq.question)}
                                            className="text-[10px] px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full hover:bg-indigo-500/20 transition-colors flex items-center gap-1"
                                        >
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                                            {faq.question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chat Input */}
                        <div className="p-4 border-t border-[var(--border-primary)] flex-shrink-0">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your question..."
                                    disabled={isLoading}
                                    className="flex-1 bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;
