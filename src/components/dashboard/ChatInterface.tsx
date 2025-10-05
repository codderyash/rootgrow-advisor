import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2, Sprout, Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import smartRootsLogo from "@/assets/smartroots-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function ChatInterface() {
  const { t, currentLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: t('agribot_welcome') || "Hello! I'm AgriBot, your AI agricultural assistant. I can help you with crop recommendations, farming techniques, pest management, and answer any questions about your farm. What would you like to know?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = getLanguageCode(currentLanguage);

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: t('error') || "Error",
          description: "Voice recognition failed. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentLanguage, toast, t]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Get language code for speech recognition
  const getLanguageCode = (lang: string) => {
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'or': 'or-IN',
      'pa': 'pa-IN'
    };
    return langMap[lang] || 'en-US';
  };

  // Text to speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(currentLanguage);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle voice input
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: t('error') || "Error",
        description: "Voice recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = getLanguageCode(currentLanguage);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Helper to simulate sensor data (same ranges as SensorDashboard)
  const simulateSensorData = () => ({
    N: Math.round(Math.random() * 140),
    P: Math.round(Math.random() * 145 + 5),
    K: Math.round(Math.random() * 205 + 5),
    temperature: Math.round((Math.random() * 30 + 10) * 10) / 10,
    humidity: Math.round(Math.random() * 68 + 30),
    ph: Math.round((Math.random() * 5 + 4) * 10) / 10,
    rainfall: Math.round(Math.random() * 280 + 20)
  });

  // AI response using Gemini API via Supabase Edge Function
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // 1) Get latest sensor data (simulated for now)
      const sensorData = simulateSensorData();

      // 2) Ask AI for recommended crop from sensor data
      const { data: prediction, error: predError } = await supabase.functions.invoke('crop-prediction', {
        body: { sensorData }
      });
      const recommendedCrop = predError ? undefined : (prediction?.crop as string | undefined);

      // 3) Ask AgriBot with full context
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userMessage, sensorData, recommendedCrop, language: currentLanguage }
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
      
      // Speak the response
      speak(aiResponse);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: t('error') || "Connection Error",
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
    t('quick_q1') || "What crop should I plant this season?",
    t('quick_q2') || "How to manage pest problems?",
    t('quick_q3') || "What fertilizer should I use?",
    t('quick_q4') || "When should I irrigate my crops?"
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
            <h1 className="text-3xl font-bold">{t('agribot_chat') || 'AgriBot Chat'}</h1>
            <p className="text-muted-foreground">{t('ai_assistant') || 'Your AI agricultural assistant'}</p>
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          {t('ai_online') || 'AI Assistant Online'}
        </div>
      </div>

      {/* Quick Questions */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">{t('quick_questions') || 'Quick Questions'}</CardTitle>
          <CardDescription>{t('click_question') || 'Click on any question to get started'}</CardDescription>
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
          <CardTitle>{t('conversation') || 'Conversation'}</CardTitle>
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
                    <span className="text-sm text-muted-foreground">{t('bot_thinking') || 'AgriBot is thinking...'}</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        
        {/* Message Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Button
              onClick={toggleListening}
              disabled={isLoading}
              variant={isListening ? "default" : "outline"}
              size="icon"
              className={isListening ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              placeholder={t('chat_placeholder') || "Ask AgriBot about farming, crops, or agricultural practices..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || isListening}
              className="flex-1 bg-input border-border/50 focus:border-primary/50"
            />
            {isSpeaking && (
              <Button variant="outline" size="icon" disabled>
                <Volume2 className="h-4 w-4 animate-pulse" />
              </Button>
            )}
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