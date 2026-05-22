import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import api from '../../services/api';

interface SellerChatPanelProps {
  chats: any[];
}

const SellerChatPanel: React.FC<SellerChatPanelProps> = ({ chats }) => {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      const interval = setInterval(() => fetchMessages(selectedChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const fetchMessages = async (chatId: number) => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
      scrollToBottom();
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const res = await api.post(`/chats/${selectedChat.id}/messages`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (e) {
      alert('Error enviando mensaje');
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', height: '600px', overflow: 'hidden' }}>
      {/* Sidebar: Chat List */}
      <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <h3 className="text-lg">Conversaciones</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No tienes mensajes aún.</p>}
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                width: '100%', textAlign: 'left', padding: '1rem', background: selectedChat?.id === chat.id ? 'var(--bg-secondary)' : 'transparent',
                border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <User size={20} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ margin: 0, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{chat.user?.fullName || 'Cliente'}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tienda: {chat.store?.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main: Chat View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        {selectedChat ? (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <h3 className="text-lg">Chat con {selectedChat.user?.fullName || 'Cliente'}</h3>
            </div>
            
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay mensajes. Saluda al cliente.</p>}
              {messages.map(msg => {
                const isMe = msg.senderType === 'seller';
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', background: isMe ? 'var(--accent-primary)' : 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', borderBottomRightRadius: isMe ? '4px' : '12px', borderBottomLeftRadius: !isMe ? '4px' : '12px' }}>
                    <p style={{ margin: 0, color: 'white' }}>{msg.content}</p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', padding: '1rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', gap: '1rem' }}>
              <input 
                type="text" 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                placeholder="Escribe tu respuesta..." 
                className="input-field" 
                style={{ borderRadius: '24px', background: 'var(--bg-primary)' }} 
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={20} style={{ marginLeft: '-2px' }} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Selecciona una conversación para responder.
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerChatPanel;
