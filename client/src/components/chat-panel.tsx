import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { ChatMessage, User } from "@shared/schema";

interface ChatMessageWithUser extends ChatMessage {
  user: User;
}

export function ChatPanel() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const [onlineUsers] = useState(5); // This would come from WebSocket in real implementation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial messages
  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["/api/chat/messages"],
    enabled: !!user,
  });

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to chat");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setMessages(prev => [data, ...prev]);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from chat");
    };

    return () => {
      ws.close();
    };
  }, [user]);

  // Set initial messages
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages.reverse()); // Reverse to show newest at bottom
    }
  }, [initialMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !user || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat_message',
      userId: user.id,
      message: message.trim(),
    }));

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || "Anonymous";
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Team Chat
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="chat-panel">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Team Chat
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {onlineUsers} online
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 pr-4 mb-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3" data-testid={`message-${msg.id}`}>
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground text-xs font-medium">
                      {getUserInitials(msg.user)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium" data-testid={`message-author-${msg.id}`}>
                        {getDisplayName(msg.user)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid={`message-content-${msg.id}`}>
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            data-testid="chat-input"
          />
          <Button 
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-gradient-to-br from-primary to-secondary"
            data-testid="chat-send-button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
