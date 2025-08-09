import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
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

interface ChatWindowProps {
  providerId: string;
  providerName: string;
  providerImage?: string;
  position: number;
  totalChats: number;
  onClose: () => void;
}

export default function ChatWindow({
  providerId,
  providerName,
  providerImage,
  position,
  totalChats,
  onClose
}: ChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Calcular posição do chat (empilhado da direita para esquerda)
  const rightOffset = 20 + (position * 320); // 20px base + 320px por chat (300px largura + 20px espaço)
  const bottomOffset = 20;

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
    queryKey: ['/api', 'chat', 'conversations', conversationId, 'messages'],
    enabled: !!conversationId,
    refetchInterval: 3000,
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
      queryClient.invalidateQueries({ queryKey: ['/api', 'notifications'] });
    }
  });

  // Inicializar conversa ao abrir o chat
  useEffect(() => {
    createConversationMutation.mutate(providerId);
  }, [providerId]);

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate({
        message: newMessage,
        receiverId: providerId
      });
    }
  };

  return (
    <div 
      className={`fixed z-30 w-80 ${isMinimized ? 'h-14' : 'h-96'} transition-all duration-300`}
      style={{ 
        right: `${rightOffset}px`, 
        bottom: `${bottomOffset}px`
      }}
    >
      <Card className="w-full h-full shadow-xl border-2 border-hive-gold/20">
        <CardHeader className="p-3 bg-hive-gold text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {providerImage && (
                <Avatar className="w-7 h-7">
                  <img src={providerImage} alt={providerName} className="object-cover" />
                </Avatar>
              )}
              <CardTitle className="text-sm font-medium truncate">
                {providerName}
              </CardTitle>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-hive-gold-dark w-6 h-6 p-0"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-hive-gold-dark w-6 h-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-3.5rem)]">
            {/* Lista de mensagens */}
            <ScrollArea className="flex-1 p-3">
              {messages && messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'mock-user-id' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-2 rounded-lg text-sm ${
                          message.senderId === 'mock-user-id'
                            ? 'bg-hive-gold text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.message}</p>
                        <div className="text-xs mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-6">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Inicie a conversa!</p>
                </div>
              )}
            </ScrollArea>

            {/* Campo de entrada de mensagem */}
            <div className="p-2 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-hive-gold hover:bg-hive-gold-dark text-white w-8 h-8 p-0"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}