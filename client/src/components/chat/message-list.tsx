import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import type { Message } from "@shared/schema";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  hasApiKey: boolean;
}

export function MessageList({ messages, isLoading, hasApiKey }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!hasApiKey) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex justify-center">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to AI Chat</h3>
            <p className="text-gray-600 text-sm">Please configure your API key in the sidebar to start chatting.</p>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex justify-center">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to AI Chat</h3>
            <p className="text-gray-600 text-sm">Start a conversation by typing your message below.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
        >
          <div className={`max-w-xs lg:max-w-md ${message.role === 'user' ? '' : 'flex items-start space-x-2'}`}>
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
            )}
            <div className={message.role === 'user' ? '' : 'flex-1'}>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
                }`}
              >
                <p className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                  {message.content}
                </p>
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}