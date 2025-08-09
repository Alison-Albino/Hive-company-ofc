import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useChatContext } from '@/context/ChatContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  Info, 
  MoreHorizontal,
  ArrowLeft,
  MessageCircle,
  Users,
  Bot,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantImage?: string;
  participantType: 'provider' | 'assistant';
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'provider' | 'assistant';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { setIsChatPageOpen } = useChatContext();

  // Desabilitar popups quando a página de chat estiver aberta
  useEffect(() => {
    setIsChatPageOpen(true);
    return () => setIsChatPageOpen(false);
  }, [setIsChatPageOpen]);

  // Buscar todas as conversas
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api', 'chat', 'conversations'],
    refetchInterval: 5000,
  });

  // Buscar mensagens da conversa selecionada
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['/api', 'chat', 'conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  // Buscar perfis de prestadores para exibir informações
  const { data: providers = [] } = useQuery<any[]>({
    queryKey: ['/api', 'profiles'],
  });

  // Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      return await apiRequest('POST', `/api/chat/conversations/${conversationId}/messages`, { message });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api', 'chat'] });
    }
  });

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filtrar conversas por busca
  const filteredConversations = conversations.filter(conv =>
    conv.participantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate({
        conversationId: selectedConversation,
        message: newMessage.trim()
      });
    }
  };

  const selectedConvData = conversations.find(c => c.id === selectedConversation);
  const selectedProvider = providers.find((p: any) => p.id === selectedConvData?.participantId);

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Agora';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Agora';
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Agora';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Agora';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar - Lista de Conversas */}
        <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 flex-col bg-white dark:bg-gray-800 border-r`}>
          {/* Header da Sidebar */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chat</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-hive-gold text-white">
                  {conversations.length}
                </Badge>
              </div>
            </div>
            
            {/* Barra de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Conversas */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedConversation === conversation.id 
                      ? 'bg-hive-gold/10 border-l-4 border-hive-gold' 
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        {conversation.participantType === 'assistant' ? (
                          <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <>
                            <AvatarImage src={conversation.participantImage} />
                            <AvatarFallback className="bg-hive-gold text-white">
                              {(conversation.participantName || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {conversation.participantName || 'Usuário'}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {conversation.lastMessage || 'Conversa iniciada'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-hive-gold text-white text-xs min-w-[20px] h-5">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Área de Chat Principal */}
        <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-white dark:bg-gray-800`}>
          {selectedConversation && selectedConvData ? (
            <>
              {/* Header do Chat */}
              <div className="p-4 border-b bg-white dark:bg-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      {selectedConvData.participantType === 'assistant' ? (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <>
                          <AvatarImage src={selectedConvData.participantImage} />
                          <AvatarFallback className="bg-hive-gold text-white">
                            {(selectedConvData.participantName || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    {selectedConvData.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {selectedConvData.participantName || 'Usuário'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedConvData.isOnline ? 'Online agora' : 'Visto por último há algum tempo'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedConvData.participantType === 'provider' && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Área de Mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-3 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-hive-gold text-white rounded-br-md'
                              : message.sender === 'assistant'
                              ? 'bg-blue-100 text-blue-900 rounded-bl-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <div className={`flex items-center mt-1 space-x-1 ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.sender === 'user' && (
                            <div className="text-gray-500">
                              {message.isRead ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Área de Input */}
              <div className="p-4 border-t bg-white dark:bg-gray-800">
                <div className="flex items-end space-x-2">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-hive-gold hover:bg-hive-gold-dark"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Estado Inicial - Nenhuma conversa selecionada */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Bem-vindo ao Chat Hive
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Selecione uma conversa à esquerda para começar a conversar com prestadores de serviços ou nosso assistente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}