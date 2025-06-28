"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { Send, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, type Message } from "@/components/chat-message";
import { BotIcon } from "@/components/icons";
import { sendMessageAction } from "./actions";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "bot",
      content:
        "Hello! I'm MediBot, your intelligent health assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    const botTypingMessage: Message = {
      id: crypto.randomUUID(),
      role: "bot",
      content: "...",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, botTypingMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessageAction(currentInput);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botTypingMessage.id
            ? { ...msg, content: response }
            : msg
        )
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Something went wrong. Please check your connection and try again.",
      });
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== botTypingMessage.id)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm md:px-6">
        <div className="flex items-center gap-2">
          <BotIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            MediBot
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/analysis">
            <Stethoscope className="mr-2 h-4 w-4" />
            Analysis Tools
          </Link>
        </Button>
      </header>
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 p-4 md:p-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>
      </main>
      <footer className="border-t bg-card p-4">
        <div className="mx-auto w-full max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="flex items-start gap-2 md:gap-4"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a general health question..."
              className="flex-1 resize-none bg-background focus-visible:ring-1 focus-visible:ring-ring"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                }
              }}
              disabled={isLoading}
              aria-label="Chat input"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 shrink-0 bg-accent hover:bg-accent/90"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
