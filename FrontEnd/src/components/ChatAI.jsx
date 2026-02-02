import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        { 
            role: 'model', 
            parts: [{text: "Hello! I'm your coding assistant. I can help you with this problem, explain concepts, or debug your code. What would you like to know?"}],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        const userMessage = {
            role: 'user', 
            parts: [{text: data.message}],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, userMessage]);
        reset();
        setLoading(true);

        try {
            // Prepare test cases and start code for the backend
            const visibleTestCases = problem?.visibleTestCases || [];
            const hiddenTestCases = problem?.hiddenTestCases || [];
            const testCases = [...visibleTestCases, ...hiddenTestCases];
            
            const startCode = problem?.startCode || [];

            const requestData = {
                messages: data.message, // Just the current message string
                title: problem?.title || "",
                description: problem?.description || "",
                difficulty: problem?.difficulty || "",
                tags: problem?.tags || [],
                testCases: testCases,
                startCode: startCode
            };

            const response = await axiosClient.post("/ai/chat", requestData);

            // Backend returns { message: "response text" }
            const aiResponse = response.data.message || "No response received";
            
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{text: aiResponse}],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{text: "Sorry, I encountered an error. Please try again in a moment."}],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Quick action suggestions
    const quickActions = [
        { text: "Explain the problem", prompt: "Can you explain the problem statement in simpler terms?" },
        { text: "Time complexity", prompt: "What's the expected time complexity for this problem?" },
        { text: "Edge cases", prompt: "What are the edge cases I should consider?" },
        { text: "Solution approach", prompt: "Can you suggest an approach to solve this problem?" }
    ];

    const handleQuickAction = (prompt) => {
        reset({ message: prompt });
        handleSubmit(onSubmit)({ message: prompt });
    };

    // Function to render message content from parts array
    const renderMessageContent = (parts) => {
        if (!parts || !Array.isArray(parts)) {
            return <div>No content available</div>;
        }

        return parts.map((part, index) => {
            const text = part.text || "";
            
            // Check if it's code by looking for code blocks
            if (text.includes('```')) {
                // Split by code blocks
                const parts = text.split(/```([\w]*)\n?/);
                
                return (
                    <div key={index} className="space-y-2">
                        {parts.map((part, i) => {
                            // Odd indices are code blocks
                            if (i % 2 === 1) {
                                return (
                                    <div key={i} className="my-2">
                                        <div className="bg-black/40 rounded-lg p-3 border border-gray-700 overflow-x-auto">
                                            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                                                {parts[i + 1]}
                                            </pre>
                                        </div>
                                    </div>
                                );
                            } else if (part && part.trim() !== '') {
                                // Even indices are regular text
                                return (
                                    <div key={i} className="my-2 whitespace-pre-wrap leading-relaxed">
                                        {part}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                );
            } else {
                return (
                    <div key={index} className="my-2 whitespace-pre-wrap leading-relaxed">
                        {text}
                    </div>
                );
            }
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-gray-900/60 p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">AI Coding Assistant</h3>
                        <p className="text-gray-400 text-sm">Ask questions about this problem</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-400" />
                        <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">AI Powered</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar"
            >
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : "order-1"}`}>
                            {/* Message Bubble */}
                            <div className={`rounded-2xl p-4 ${msg.role === "user" 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none' 
                                : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
                            }`}>
                                <div className="flex items-start gap-2 mb-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        msg.role === "user" ? 'bg-white/20' : 'bg-gray-700'
                                    }`}>
                                        {msg.role === "user" ? 
                                            <User size={12} className="text-white" /> : 
                                            <Bot size={12} className="text-blue-400" />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs opacity-80">
                                            {msg.role === "user" ? "You" : "AI Assistant"} • {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm">
                                    {renderMessageContent(msg.parts)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Quick Actions (only show when no user messages yet) */}
                {messages.length <= 1 && (
                    <div className="mt-4">
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                            <Sparkles size={12} />
                            Quick suggestions:
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action.prompt)}
                                    className="px-3 py-2 text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                                >
                                    {action.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                            <div className="flex items-center gap-2">
                                <Bot size={12} className="text-blue-400" />
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 border-t border-gray-700 bg-gray-900/60 backdrop-blur-sm"
            >
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input 
                            placeholder="Ask about the problem, get hints, or debug code..." 
                            className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-800/70 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                            {...register("message", { 
                                required: "Message is required", 
                                minLength: { value: 2, message: "Message is too short" }
                            })}
                            disabled={loading}
                        />
                        <button 
                            type="submit" 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-400 disabled:opacity-50"
                            disabled={loading}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
                {errors.message && (
                    <div className="mt-2 flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle size={14} />
                        {errors.message.message}
                    </div>
                )}
            </form>
        </div>
    );
}

export default ChatAi;