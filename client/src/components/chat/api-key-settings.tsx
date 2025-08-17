import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ApiKeySettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
}

export function ApiKeySettings({ apiKey, setApiKey, provider, setProvider }: ApiKeySettingsProps) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const { toast } = useToast();

  // Test API key mutation
  const testApiKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest("POST", "/api/chat/test-key", { apiKey: key, provider });
      return response.json();
    },
    onSuccess: () => {
      setIsValidated(true);
      toast({
        title: "API Key Validated",
        description: "Your API key is working correctly.",
      });
    },
    onError: (error: any) => {
      setIsValidated(false);
      let errorMessage = "Failed to validate API key";
      
      if (error.message.includes("401")) {
        errorMessage = "Invalid API key. Please check your key and try again.";
      }
      
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSaveApiKey = () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an API key.",
        variant: "destructive",
      });
      return;
    }
    
    setApiKey(tempApiKey.trim());
    setIsValidated(false);
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved for this session.",
    });
  };

  const handleTestApiKey = () => {
    const keyToTest = tempApiKey.trim() || apiKey;
    if (!keyToTest) {
      toast({
        title: "No API Key",
        description: "Please enter an API key to test.",
        variant: "destructive",
      });
      return;
    }
    
    testApiKeyMutation.mutate(keyToTest);
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">API Configuration</h3>
      <div className="space-y-3">
        <div>
          <Label htmlFor="provider" className="block text-xs font-medium text-gray-700 mb-1">
            AI Provider
          </Label>
          <Select value={provider} onValueChange={(value) => {
            setProvider(value);
            setIsValidated(false);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
              <SelectItem value="deepseek">DeepSeek</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="apiKey" className="block text-xs font-medium text-gray-700 mb-1">
            API Key
          </Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={tempApiKey}
              onChange={(e) => {
                setTempApiKey(e.target.value);
                setIsValidated(false);
              }}
              placeholder={provider === "deepseek" ? "Enter your DeepSeek API key" : "Enter your OpenAI API key"}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-1 top-1 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleSaveApiKey}
            disabled={!tempApiKey.trim()}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Key
          </Button>
          <Button
            onClick={handleTestApiKey}
            disabled={testApiKeyMutation.isPending || (!tempApiKey.trim() && !apiKey)}
            variant="outline"
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium"
          >
            {testApiKeyMutation.isPending ? "Testing..." : "Test"}
          </Button>
        </div>
        
        {/* API Key Status */}
        {isValidated && (
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Check className="h-3 w-3 text-green-600" />
            <span className="text-green-700">API key validated</span>
          </div>
        )}
      </div>
    </div>
  );
}