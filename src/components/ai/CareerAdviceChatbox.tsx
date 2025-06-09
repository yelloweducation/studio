
"use client";
import { useState, type FormEvent, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User, Loader2, AlertTriangle } from 'lucide-react';
import { getCareerAdvice, type CareerAdviceInput, type CareerAdviceOutput } from '@/ai/flows/career-advice-flow';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
}

export default function CareerAdviceChatbox() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: query };
    const aiLoadingMessage: ChatMessage = { id: `ai-loading-${Date.now()}`, sender: 'ai', text: '', isLoading: true };
    
    setMessages(prev => [...prev, userMessage, aiLoadingMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const inputData: CareerAdviceInput = { query };
      const response: CareerAdviceOutput = await getCareerAdvice(inputData);
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiLoadingMessage.id ? { ...msg, text: response.advice, isLoading: false } : msg
      ));

    } catch (err) {
      console.error("Error getting career advice:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      setMessages(prev => prev.map(msg => 
        msg.id === aiLoadingMessage.id ? { ...msg, text: `Error: ${errorMessage}`, isLoading: false, isError: true } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-headline flex items-center">
          <MessageSquare className="mr-2 h-6 w-6 text-primary" />
          AI Career Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-72 w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <span className="flex-shrink-0 p-2 bg-muted rounded-full shadow">
                    <Bot className="h-5 w-5 text-primary" />
                  </span>
                )}
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.sender === 'user' && (
                  <span className="flex-shrink-0 p-2 bg-muted rounded-full shadow">
                    <User className="h-5 w-5 text-accent" />
                  </span>
                )}
              </div>
            ))}
             {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-10 w-10 mx-auto mb-2 text-primary/50" />
                    <p>Ask me anything about tech careers!</p>
                    <p className="text-xs">e.g., "How can I start in web development?"</p>
                </div>
            )}
          </div>
        </ScrollArea>
        {error && (
          <div className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" /> {error}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask about tech careers..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow shadow-sm"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()} className="shadow-md">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
