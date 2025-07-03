"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, UserPlus, Sword, Crown, Trophy } from 'lucide-react';
import type { Language } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export interface EnrichedPlayerScore {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  lastPlayed?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  scores: EnrichedPlayerScore[];
  language: Language;
  currentUserId?: string | null;
  onAddFriend?: (player: EnrichedPlayerScore) => void;
  onChallenge?: (player: EnrichedPlayerScore) => void;
  isLoading?: boolean;
  isFriendsLeaderboard?: boolean;
}

const TEXTS = {
  rank: { es: "#", en: "#", fr: "#", pt: "#" },
  name: { es: "Nombre", en: "Name", fr: "Nom", pt: "Nome" },
  score: { es: "Puntuación", en: "Score", fr: "Score", pt: "Pontuação" },
  actions: { es: "Acciones", en: "Actions", fr: "Actions", pt: "Ações" },
  addFriend: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" },
  challenge: { es: "Desafiar", en: "Challenge", fr: "Défier", pt: "Desafiar" },
  noScores: { es: "No hay puntuaciones para mostrar.", en: "No scores to display.", fr: "Aucun score à afficher.", pt: "Não há pontuações para exibir." },
  loading: { es: "Cargando...", en: "Loading...", fr: "Chargement...", pt: "Carregando..." },
  you: { es: "(Tú)", en: "(You)", fr: "(Vous)", pt: "(Você)" },
};

export function LeaderboardTable({
  scores = [],
  language,
  currentUserId,
  onAddFriend,
  onChallenge,
  isLoading = false,
  isFriendsLeaderboard = false,
}: LeaderboardTableProps) {
  const translate = (textKey: keyof typeof TEXTS) => {
    return TEXTS[textKey][language] || TEXTS[textKey]['en'];
  };

  const localeForNumber = {
    es: 'es-ES',
    fr: 'fr-FR',
    pt: 'pt-PT',
    en: 'en-US'
  }[language] || 'en-US';

  const renderLoadingRows = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`loading-${i}`}>
        <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
        <TableCell className="hidden sm:table-cell">
          <Skeleton className="h-9 w-9 rounded-full" />
        </TableCell>
        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[60px] ml-auto" /></TableCell>
        {(onAddFriend || onChallenge) && <TableCell><Skeleton className="h-8 w-[100px] mx-auto" /></TableCell>}
      </TableRow>
    ))
  );

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">{translate('rank')}</TableHead>
                <TableHead className="w-[80px] hidden sm:table-cell">Avatar</TableHead>
                <TableHead>{translate('name')}</TableHead>
                <TableHead className="text-right">{translate('score')}</TableHead>
                {(onAddFriend || onChallenge) && <TableHead className="text-center px-4">{translate('actions')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderLoadingRows()}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
    );
  }

  if (!scores.length) {
    return <p className="text-muted-foreground text-center py-4">{translate('noScores')}</p>;
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">{translate('rank')}</TableHead>
              <TableHead className="w-[80px] hidden sm:table-cell">Avatar</TableHead>
              <TableHead>{translate('name')}</TableHead>
              <TableHead className="text-right">{translate('score')}</TableHead>
              {(onAddFriend || onChallenge) && <TableHead className="text-center px-4">{translate('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((player, index) => {
              const isCurrentUser = player.id === currentUserId;
              const RankIcon = index === 0 ? Crown : 
                               index === 1 ? Trophy : 
                               index === 2 ? Trophy : null;

              return (
                <TableRow 
                  key={player.id} 
                  className={isCurrentUser ? 'bg-primary/10' : ''}
                  data-highlight={isCurrentUser ? 'true' : undefined}
                >
                  <TableCell className="font-medium text-center">
                    <div className="flex items-center justify-center">
                      {index + 1}
                      {RankIcon && (
                        <RankIcon 
                          className={`ml-1 h-4 w-4 ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 
                            'text-amber-600'
                          }`} 
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar className="h-9 w-9">
                      <AvatarImage 
                        src={player.avatar || `https://placehold.co/40x40.png?text=${player.name.charAt(0)}`} 
                        alt={player.name} 
                      />
                      <AvatarFallback>
                        {player.name ? player.name.charAt(0).toUpperCase() : <UserCircle size={20}/>}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {player.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {translate('you')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {player.score.toLocaleString(localeForNumber)}
                  </TableCell>
                  {(onAddFriend || onChallenge) && (
                    <TableCell className="text-center px-4">
                      <div className="flex justify-center space-x-2">
                        {!isFriendsLeaderboard && onAddFriend && !isCurrentUser && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => onAddFriend(player)}
                              >
                                <UserPlus className="h-4 w-4 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{translate('addFriend')}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {onChallenge && !isCurrentUser && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => onChallenge(player)}
                              >
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
