import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: string;
  title: string;
  participantIds: string[];
  lastMessage: string | null;
  lastMessageAt: string;
}

interface ChatWidgetProps {
  providerId?: string;
  providerName?: string;
  providerImage?: string;
}

export default function ChatWidget({ providerId, providerName, providerImage }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Buscar ou criar conversa com o provedor
  const createConversationMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await apiRequest('POST', '/api/chat/conversations', { providerId });
      return response.json();
    },
    onSuccess: (conversation: Conversation) => {
      setConversationId(conversation.id);
    }
  });

  // Buscar mensagens da conversa
  const { data: messages, refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
    refetchInterval: 3000, // Atualizar a cada 3 segundos
  });

  // Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, receiverId }: { message: string; receiverId: string }) => {
      if (!conversationId) throw new Error('No conversation');
      const response = await apiRequest('POST', `/api/chat/conversations/${conversationId}/messages`, {
        message,
        receiverId
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Buscar contagem de notificações não lidas
  const { data: notificationData } = useQuery({
    queryKey: ['/api/notifications/count'],
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  useEffect(() => {
    if (notificationData && 'count' in notificationData) {
      setUnreadCount((notificationData as { count: number }).count);
    }
  }, [notificationData]);

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStartChat = () => {
    if (providerId) {
      createConversationMutation.mutate(providerId);
    }
    setIsOpen(true);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && providerId) {
      sendMessageMutation.mutate({
        message: newMessage,
        receiverId: providerId
      });
    }
  };

  if (!isOpen && !providerId) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-hive-gold hover:bg-hive-gold-dark text-white shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Botão para abrir o chat quando há um provedor específico */}
      {providerId && !isOpen && (
        <Button
          onClick={handleStartChat}
          className="bg-hive-gold hover:bg-hive-gold-dark text-white"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Conversar
        </Button>
      )}

      {/* Widget do chat */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 z-50 w-96 h-[500px] ${isMinimized ? 'h-14' : ''} transition-all duration-300`}>
          <Card className="w-full h-full shadow-xl">
            <CardHeader className="p-4 bg-hive-gold text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {providerImage && (
                    <Avatar className="w-8 h-8">
                      <img src={providerImage} alt={providerName} className="object-cover" />
                    </Avatar>
                  )}
                  <CardTitle className="text-lg">
                    {providerName || 'Chat Hive'}
                  </CardTitle>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-hive-gold-dark"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-hive-gold-dark"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="p-0 flex flex-col h-[calc(100%-4rem)]">
                {/* Lista de mensagens */}
                <ScrollArea className="flex-1 p-4">
                  {messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 'user' || message.senderId === 'mock-user-id' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] p-3 rounded-lg ${
                              message.senderId === 'user' || message.senderId === 'mock-user-id'
                                ? 'bg-hive-gold text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className="text-xs mt-1 opacity-70">
                              {(() => {
                                try {
                                  const date = new Date(message.createdAt);
                                  return isNaN(date.getTime()) ? 'Agora' : date.toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                } catch {
                                  return 'Agora';
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 mt-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Inicie a conversa!</p>
                      <p className="text-sm">Envie uma mensagem para começar o chat.</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Campo de entrada de mensagem */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="bg-hive-gold hover:bg-hive-gold-dark text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}