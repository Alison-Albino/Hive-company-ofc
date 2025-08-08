import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Bot, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import AssistantChat from './AssistantChat';

interface ChatManager {
  activeChats: Map<string, any>;
  assistantOpen: boolean;
}

interface ChatWindowData {
  id: string;
  type: 'provider' | 'assistant';
  providerId?: string;
  providerName?: string;
  providerImage?: string;
  position: number;
}

export default function ChatManager() {
  const [chatState, setChatState] = useState<ChatManager>({
    activeChats: new Map(),
    assistantOpen: false
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Buscar contagem de notificações não lidas
  const { data: notificationData } = useQuery({
    queryKey: ['/api/notifications/count'],
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
      if (!newActiveChats.has(providerId)) {
        newActiveChats.set(providerId, {
          id: providerId,
          type: 'provider',
          providerId,
          providerName,
          providerImage,
          position: newActiveChats.size
        });
      }
      return { ...prev, activeChats: newActiveChats };
    });
  };

  const openAssistant = () => {
    setChatState(prev => ({ ...prev, assistantOpen: true }));
  };

  const closeProviderChat = (providerId: string) => {
    setChatState(prev => {
      const newActiveChats = new Map(prev.activeChats);
      newActiveChats.delete(providerId);
      
      // Reajustar posições dos chats restantes
      let position = 0;
      for (const [id, chat] of newActiveChats) {
        chat.position = position++;
      }
      
      return { ...prev, activeChats: newActiveChats };
    });
  };

  const closeAssistant = () => {
    setChatState(prev => ({ ...prev, assistantOpen: false }));
  };

  // Função global para ser usada por outros componentes
  useEffect(() => {
    (window as any).openProviderChat = openProviderChat;
  }, []);

  return (
    <>
      {/* Botão flutuante principal */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex flex-col items-end space-y-2">
          {/* Botão do Assistente */}
          {!chatState.assistantOpen && (
            <Button
              onClick={openAssistant}
              className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg relative"
            >
              <Bot className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center p-0">
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
            className="rounded-full w-14 h-14 bg-hive-gold hover:bg-hive-gold-dark text-white shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Indicador de chats ativos */}
          {chatState.activeChats.size > 0 && (
            <div className="flex items-center space-x-1 bg-white rounded-full px-3 py-1 shadow-md border">
              <Users className="w-4 h-4 text-hive-gold" />
              <span className="text-sm text-gray-700">{chatState.activeChats.size}</span>
            </div>
          )}
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
          onClose={() => closeProviderChat(id)}
        />
      ))}
    </>
  );
}