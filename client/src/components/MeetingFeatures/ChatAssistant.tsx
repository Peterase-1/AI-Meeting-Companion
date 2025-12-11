import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setChatHistory } from '../../features/meetingSlice';
import type { RootState } from '../../store';
import { api } from '../../lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Send, Loader2, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ChatAssistantProps {
  meetingId: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ meetingId }) => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.meeting.chatHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    dispatch(setChatHistory(newHistory)); // Save to Redux

    setInput('');
    setLoading(true);

    try {
      const response = await api.post(`/api/meetings/${meetingId}/chat`, {
        query: userMessage.content,
        history: newHistory.map(m => ({ role: m.role, content: m.content }))
      });

      const assistantMessage: Message = { role: 'model', content: response.data.answer };
      dispatch(setChatHistory([...newHistory, assistantMessage])); // Save to Redux
    } catch (error) {
      console.error(error);
      dispatch(setChatHistory([...newHistory, { role: 'model', content: "Sorry, I encountered an error answering that." }])); // Save error to Redux
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-lg">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          Meeting Assistant
        </CardTitle>
        <CardDescription>Ask questions about the transcript, decisions, or action items.</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4 opacity-50">
            <Bot className="h-12 w-12" />
            <div>
              <p>No messages yet.</p>
              <p className="text-sm">Try asking: "What was the budget decision?"</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-muted'
                }`}>
                {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`rounded-lg px-4 py-2 text-sm shadow-sm ${msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-muted text-foreground'
                }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start w-full">
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-4 border-t bg-muted/20">
        <form onSubmit={handleSend} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
