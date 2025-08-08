import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Bot, X, Send, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

interface AssistantChatProps {
  onClose: () => void;
}

export default function AssistantChat({ onClose }: AssistantChatProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      message: 'Olá! Sou o assistente da Hive. Como posso ajudá-lo hoje? Posso ajudar você a encontrar propriedades, prestadores de serviços ou responder suas dúvidas sobre a plataforma!',
      timestamp: new Date().toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enviar mensagem para o assistente
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', { message });
      return response.json();
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'assistant',
        message: response.message,
        timestamp: response.timestamp
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'assistant',
        message: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date().toISOString()
      }]);
    }
  });

  // Scroll para o final quando novas mensagens chegam
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        message: newMessage,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      sendMessageMutation.mutate(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div 
      className={`fixed bottom-20 right-20 z-50 w-80 ${isMinimized ? 'h-14' : 'h-96'} transition-all duration-300`}
    >
      <Card className="w-full h-full shadow-xl border-2 border-blue-200">
        <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Avatar className="w-7 h-7 bg-white">
                  <Bot className="w-4 h-4 text-blue-600" />
                </Avatar>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <CardTitle className="text-sm font-medium">Assistente Hive</CardTitle>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-90">Online</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-blue-600 w-6 h-6 p-0"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-blue-600 w-6 h-6 p-0"
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
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-2 rounded-lg text-sm ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900 border'
                      }`}
                    >
                      {message.sender === 'assistant' && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">Assistente</span>
                        </div>
                      )}
                      <p>{message.message}</p>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {sendMessageMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-2 rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">Digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Campo de entrada de mensagem */}
            <div className="p-2 border-t bg-gray-50">
              <div className="flex space-x-2">
                <Input
                  placeholder="Pergunte algo..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 text-sm border-none bg-white"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 p-0"
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