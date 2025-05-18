
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Send, MessageSquare, X } from "lucide-react";
import type { ChatMessage } from "./chat-message-item";
import { ChatMessageItem } from "./chat-message-item";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUserUid?: string | null;
  currentUserName?: string | null;
  currentUserAvatar?: string | null;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isOpen,
  setIsOpen,
  currentUserUid,
  currentUserName,
  currentUserAvatar,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-[350px] sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-primary" />
            Chat de la Sala
          </SheetTitle>
          <SheetDescription>
            Comunícate con otros jugadores en la sala.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow p-4 bg-muted/20">
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} currentUserUid={currentUserUid} />
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aún no hay mensajes. ¡Sé el primero!
              </p>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t bg-background">
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Escribe un mensaje..."
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-grow"
              disabled={!currentUserUid} // Disable if not logged in
            />
            <Button type="button" onClick={handleSend} disabled={!inputText.trim() || !currentUserUid}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
          {!currentUserUid && (
            <p className="text-xs text-destructive text-center mt-2">
              Debes iniciar sesión para chatear.
            </p>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
