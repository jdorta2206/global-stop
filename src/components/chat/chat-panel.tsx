"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";
import type { ChatMessage } from "./chat-message-item";
import { ChatMessageItem } from "./chat-message-item";
import type { Language } from '@/contexts/language-context';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ChatPanelProps {
  messages: ChatMessage[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUserUid?: string | null;
  currentUserName?: string | null;
  currentUserAvatar?: string | null;
  language: Language;
  currentRoomId?: string | null;
}

interface DatabaseMessage {
  id: string;
  text: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  created_at: string;
}

const CHAT_PANEL_TEXTS = {
  title: { es: "Chat de la Sala", en: "Room Chat", fr: "Chat de la Salle", pt: "Chat da Sala" },
  description: { es: "Comunícate con otros jugadores.", en: "Chat with other players.", fr: "Discutez avec les autres joueurs.", pt: "Converse com outros jogadores." },
  noMessages: { es: "Aún no hay mensajes. ¡Sé el primero!", en: "No messages yet. Be the first!", fr: "Pas encore de messages. Soyez le premier !", pt: "Ainda não há mensagens. Seja o primeiro!" },
  inputPlaceholder: { es: "Escribe un mensaje...", en: "Type a message...", fr: "Écrire un message...", pt: "Digite uma mensagem..." },
  sendSrOnly: { es: "Enviar", en: "Send", fr: "Envoyer", pt: "Enviar" },
  loginToChat: { es: "Debes iniciar sesión para chatear.", en: "You must be logged in to chat.", fr: "Vous devez être connecté pour discuter.", pt: "Você precisa estar logado para conversar." }
};

export function ChatPanel({
  isOpen,
  setIsOpen,
  currentUserUid,
  currentUserName,
  currentUserAvatar,
  language,
  currentRoomId,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  const translate = (textKey: keyof typeof CHAT_PANEL_TEXTS) => {
    return CHAT_PANEL_TEXTS[textKey]?.[language] || CHAT_PANEL_TEXTS[textKey]?.['en'] || String(textKey);
  }

  // Convertir mensaje de base de datos a ChatMessage
  const convertToMessage = (dbMessage: DatabaseMessage): ChatMessage => ({
    id: dbMessage.id,
    text: dbMessage.text,
    sender: {
      uid: dbMessage.sender_id,
      name: dbMessage.sender_name,
      avatar: dbMessage.sender_avatar
    },
    timestamp: new Date(dbMessage.created_at)
  });

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!currentRoomId) return;

    const channel = supabase
      .channel(`room:${currentRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${currentRoomId}`
        },
        (payload: { new: DatabaseMessage }) => {
          setMessages(prev => [...prev, convertToMessage(payload.new)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoomId, supabase]);

  // Cargar mensajes iniciales
  useEffect(() => {
    if (!currentRoomId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', currentRoomId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data.map(convertToMessage));
      }
    };

    loadMessages();
  }, [currentRoomId, supabase]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentUserUid || !currentRoomId) return;

    const newMessage = {
      text: inputText.trim(),
      room_id: currentRoomId,
      sender_id: currentUserUid,
      sender_name: currentUserName || 'Anónimo',
      sender_avatar: currentUserAvatar,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('messages')
      .insert(newMessage);

    if (!error) {
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

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[350px] sm:w-[400px] bg-background border-l shadow-lg flex flex-col z-50">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-lg font-semibold">{translate('title')}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {translate('description')}
        </p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-2" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <ChatMessageItem 
            key={msg.id} 
            message={msg} 
            currentUserUid={currentUserUid} 
          />
        ))}
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {translate('noMessages')}
          </p>
        )}
      </div>
      
      <div className="p-4 border-t bg-background">
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
          <Button 
            type="button" 
            onClick={handleSend} 
            disabled={!inputText.trim() || !currentUserUid}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">{translate('sendSrOnly')}</span>
          </Button>
        </div>
        {!currentUserUid && (
          <p className="text-xs text-destructive text-center mt-2">
            {translate('loginToChat')}
          </p>
        )}
      </div>
    </div>
  );
}