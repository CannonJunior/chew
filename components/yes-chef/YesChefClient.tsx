'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, ChefHat, Zap, BookOpen, RotateCcw } from 'lucide-react';

type Mode = 'quick' | 'plan';

const SUGGESTIONS = [
  "What can I make with what's in my pantry?",
  "Suggest a meal plan for this week",
  "How do I substitute eggs in baking?",
  "What pairs well with salmon?",
  "Give me a quick weeknight dinner idea",
];

function Message({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${isUser ? 'bg-primary text-primary-foreground' : 'bg-amber-100 text-amber-800'}`}>
        {isUser ? '👤' : '👨‍🍳'}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export function YesChefClient() {
  const [mode, setMode] = useState<Mode>('quick');
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/yes-chef/chat',
        body: { mode },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode]
  );

  const { messages, sendMessage, status, setMessages } = useChat({ transport });

  const isStreaming = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    await sendMessage({ text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function useSuggestion(s: string) {
    setInput(s);
    textareaRef.current?.focus();
  }

  // Extract text content from UIMessage parts
  function getMessageText(msg: { role: string; parts?: Array<{ type: string; text?: string }> }): string {
    if (!msg.parts) return '';
    return msg.parts
      .filter((p) => p.type === 'text')
      .map((p) => p.text ?? '')
      .join('');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-lg">👨‍🍳</div>
          <div>
            <h1 className="font-bold">Yes Chef</h1>
            <p className="text-xs text-muted-foreground">Your AI cooking assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-lg border p-0.5 gap-0.5">
            <button
              onClick={() => setMode('quick')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'quick' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Zap className="w-3 h-3" />
              Quick
            </button>
            <button
              onClick={() => setMode('plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'plan' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <BookOpen className="w-3 h-3" />
              Plan
            </button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setMessages([])} title="Clear chat">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 space-y-6">
            <div className="text-center space-y-2">
              <ChefHat className="w-12 h-12 mx-auto text-amber-400" />
              <h2 className="font-semibold text-lg">How can I help?</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask me anything about cooking — I have context about your pantry, recipes, and kitchen.
              </p>
              <Badge variant="outline" className="text-xs">
                {mode === 'quick' ? '⚡ Quick mode — qwen3.5:0.8b' : '📋 Plan mode — qwen3.5:2b'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => useSuggestion(s)}
                  className="text-left text-sm px-4 py-2.5 rounded-xl border hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 px-1">
            {messages.map((m) => (
              <Message key={m.id} role={m.role} content={getMessageText(m as unknown as { role: string; parts?: Array<{ type: string; text?: string }> })} />
            ))}
            {isStreaming && (
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm">👨‍🍳</div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="pt-4 border-t shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'plan' ? "Ask for a meal plan, shopping list, or detailed recipe..." : "Ask a quick cooking question..."}
            className="resize-none min-h-[52px] max-h-40"
            rows={2}
          />
          <Button
            size="icon"
            disabled={isStreaming || !input.trim()}
            onClick={handleSend}
            className="shrink-0 h-[52px] w-[52px]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
