import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const sendMessage = useAction(api.chat.sendMessage);
  const chatHistory = useQuery(api.chat.getChatHistory, { sessionId });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await sendMessage({
        message: userMessage,
        sessionId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
        <h3 className="font-semibold">Connect Salone AI Assistant</h3>
        <p className="text-sm opacity-90">Ask me about government services, fees, requirements, and more!</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!chatHistory?.length && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-lg font-medium mb-2">Welcome to Connect Salone AI!</p>
            <p className="text-sm">Ask me anything about Sierra Leone government services:</p>
            <div className="mt-4 space-y-2 text-left max-w-md mx-auto">
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                "How do I apply for a passport?"
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                "What are the fees for business registration?"
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                "Where can I get a driver's license in Bo?"
              </div>
            </div>
          </div>
        )}

        {chatHistory?.map((chat, index) => (
          <div key={index} className="space-y-3">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-green-600 text-white p-3 rounded-lg max-w-xs lg:max-w-md">
                <p className="text-sm">{chat.message}</p>
              </div>
            </div>
            
            {/* AI Response */}
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg max-w-xs lg:max-w-md">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">AI</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{chat.response}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">AI</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about government services..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
