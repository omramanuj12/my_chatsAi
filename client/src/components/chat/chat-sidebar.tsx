import { Button } from "@/components/ui/button";
import { X, Menu, Plus } from "lucide-react";
import { ApiKeySettings } from "./api-key-settings";
import { ChatHistory } from "./chat-history";

interface ChatSidebarProps {
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function ChatSidebar({
  currentSessionId,
  setCurrentSessionId,
  apiKey,
  setApiKey,
  sidebarOpen,
  setSidebarOpen,
}: ChatSidebarProps) {
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setSidebarOpen(false);
  };

  return (
    <div className={`w-80 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute lg:relative z-30 h-full`}>
      
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">AI Chat</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* API Key Configuration */}
      <div className="p-6 border-b border-gray-200">
        <ApiKeySettings apiKey={apiKey} setApiKey={setApiKey} />
      </div>
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <ChatHistory
          currentSessionId={currentSessionId}
          setCurrentSessionId={setCurrentSessionId}
          setSidebarOpen={setSidebarOpen}
        />
      </div>
      
      {/* Sidebar Footer */}
      <div className="p-6 border-t border-gray-200">
        <Button
          onClick={handleNewChat}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>
    </div>
  );
}
