import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatResponse } from "@shared/schema";

interface MessageInputProps {
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  apiKey: string;
}

export function MessageInput({
  currentSessionId,
  setCurrentSessionId,
  apiKey,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
    }
  }, [message]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { sessionId?: string; message: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/chat/send", data);
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      // Update current session if it was created
      if (!currentSessionId) {
        setCurrentSessionId(data.sessionId);
      }
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/sessions", data.sessionId, "messages"] 
      });
      
      setMessage("");
      setIsLoading(false);
    },
    onError: (error: any) => {
      setIsLoading(false);
      let errorMessage = "Failed to send message";
      
      if (error.message.includes("401")) {
        errorMessage = "Invalid API key. Please check your configuration.";
      } else if (error.message.includes("429")) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (error.message.includes("402")) {
        errorMessage = "Insufficient credits. Please check your OpenAI account.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !apiKey) {
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please configure your API key in the sidebar first.",
          variant: "destructive",
        });
      }
      return;
    }

    if (trimmedMessage.length > 4000) {
      toast({
        title: "Message too long",
        description: "Please keep your message under 4000 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    sendMessageMutation.mutate({
      sessionId: currentSessionId || undefined,
      message: trimmedMessage,
      apiKey,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const characterCount = message.length;
  const isOverLimit = characterCount > 4000;

  return (
    <div className="bg-white border-t border-gray-200 p-6">
      <div className="flex items-end space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[3rem] max-h-32"
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600"
              title="Attach File"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "File attachment feature is coming soon.",
                });
              }}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !message.trim() || !apiKey || isOverLimit}
          className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Input Footer */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={isOverLimit ? "text-red-500" : ""}>{characterCount}</span>
          <span>/</span>
          <span>4000</span>
        </div>
      </div>
    </div>
  );
}