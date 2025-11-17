import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    // Add initial greeting
    if (messages.length === 0) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Bonjour ! Je suis l\'assistant virtuel de DJIVÈDÉ. Comment puis-je vous aider aujourd\'hui ?',
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const processMessage = async (userMessage: string) => {
    try {
      // Track user interaction
      await supabase.from('user_interactions').insert([
        {
          interaction_type: 'chatbot_message',
          interaction_data: { message: userMessage },
          page_url: window.location.pathname
        }
      ]);

      // Here you would typically call your AI service
      // For now, we'll use some basic response logic
      const keywords = userMessage.toLowerCase();
      let response = '';

      if (keywords.includes('bonjour') || keywords.includes('salut')) {
        response = 'Bonjour ! Comment puis-je vous aider ?';
      } else if (keywords.includes('coaching') || keywords.includes('services')) {
        response = 'Je propose des services de coaching en stratégie business. Voulez-vous en savoir plus sur mes programmes ?';
      } else if (keywords.includes('musique') || keywords.includes('concert')) {
        response = 'Découvrez ma musique dans la section Musique. Vous y trouverez mes dernières sorties et dates de concert.';
      } else if (keywords.includes('contact') || keywords.includes('rendez-vous')) {
        response = 'Vous pouvez me contacter via le formulaire de contact ou directement par email à contact@djivede.com';
      } else {
        response = 'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question ?';
      }

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.';
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processMessage(userMessage.content);
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpen}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-coaching-primary text-white shadow-lg flex items-center justify-center hover:bg-coaching-secondary transition-colors z-50"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 flex flex-col ${
              isMinimized ? 'h-auto' : 'h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="bg-coaching-primary p-4 flex items-center justify-between">
              <div className="flex items-center text-white">
                <MessageSquare className="w-5 h-5 mr-2" />
                <span className="font-medium">Assistant DJIVÈDÉ</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleMinimize}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-coaching-primary text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                        <span className="animate-pulse">...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex items-end space-x-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Écrivez votre message..."
                      className="flex-1 resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                      rows={1}
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className="px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;