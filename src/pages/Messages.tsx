import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Send, MoreVertical, Check, CheckCheck, Phone, Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";

const conversations = [
  { id: 1, name: "Priya S.", avatar: "PS", lastMessage: "Sure, let's meet at...", time: "2m", unread: 2, online: true },
  { id: 2, name: "Rahul M.", avatar: "RM", lastMessage: "The rate looks good!", time: "1h", unread: 0, online: false },
  { id: 3, name: "Ananya K.", avatar: "AK", lastMessage: "When can you move in?", time: "3h", unread: 1, online: true },
  { id: 4, name: "Vikram P.", avatar: "VP", lastMessage: "Thanks for the quick...", time: "1d", unread: 0, online: false },
];

const messages = [
  { id: 1, sender: "them", text: "Hi! I saw your exchange offer. Is it still available?", time: "10:30 AM" },
  { id: 2, sender: "me", text: "Yes, it is! I have ₹50,000 to exchange.", time: "10:32 AM", status: "read" },
  { id: 3, sender: "them", text: "Great! What rate are you looking at?", time: "10:33 AM" },
  { id: 4, sender: "me", text: "I'm flexible, but around ₹104.5 per pound would work for me.", time: "10:35 AM", status: "read" },
  { id: 5, sender: "them", text: "That works! Can we meet near Liverpool Street?", time: "10:36 AM" },
  { id: 6, sender: "me", text: "Sure, let me check my schedule and get back to you.", time: "10:40 AM", status: "delivered" },
];

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (newMessage.trim()) {
      setNewMessage("");
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

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
              {filteredConversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors border-b border-border ${
                    selectedChat === chat.id ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {chat.avatar}
                    </div>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{chat.name}</span>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                        {chat.lastMessage}
                      </span>
                      {chat.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
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
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {selectedConversation.avatar}
                      </div>
                      {selectedConversation.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{selectedConversation.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedConversation.online ? "Online" : "Offline"}
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
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${
                        msg.sender === 'me' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-foreground'
                      } rounded-2xl px-4 py-2`}>
                        <p className="text-sm">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          msg.sender === 'me' ? 'justify-end' : ''
                        }`}>
                          <span className={`text-xs ${
                            msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {msg.time}
                          </span>
                          {msg.sender === 'me' && (
                            msg.status === 'read' 
                              ? <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                              : <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
                    <Button size="icon" onClick={handleSend}>
                      <Send className="w-4 h-4" />
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
