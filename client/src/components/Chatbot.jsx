import React, { useState, useRef, useEffect } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import robotIcon from '../assets/robot.png';
import userIcon from '../assets/user.png';
import closeIcon from '../assets/close_icon.png';
import sendIcon from '../assets/send_icon.png';
import chatIcon from '../assets/chat_icon.png';


const Chatbot = () => {
  const { axios } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm your GreenGrocery assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const { data } = await axios.post('/api/chat', { message: input });
      const botMessage = { sender: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        sender: 'bot', 
        text: "Zero Credits in API key. This is a Student Project Demo." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-24 right-6 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 ">
          <div className="bg-primary text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">GreenGrocery Assistant</h3>
            <button onClick={() => setIsOpen(false)}>
              <img src={closeIcon} alt="Close" className="w-4 h-4 cursor-pointer" />
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4">
           {messages.map((msg, i) => (
  <div key={i} className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    {msg.sender === 'bot' && (
      <img src={robotIcon} alt="Bot" className="w-6 h-6 rounded-full mr-2 " />
    )}
    <div className={`inline-block p-2 rounded-lg max-w-xs ${
      msg.sender === 'user' 
        ? 'bg-primary text-white' 
        : 'bg-gray-100 text-gray-700'
    }`}>
      {msg.text}
    </div>
    {msg.sender === 'user' && (
      <img src={userIcon} alt="User" className="w-6 h-6 rounded-full ml-2" />
    )}
  </div>
))}


            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 p-2 rounded-lg">Thinking...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-3 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your question..."
              className="flex-1 p-2 border rounded-l focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="bg-primary text-white p-2 rounded-r disabled:opacity-50"
              disabled={loading}
            >
              <img src={sendIcon} alt="Send" className="w-5 h-5 cursor-pointer" />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg z-50"
        >
          <img src={chatIcon} alt="Chat" className="w-6 h-6 cursor-pointer" />
        </button>
      )}
    </>
  );
};

export default Chatbot;
