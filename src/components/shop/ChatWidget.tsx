import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import api from '../../services/api';

interface ChatWidgetProps {
  storeId: number;
  storeName: string;
  themeColor?: string;
  isLoggedIn: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ storeId, storeName, themeColor = '#6366f1', isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && isLoggedIn && !chat) {
      initChat();
    }
  }, [isOpen, isLoggedIn]);

  const initChat = async () => {
    try {
      const chatRes = await api.get(`/chats/store/${storeId}`);
      setChat(chatRes.data);
      fetchMessages(chatRes.data.id);
      
      // Auto refresh messages every 5 seconds
      const interval = setInterval(() => fetchMessages(chatRes.data.id), 5000);
      return () => clearInterval(interval);
    } catch (e) {
      console.error('Failed to init chat', e);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const msgs = await api.get(`/chats/${chatId}/messages`);
      setMessages(msgs.data);
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
    if (!newMessage.trim() || !chat) return;

    try {
      const res = await api.post(`/chats/${chat.id}/messages`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (e) {
      alert('Error enviando mensaje');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
        style={{ 
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 40, 
          borderRadius: '50%', width: '60px', height: '60px', 
          display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          background: themeColor, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{ 
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50, 
          width: '350px', height: '500px', display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden'
        }}>
          <div style={{ background: themeColor, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
            <div>
              <h4 style={{ margin: 0, fontWeight: 600 }}>Chat con {storeName}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Soporte en vivo</p>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20}/></button>
          </div>

          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-primary)' }}>
            {!isLoggedIn ? (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <MessageCircle size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                <p>Debes iniciar sesión como cliente para chatear con la tienda.</p>
                <a href="/login" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Iniciar Sesión</a>
              </div>
            ) : !chat ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Iniciando chat...</div>
            ) : (
              <>
                {messages.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>Envía un mensaje para comenzar la conversación.</p>}
                {messages.map(msg => {
                  const isMe = msg.senderType === 'buyer';
                  return (
                    <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', background: isMe ? themeColor : 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomRightRadius: isMe ? '4px' : '12px', borderBottomLeftRadius: !isMe ? '4px' : '12px' }}>
                      <p style={{ margin: 0, color: 'white', fontSize: '0.95rem' }}>{msg.content}</p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {isLoggedIn && chat && (
            <form onSubmit={handleSend} style={{ display: 'flex', padding: '0.75rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
              <input 
                type="text" 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                placeholder="Escribe un mensaje..." 
                className="input-field" 
                style={{ borderRadius: '20px', padding: '0.5rem 1rem', flex: 1, border: 'none', background: 'var(--bg-primary)' }} 
              />
              <button type="submit" style={{ background: themeColor, border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.5rem', cursor: 'pointer' }}>
                <Send size={18} style={{ marginLeft: '-2px' }} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
