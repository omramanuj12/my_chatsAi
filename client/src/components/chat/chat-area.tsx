import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Download, Trash2 } from "lucide-react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

interface ChatAreaProps {
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  apiKey: string;
  provider: string;
  setSidebarOpen: (open: boolean) => void;
}

export function ChatArea({
  currentSessionId,
  setCurrentSessionId,
  apiKey,
  provider,
  setSidebarOpen,
}: ChatAreaProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages for current session
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat/sessions", currentSessionId, "messages"],
    enabled: !!currentSessionId,
  });

  // Clear current chat mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      if (!currentSessionId) return;
      await apiRequest("DELETE", `/api/chat/sessions/${currentSessionId}/messages`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions", currentSessionId, "messages"] });
      toast({
        title: "Chat cleared",
        description: "Current chat history has been cleared.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    },
  });

  const handleClearCurrentChat = () => {
    if (currentSessionId) {
      clearChatMutation.mutate();
    }
  };

  const handleExportChat = () => {
    if (!messages.length) {
      toast({
        title: "No messages",
        description: "There are no messages to export.",
      });
      return;
    }

    const chatText = messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Chat exported",
      description: "Chat history has been downloaded as a text file.",
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              className="text-gray-500 hover:text-gray-700"
              title="Export Chat"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCurrentChat}
              disabled={clearChatMutation.isPending || !currentSessionId}
              className="text-gray-500 hover:text-red-600"
              title="Clear Current Chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat Messages Area */}
      <MessageList 
        messages={messages} 
        isLoading={isLoading}
        hasApiKey={!!apiKey}
      />
      
      {/* Chat Input Area */}
      <MessageInput
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        apiKey={apiKey}
        provider={provider}
      />
      
    </div>
  );
}