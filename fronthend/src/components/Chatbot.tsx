import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { api } from '../lib/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am the VendorBridge AI assistant. How can I help you with procurement today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const payload = {
        message: userMessage,
        history: messages 
      };
      
      const res = await api.post('/api/chat', payload);
      const reply = res.data?.reply || "I didn't get that. Could you try again?";
      setMessages([...newHistory, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Sorry, I am having trouble connecting to the server.';
      
      if (error.response?.data?.details) {
        try {
          const detailsObj = JSON.parse(error.response.data.details);
          if (detailsObj.error) {
            errorMessage = `HuggingFace Error: ${detailsObj.error}`;
          }
        } catch (e) {
          errorMessage = `HuggingFace Error: ${error.response.data.details}`;
        }
      }
      
      setMessages([...newHistory, { role: 'assistant', content: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-[#2563EB] text-white rounded-full shadow-lg hover:bg-[#1D4ED8] transition-all z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white border border-[#DBEAFE] rounded-2xl shadow-2xl flex flex-col transition-all origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: '80vh' }}>
        <div className="bg-[#2563EB] text-white p-4 rounded-t-2xl flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold font-nunito">VendorBridge Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[#DBEAFE] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`p-2 rounded-full shrink-0 ${msg.role === 'user' ? 'bg-[#DBEAFE] text-[#1E3A8A]' : 'bg-[#1E3A8A] text-white'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm font-inter shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#2563EB] text-white rounded-tr-sm' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-full bg-[#1E3A8A] text-white shrink-0">
                  <Bot size={14} />
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center h-[42px]">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-[#DBEAFE] rounded-b-2xl">
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 input-field py-2 px-3 text-sm focus:ring-2 focus:ring-[#60A5FA]"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            >
              <Send size={18} className={input.trim() && !isLoading ? 'translate-x-0.5 -translate-y-0.5 transition-transform' : ''} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
