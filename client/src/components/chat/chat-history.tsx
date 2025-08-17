import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatSession } from "@shared/schema";

interface ChatHistoryProps {
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
}

export function ChatHistory({
  currentSessionId,
  setCurrentSessionId,
  setSidebarOpen,
}: ChatHistoryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat sessions
  const { data: sessions = [], isLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat/sessions"],
  });

  // Clear all history mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/chat/sessions");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      setCurrentSessionId(null);
      toast({
        title: "History cleared",
        description: "All chat history has been deleted.",
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

  // Delete single session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("DELETE", `/api/chat/sessions/${sessionId}`);
    },
    onSuccess: (_, deletedSessionId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      if (currentSessionId === deletedSessionId) {
        setCurrentSessionId(null);
      }
      toast({
        title: "Session deleted",
        description: "Chat session has been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete chat session.",
        variant: "destructive",
      });
    },
  });

  const handleClearHistory = () => {
    clearAllMutation.mutate();
  };

  const handleSessionClick = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSessionMutation.mutate(sessionId);
  };

  const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Chat History</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Chat History</h3>
        {sessions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            disabled={clearAllMutation.isPending}
            className="text-xs text-gray-500 hover:text-red-600 p-0 h-auto"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {sessions.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-8">
          No chat history yet. Start a conversation to see your sessions here.
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSessionClick(session.id)}
              className={`group p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors relative ${
                currentSessionId === session.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {session.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatRelativeTime(session.updatedAt)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  disabled={deleteSessionMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 h-auto ml-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}