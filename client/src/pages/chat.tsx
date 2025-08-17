import { useState } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatArea } from "@/components/chat/chat-area";

export default function Chat() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        apiKey={apiKey}
        setApiKey={setApiKey}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <ChatArea
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        apiKey={apiKey}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
}
