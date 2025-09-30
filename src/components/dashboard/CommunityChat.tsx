import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Users, MessageCircle, Hash, Search } from "lucide-react";

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: Date;
  channel: string;
  userLocation?: string;
  userCrop?: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isActive: boolean;
}

export default function CommunityChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: 'Rajesh Kumar',
      content: 'Has anyone tried organic fertilizers for wheat? Looking for recommendations.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      channel: 'crop-tips',
      userLocation: 'Punjab',
      userCrop: 'Wheat'
    },
    {
      id: '2',
      user: 'Priya Sharma',
      content: 'Weather forecast shows rain this week. Should I delay my rice sowing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      channel: 'weather-alerts',
      userLocation: 'Haryana',
      userCrop: 'Rice'
    },
    {
      id: '3',
      user: 'Suresh Patel',
      content: 'Cotton prices are looking good this season. Market analysis shows 15% increase.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      channel: 'market-trends',
      userLocation: 'Gujarat',
      userCrop: 'Cotton'
    }
  ]);

  const [channels] = useState<Channel[]>([
    { id: 'crop-tips', name: 'Crop Tips', description: 'Share farming techniques and tips', memberCount: 1240, isActive: true },
    { id: 'weather-alerts', name: 'Weather Alerts', description: 'Weather updates and warnings', memberCount: 980, isActive: false },
    { id: 'market-trends', name: 'Market Trends', description: 'Price updates and market analysis', memberCount: 760, isActive: false },
    { id: 'pest-disease', name: 'Pest & Disease', description: 'Help with crop health issues', memberCount: 650, isActive: false },
    { id: 'govt-schemes', name: 'Govt Schemes', description: 'Information about agricultural schemes', memberCount: 890, isActive: false }
  ]);

  const [activeChannel, setActiveChannel] = useState('crop-tips');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = messages.filter(
    msg => msg.channel === activeChannel && 
    (searchTerm === '' || msg.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
     msg.user.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: 'You',
        content: newMessage,
        timestamp: new Date(),
        channel: activeChannel,
        userLocation: 'Your Location',
        userCrop: 'Your Crop'
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Community Chat</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Channels Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Channels</CardTitle>
            <CardDescription>Join farming communities</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              <div className="space-y-1 p-4">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={activeChannel === channel.id ? "default" : "ghost"}
                    className="w-full justify-start gap-2 h-auto p-3"
                    onClick={() => setActiveChannel(channel.id)}
                  >
                    <Hash className="h-4 w-4" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{channel.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {channel.memberCount} members
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                <CardTitle>{channels.find(c => c.id === activeChannel)?.name}</CardTitle>
                <Badge variant="outline">
                  {channels.find(c => c.id === activeChannel)?.memberCount} members
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
              </div>
            </div>
            <CardDescription>
              {channels.find(c => c.id === activeChannel)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {filteredMessages.map((message, index) => (
                  <div key={message.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {message.user.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{message.user}</span>
                          {message.userLocation && (
                            <Badge variant="outline" className="text-xs">
                              {message.userLocation}
                            </Badge>
                          )}
                          {message.userCrop && (
                            <Badge variant="outline" className="text-xs">
                              {message.userCrop}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder={`Message #${channels.find(c => c.id === activeChannel)?.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}