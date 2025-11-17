import React, { useState } from 'react';
import { Search, Plus, Send, Trash2, Star, Archive, Filter, MessageSquare } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

interface Message {
  id: string;
  subject: string;
  content: string;
  sender: {
    name: string;
    email: string;
    avatar: string;
  };
  recipients: string[];
  date: string;
  isStarred: boolean;
  isRead: boolean;
  labels: string[];
}

const MessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      subject: 'Confirmation de réservation',
      content: 'Votre séance de coaching a été confirmée pour le 15 avril 2025 à 14h00.',
      sender: {
        name: 'Sophie Martin',
        email: 'sophie@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
      },
      recipients: ['client@example.com'],
      date: '2025-03-21T14:00:00Z',
      isStarred: true,
      isRead: false,
      labels: ['réservation', 'important']
    },
    {
      id: '2',
      subject: 'Suivi de votre progression',
      content: 'Suite à notre dernière session, voici les points clés que nous avons abordés...',
      sender: {
        name: 'Thomas Bernard',
        email: 'thomas@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
      },
      recipients: ['client@example.com'],
      date: '2025-03-20T10:30:00Z',
      isStarred: false,
      isRead: true,
      labels: ['suivi']
    },
    {
      id: '3',
      subject: 'Documents pour la prochaine session',
      content: 'Veuillez trouver ci-joint les documents préparatoires pour notre prochaine session.',
      sender: {
        name: 'Marie Dubois',
        email: 'marie@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
      },
      recipients: ['client@example.com'],
      date: '2025-03-19T16:45:00Z',
      isStarred: false,
      isRead: true,
      labels: ['documents']
    }
  ]);

  const handleStarMessage = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
    setMessages(messages.filter(msg => msg.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'starred') return matchesSearch && message.isStarred;
    if (filter === 'unread') return matchesSearch && !message.isRead;
    return matchesSearch;
  });

  return (
    <AnimatedSection>
      <div className="h-[calc(100vh-12rem)] flex">
        {/* Sidebar */}
        <div className="w-80 bg-white rounded-l-xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <button
              onClick={() => {/* Implement new message */}}
              className="w-full flex items-center justify-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Nouveau message
            </button>
          </div>

          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 border-none text-sm focus:ring-0"
              >
                <option value="all">Tous les messages</option>
                <option value="unread">Non lus</option>
                <option value="starred">Favoris</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message);
                  handleMarkAsRead(message.id);
                }}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id
                    ? 'bg-coaching-primary/10'
                    : 'hover:bg-gray-50'
                } ${!message.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={message.sender.avatar}
                    alt={message.sender.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{message.sender.name}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(message.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{message.subject}</p>
                    <p className="text-sm text-gray-500 truncate">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare size={48} className="mb-4" />
                <p>Aucun message trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 bg-white rounded-r-xl shadow-lg overflow-hidden">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStarMessage(selectedMessage.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedMessage.isStarred
                          ? 'text-yellow-500 bg-yellow-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <Star size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Archive size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <img
                    src={selectedMessage.sender.avatar}
                    alt={selectedMessage.sender.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{selectedMessage.sender.name}</p>
                      <span className="text-sm text-gray-500">&lt;{selectedMessage.sender.email}&gt;</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedMessage.date).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedMessage.labels.length > 0 && (
                  <div className="flex items-center space-x-2 mt-4">
                    {selectedMessage.labels.map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-coaching-primary/10 text-coaching-primary rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              <div className="p-6 border-t">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Répondre..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  />
                  <button
                    className="px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <MessageSquare size={64} className="mb-4" />
              <p className="text-xl font-medium">Sélectionnez un message</p>
              <p className="text-sm">Cliquez sur un message pour afficher son contenu</p>
            </div>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default MessagesPage;