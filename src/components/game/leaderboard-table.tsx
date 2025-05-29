
"use client";

import type { PlayerScore } from '@/app/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, UserPlus, Sword, Info } from 'lucide-react';
import type { Language } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface EnrichedPlayerScore extends PlayerScore {
  id?: string; // Optional ID, useful for global players
}

interface LeaderboardTableProps {
  scores: EnrichedPlayerScore[];
  caption?: string;
  language: Language;
  currentUserId?: string | null; // To avoid showing "Add Friend" for oneself
  onAddFriend?: (player: EnrichedPlayerScore) => void;
  onChallenge?: (player: EnrichedPlayerScore) => void;
  isFriendsLeaderboard?: boolean;
}

const TEXTS = {
  rank: { es: "#", en: "#", fr: "#", pt: "#" },
  avatar: { es: "Avatar", en: "Avatar", fr: "Avatar", pt: "Avatar" },
  name: { es: "Nombre", en: "Name", fr: "Nom", pt: "Nome" },
  score: { es: "Puntuación", en: "Score", fr: "Score", pt: "Pontuação" },
  actions: { es: "Acciones", en: "Actions", fr: "Actions", pt: "Ações" },
  addFriend: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" },
  challenge: { es: "Desafiar", en: "Challenge", fr: "Défier", pt: "Desafiar" },
  noScores: { es: "No hay puntuaciones para mostrar.", en: "No scores to display.", fr: "Aucun score à afficher.", pt: "Não há pontuações para exibir." },
};

export function LeaderboardTable({
  scores,
  caption,
  language,
  currentUserId,
  onAddFriend,
  onChallenge,
  isFriendsLeaderboard = false,
}: LeaderboardTableProps) {
  const translate = (textKey: keyof typeof TEXTS) => {
    return TEXTS[textKey][language] || TEXTS[textKey]['en'];
  };

  if (!scores || scores.length === 0) {
    return <p className="text-muted-foreground text-center py-4">{translate('noScores')}</p>;
  }
  
  const localeForNumber = language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'pt' ? 'pt-PT' : 'en-US';

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          {caption && <caption className="mt-4 text-sm text-muted-foreground">{caption}</caption>}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">{translate('rank')}</TableHead>
              <TableHead className="w-[80px] hidden sm:table-cell">{translate('avatar')}</TableHead>
              <TableHead>{translate('name')}</TableHead>
              <TableHead className="text-right">{translate('score')}</TableHead>
              {(onAddFriend || onChallenge) && <TableHead className="text-center px-1 sm:px-4">{translate('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((player, index) => (
              <TableRow key={player.id || player.name + index + player.score} className={index < 3 ? 'bg-card/50' : ''}>
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={player.avatar || `https://placehold.co/40x40.png?text=${player.name.charAt(0)}`} alt={player.name} data-ai-hint="profile person" />
                    <AvatarFallback>
                      {player.name ? player.name.charAt(0).toUpperCase() : <UserCircle size={20}/>}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{player.name}</TableCell>
                <TableCell className="text-right font-semibold">{player.score.toLocaleString(localeForNumber)}</TableCell>
                {(onAddFriend || onChallenge) && (
                  <TableCell className="text-center px-1 sm:px-4">
                    <div className="flex flex-col items-center space-y-1 p-1 sm:flex-row sm:space-y-0 sm:space-x-1 sm:p-0">
                      {!isFriendsLeaderboard && onAddFriend && player.id !== currentUserId && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddFriend(player)}>
                              <UserPlus className="h-4 w-4 text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{translate('addFriend')}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {onChallenge && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChallenge(player)}>
                              <Sword className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{translate('challenge')}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
