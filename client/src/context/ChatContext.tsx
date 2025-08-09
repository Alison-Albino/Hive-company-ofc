import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isChatPageOpen: boolean;
  setIsChatPageOpen: (isOpen: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatPageOpen, setIsChatPageOpen] = useState(false);

  return (
    <ChatContext.Provider value={{
      isChatPageOpen,
      setIsChatPageOpen
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}