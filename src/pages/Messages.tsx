import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Send, MoreVertical, Check, CheckCheck, Phone, Video, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { messageService, Message, Conversation } from "@/lib/services/messageService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ConversationWithUser extends Conversation {
  otherUserId?: string;
  otherUserName?: string;
  otherUserAvatar?: string;
}

const Messages = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId");
  
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = messageService.subscribeToConversations(user.uid, async (convs) => {
      const convsWithUsers = await Promise.all(convs.map(async (conv) => {
        const otherUserId = conv.participants.find(p => p !== user.uid);
        if (!otherUserId) return { ...conv } as ConversationWithUser;

        try {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          const userData = userDoc.data();
          return {
            ...conv,
            otherUserId,
            otherUserName: userData?.displayName || "Unknown",
            otherUserAvatar: userData?.photoURL,
          } as ConversationWithUser;
        } catch {
          return { ...conv, otherUserId } as ConversationWithUser;
        }
      }));

      setConversations(convsWithUsers);
      setLoading(false);

      // Auto-select conversation if userId param exists
      if (targetUserId && !selectedChat) {
        const existingConv = convsWithUsers.find(c => c.otherUserId === targetUserId);
        if (existingConv) {
          setSelectedChat(existingConv.id);
        } else {
          // Create new conversation
          const convId = await messageService.getConversationId(user.uid, targetUserId);
          setSelectedChat(convId);
        }
      }
    });

    return () => unsubscribe();
  }, [user, targetUserId]);

  useEffect(() => {
    if (!selectedChat || !user) return;

    const unsubscribe = messageService.subscribeToMessages(selectedChat, (msgs) => {
      setMessages(msgs);
      // Mark as read
      messageService.markAsRead(selectedChat, user.uid);
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const conversation = conversations.find(c => c.id === selectedChat);
    if (!conversation || !conversation.otherUserId) return;

    setSending(true);
    try {
      await messageService.sendMessage(
        selectedChat,
        user.uid,
        conversation.otherUserId,
        newMessage.trim()
      );
      setNewMessage("");
    } catch (error: any) {
      toast({ title: "Error sending message", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  const formatTime = (date: Date) => {
    try {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      if (diff < 60000) return "just now";
      if (diff < 3600000) return formatDistanceToNow(date, { addSuffix: true });
      if (diff < 86400000) return format(date, "h:mm a");
      return format(date, "MMM d");
    } catch {
      return "recently";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 h-screen">
        <div className="h-[calc(100vh-4rem)] flex">
          {/* Conversations List */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h1 className="text-lg font-semibold mb-3">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const unreadCount = chat.unreadCount?.[user?.uid || ""] || 0;
                  return (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors border-b border-border ${
                        selectedChat === chat.id ? 'bg-secondary' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-sm font-medium text-primary border border-primary/30">
                          {chat.otherUserAvatar ? (
                            <img src={chat.otherUserAvatar} alt="" className="w-full h-full rounded-full" />
                          ) : (
                            chat.otherUserName?.charAt(0) || "U"
                          )}
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{chat.otherUserName || "Unknown"}</span>
                          {chat.lastMessageAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.lastMessageAt as Date)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                            {chat.lastMessage || "No messages yet"}
                          </span>
                          {unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-blue-500 text-primary-foreground text-xs flex items-center justify-center font-semibold">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
            {selectedChat && selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden p-2 -ml-2 hover:bg-secondary rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-sm font-medium text-primary border border-primary/30">
                        {selectedConversation.otherUserAvatar ? (
                          <img src={selectedConversation.otherUserAvatar} alt="" className="w-full h-full rounded-full" />
                        ) : (
                          selectedConversation.otherUserName?.charAt(0) || "U"
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{selectedConversation.otherUserName || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">
                        Active
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.uid;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${
                            isMe 
                              ? 'bg-gradient-to-r from-primary to-blue-500 text-primary-foreground shadow-lg' 
                              : 'bg-secondary text-foreground'
                          } rounded-2xl px-4 py-2`}>
                            <p className="text-sm">{msg.text}</p>
                            <div className={`flex items-center gap-1 mt-1 ${
                              isMe ? 'justify-end' : ''
                            }`}>
                              <span className={`text-xs ${
                                isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {formatTime(msg.createdAt as Date)}
                              </span>
                              {isMe && (
                                msg.status === 'read' 
                                  ? <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                                  : <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <Send className="w-6 h-6" />
                  </div>
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
