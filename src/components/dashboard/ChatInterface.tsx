import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import smartRootsLogo from "@/assets/smartroots-logo.jpg";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm AgriBot, your AI agricultural assistant. I can help you with crop recommendations, farming techniques, pest management, and answer any questions about your farm. What would you like to know?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // AI response using Gemini API via Supabase Edge Function
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userMessage }
      });

      if (error) {
        console.error('Error calling AI chat function:', error);
        return "I'm having trouble processing your request. Please try again later.";
      }

      return data.response || "I apologize, I couldn't generate a response.";
    } catch (error) {
      console.error('Error in getAIResponse:', error);
      return "I'm experiencing technical difficulties. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + "_user",
      content: inputMessage.trim(),
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(userMessage.content);
      
      const botMessage: Message = {
        id: Date.now().toString() + "_bot",
        content: aiResponse,
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to AgriBot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What crop should I plant this season?",
    "How to manage pest problems?",
    "What fertilizer should I use?",
    "When should I irrigate my crops?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={smartRootsLogo} alt="AgriBot" />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">AgriBot Chat</h1>
            <p className="text-muted-foreground">Your AI agricultural assistant</p>
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          AI Assistant Online
        </div>
      </div>

      {/* Quick Questions */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Quick Questions</CardTitle>
          <CardDescription>Click on any question to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto p-3 border-border/50 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => handleQuickQuestion(question)}
              >
                <Sprout className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span className="text-sm">{question}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="card-glow min-h-[500px] flex flex-col">
        <CardHeader className="border-b border-border/50">
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={smartRootsLogo} alt="AgriBot" />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender === "user" 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {/* Loading Message */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={smartRootsLogo} alt="AgriBot" />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AgriBot is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        
        {/* Message Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              placeholder="Ask AgriBot about farming, crops, or agricultural practices..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 bg-input border-border/50 focus:border-primary/50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-primary hover:shadow-[var(--shadow-premium)] transition-[var(--transition-smooth)]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}