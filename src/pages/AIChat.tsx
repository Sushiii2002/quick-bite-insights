
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your BeyondDiet nutrition assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Based on your recent logs, I notice you've been low on protein. Consider adding more lean meats, eggs, or legumes to your meals.",
        "Looking at your patterns, you might benefit from increasing your fiber intake. Try adding more fruits, vegetables, and whole grains.",
        "Your calcium levels seem low based on your food logs. Consider adding more dairy or calcium-fortified foods.",
        "I notice you've been consistent with your meals - great job! Keep maintaining this balanced approach.",
        "Have you tried meal prepping? It could help you maintain your nutrition goals more consistently."
      ];
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Nutrition AI</h1>
        <p className="text-sm text-muted-foreground">Get personalized nutrition advice</p>
      </div>

      <div className="flex flex-col h-[calc(100vh-230px)]">
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="flex items-start max-w-[80%]">
                {message.sender === 'ai' && (
                  <div className="bg-primary text-white rounded-full p-2 mr-2 flex-shrink-0">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                )}
                
                <Card
                  className={`${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <CardContent className="p-3 text-sm">
                    {message.text}
                  </CardContent>
                </Card>
                
                {message.sender === 'user' && (
                  <div className="bg-gray-300 rounded-full p-2 ml-2 flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <Input
            className="pr-10"
            placeholder="Ask about nutrition, recipes, or tips..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AIChat;
