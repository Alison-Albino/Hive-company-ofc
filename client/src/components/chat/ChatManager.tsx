import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Bot, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import AssistantChat from './AssistantChat';

interface ChatManagerState {
  activeChats: Map<string, ChatWindowData>;
  assistantOpen: boolean;
  persistedChats: string[]; // IDs das conversas que devem ser mantidas
}

interface ChatWindowData {
  id: string;
  type: 'provider' | 'assistant';
  providerId?: string;
  providerName?: string;
  providerImage?: string;
  position: number;
  isMinimized: boolean;
}

export default function ChatManager() {
  const [chatState, setChatState] = useState<ChatManagerState>({
    activeChats: new Map(),
    assistantOpen: false,
    persistedChats: []
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Buscar contagem de notificações não lidas
  const { data: notificationData } = useQuery({
    queryKey: ['/api', 'notifications', 'count'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (notificationData && typeof notificationData === 'object' && 'count' in notificationData) {
      setUnreadCount((notificationData as { count: number }).count);
    }
  }, [notificationData]);

  const openProviderChat = (providerId: string, providerName: string, providerImage?: string) => {
    setChatState(prev => {
      const newActiveChats = new Map(prev.activeChats);
      const newPersistedChats = [...prev.persistedChats];
      
      if (!newActiveChats.has(providerId)) {
        newActiveChats.set(providerId, {
          id: providerId,
          type: 'provider',
          providerId,
          providerName,
          providerImage,
          position: newActiveChats.size,
          isMinimized: false
        });
        
        // Adicionar à lista de chats persistidos
        if (!newPersistedChats.includes(providerId)) {
          newPersistedChats.push(providerId);
        }
      }
      
      return { 
        ...prev, 
        activeChats: newActiveChats,
        persistedChats: newPersistedChats
      };
    });
  };

  const openAssistant = () => {
    setChatState(prev => ({ ...prev, assistantOpen: true }));
  };

  const closeProviderChat = (providerId: string) => {
    setChatState(prev => {
      const newActiveChats = new Map(prev.activeChats);
      const newPersistedChats = prev.persistedChats.filter(id => id !== providerId);
      
      newActiveChats.delete(providerId);
      
      // Reajustar posições dos chats restantes
      let position = 0;
      for (const [id, chat] of newActiveChats) {
        chat.position = position++;
      }
      
      return { 
        ...prev, 
        activeChats: newActiveChats,
        persistedChats: newPersistedChats
      };
    });
  };

  const closeAssistant = () => {
    setChatState(prev => ({ ...prev, assistantOpen: false }));
  };

  // Função global para ser usada por outros componentes
  useEffect(() => {
    (window as any).openProviderChat = openProviderChat;
  }, []);

  // Persistir estado dos chats no localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('hive-chat-state');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        if (parsedChats.persistedChats && parsedChats.persistedChats.length > 0) {
          setChatState(prev => ({
            ...prev,
            persistedChats: parsedChats.persistedChats
          }));
        }
      } catch (error) {
        console.error('Error loading persisted chats:', error);
      }
    }
  }, []);

  // Salvar estado dos chats no localStorage
  useEffect(() => {
    if (chatState.persistedChats.length > 0) {
      localStorage.setItem('hive-chat-state', JSON.stringify({
        persistedChats: chatState.persistedChats
      }));
    }
  }, [chatState.persistedChats]);

  return (
    <>
      {/* Sistema de bolinhas horizontais */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex items-center space-x-3">
          {/* Bolinhas dos chats ativos dos prestadores */}
          {Array.from(chatState.activeChats.entries()).map(([id, chat]: [string, ChatWindowData], index) => (
            <div key={id} className="relative">
              <Button
                onClick={() => {
                  setChatState(prev => {
                    const newActiveChats = new Map(prev.activeChats);
                    
                    // Minimizar todos os outros chats
                    for (const [otherId, otherChat] of newActiveChats) {
                      if (otherId !== id) {
                        otherChat.isMinimized = true;
                      }
                    }
                    
                    // Alternar o estado do chat clicado
                    const currentChat = newActiveChats.get(id);
                    if (currentChat) {
                      currentChat.isMinimized = !currentChat.isMinimized;
                    }
                    
                    return { ...prev, activeChats: newActiveChats };
                  });
                }}
                className={`rounded-full w-12 h-12 text-white shadow-lg relative transition-all duration-200 hover:scale-110 ${
                  chat.isMinimized ? 'bg-gray-400 hover:bg-gray-500' : 'bg-hive-gold hover:bg-hive-gold-dark'
                }`}
              >
                {chat.providerImage ? (
                  <img 
                    src={chat.providerImage} 
                    alt={chat.providerName} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
                {/* Indicador de mensagens não lidas */}
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                    <span className="text-xs font-bold">!</span>
                  </Badge>
                )}
              </Button>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow whitespace-nowrap">
                {chat.providerName}
              </div>
            </div>
          ))}
          
          {/* Botão do Assistente */}
          {!chatState.assistantOpen && (
            <Button
              onClick={openAssistant}
              className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg relative"
            >
              <Bot className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center p-0">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              </Badge>
            </Button>
          )}
          
          {/* Botão principal de chat */}
          <Button
            onClick={() => {
              if (chatState.activeChats.size === 0 && !chatState.assistantOpen) {
                openAssistant();
              }
            }}
            className="rounded-full w-14 h-14 bg-hive-gold hover:bg-hive-gold-dark text-white shadow-lg relative"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Chat do Assistente */}
      {chatState.assistantOpen && (
        <AssistantChat onClose={closeAssistant} />
      )}

      {/* Chats dos Prestadores - Empilhados */}
      {Array.from(chatState.activeChats.entries()).map(([id, chat]: [string, ChatWindowData]) => (
        <ChatWindow
          key={id}
          providerId={chat.providerId!}
          providerName={chat.providerName!}
          providerImage={chat.providerImage}
          position={chat.position}
          totalChats={chatState.activeChats.size}
          isMinimized={chat.isMinimized}
          onClose={() => closeProviderChat(id)}
          onToggleMinimize={() => {
            setChatState(prev => {
              const newActiveChats = new Map(prev.activeChats);
              const currentChat = newActiveChats.get(id);
              if (currentChat) {
                currentChat.isMinimized = !currentChat.isMinimized;
              }
              return { ...prev, activeChats: newActiveChats };
            });
          }}
        />
      ))}
    </>
  );
}