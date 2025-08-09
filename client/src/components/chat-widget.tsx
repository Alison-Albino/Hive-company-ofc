import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! 👋 Como posso ajudá-lo hoje? Estou aqui para tirar dúvidas sobre imóveis e serviços.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: currentMessage,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setCurrentMessage('');
      setIsTyping(true);

      // Simular resposta do bot
      setTimeout(() => {
        const botResponse = generateBotResponse(currentMessage);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('preço') || message.includes('valor') || message.includes('custo')) {
      return 'Os preços variam conforme localização e características do imóvel. Você pode filtrar por faixa de preço na página de propriedades. Precisa de ajuda com algum imóvel específico?';
    } else if (message.includes('localização') || message.includes('bairro') || message.includes('região')) {
      return 'Temos imóveis em várias regiões do Rio de Janeiro: Copacabana, Ipanema, Barra da Tijuca e Centro. Use o mapa interativo para ver as comodidades próximas a cada propriedade!';
    } else if (message.includes('serviço') || message.includes('profissional') || message.includes('prestador')) {
      return 'Oferecemos diversos serviços: encanadores, eletricistas, pintores, limpeza e muito mais. Todos os profissionais são avaliados e verificados. Qual tipo de serviço você precisa?';
    } else if (message.includes('plano') || message.includes('assinatura') || message.includes('cadastro')) {
      return 'Temos 2 planos: Plano A (R$ 49/mês) para autônomos e Plano B (R$ 149/mês) para empresas. Quer saber mais detalhes sobre os benefícios?';
    } else if (message.includes('mapa') || message.includes('próximo') || message.includes('perto')) {
      return 'Use nosso mapa interativo na página de propriedades! Você pode ver hospitais, escolas, supermercados e outros locais importantes próximos a cada imóvel.';
    } else if (message.includes('obrigad') || message.includes('valeu') || message.includes('ok')) {
      return 'De nada! Estou sempre aqui para ajudar. Se tiver mais dúvidas sobre imóveis ou serviços, é só perguntar! 😊';
    } else {
      return 'Entendi! Para melhor ajudá-lo, você pode me perguntar sobre preços, localizações, serviços disponíveis, planos de assinatura ou usar o mapa interativo. Como posso ser mais específico?';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-hive-gold hover:bg-hive-gold-dark text-white shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          <i className="fas fa-comments text-xl"></i>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-2xl border flex flex-col">
          {/* Header */}
          <div className="bg-hive-gold text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center p-1">
                <img 
                  src="@assets/logo hive_1754700716189.png" 
                  alt="Hive Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistente Hive</h3>
                <p className="text-xs opacity-80">Online agora</p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20 p-1"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-hive-gold text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-white opacity-70' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hive-gold focus:border-transparent text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="bg-hive-gold hover:bg-hive-gold-dark text-white px-3"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}