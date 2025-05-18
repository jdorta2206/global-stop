
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Send, MessageSquare } from "lucide-react";
import type { ChatMessage } from "./chat-message-item";
import { ChatMessageItem } from "./chat-message-item";
import type { Language } from "@/contexts/language-context";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUserUid?: string | null;
  currentUserName?: string | null;
  currentUserAvatar?: string | null;
  language: Language; // Add language prop
}

const CHAT_PANEL_TEXTS = {
  title: { es: "Chat de la Sala", en: "Room Chat", fr: "Chat de la Salle", pt: "Chat da Sala" },
  description: { es: "Comunícate con otros jugadores en la sala.", en: "Communicate with other players in the room.", fr: "Communiquez avec les autres joueurs dans la salle.", pt: "Comunique-se com outros jogadores na sala." },
  noMessages: { es: "Aún no hay mensajes. ¡Sé el primero!", en: "No messages yet. Be the first!", fr: "Pas encore de messages. Soyez le premier !", pt: "Ainda não há mensagens. Seja o primeiro!" },
  inputPlaceholder: { es: "Escribe un mensaje...", en: "Type a message...", fr: "Écrire un message...", pt: "Digite uma mensagem..." },
  sendSrOnly: { es: "Enviar", en: "Send", fr: "Envoyer", pt: "Enviar" },
  loginToChat: { es: "Debes iniciar sesión para chatear.", en: "You must be logged in to chat.", fr: "Vous devez être connecté pour discuter.", pt: "Você precisa estar logado para conversar." }
};

export function ChatPanel({
  messages,
  onSendMessage,
  isOpen,
  setIsOpen,
  currentUserUid,
  // currentUserName, // Not directly used, sender name comes from message object
  // currentUserAvatar, // Not directly used, sender avatar comes from message object
  language,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState("");

  const translate = (textKey: keyof typeof CHAT_PANEL_TEXTS) => {
    return CHAT_PANEL_TEXTS[textKey][language] || CHAT_PANEL_TEXTS[textKey]['en'];
  }

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
            {translate('title')}
          </SheetTitle>
          <SheetDescription>
            {translate('description')}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow p-4 bg-muted/20">
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} currentUserUid={currentUserUid} />
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {translate('noMessages')}
              </p>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t bg-background">
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder={translate('inputPlaceholder')}
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-grow"
              disabled={!currentUserUid} 
            />
            <Button type="button" onClick={handleSend} disabled={!inputText.trim() || !currentUserUid}>
              <Send className="h-4 w-4" />
              <span className="sr-only">{translate('sendSrOnly')}</span>
            </Button>
          </div>
          {!currentUserUid && (
            <p className="text-xs text-destructive text-center mt-2">
              {translate('loginToChat')}
            </p>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
