"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardTable, type EnrichedPlayerScore } from './leaderboard-table';
import { Users, UserPlus, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface FriendsLeaderboardCardProps {
  leaderboardData: EnrichedPlayerScore[];
  className?: string;
  language: Language;
  currentUserId?: string | null;
  onChallenge?: (player: EnrichedPlayerScore) => void;
  onAddFriendManual: (identifier: string) => void;
}

const TEXTS = {
  title: { es: "Puntuaciones de Amigos", en: "Friends Scores", fr: "Scores des Amis", pt: "Pontuações de Amigos" },
  description: { 
    es: "Compite con tus amigos y mira quién lidera.", 
    en: "Compete with your friends and see who's leading.", 
    fr: "Rivalisez avec vos amis et voyez qui mène.", 
    pt: "Compita com seus amigos e veja quem está liderando." 
  },
  addFriendSectionTitle: { es: "Añadir Nuevo Amigo", en: "Add New Friend", fr: "Ajouter un Nouvel Ami", pt: "Adicionar Novo Amigo"},
  addFriendInputLabel: { es: "Nombre o Email del Amigo:", en: "Friend's Name or Email:", fr: "Nom ou Email de l'Ami :", pt: "Nome ou Email do Amigo:"},
  addFriendInputPlaceholder: { es: "Ej: Juan Pérez o juan@ejemplo.com", en: "Ex: John Doe or john@example.com", fr: "Ex : Jean Dupont ou jean@example.com", pt: "Ex: João Silva ou joao@exemplo.com"},
  addFriendButton: { es: "Añadir Amigo", en: "Add Friend", fr: "Ajouter un Ami", pt: "Adicionar Amigo" },
  comingSoon: { 
    es: "Añade amigos manualmente abajo o desde la tabla global.", 
    en: "Add friends manually below or from the global leaderboard.", 
    fr: "Ajoutez des amis manuellement ci-dessous ou depuis le classement mondial.", 
    pt: "Adicione amigos manualmente abaixo ou do placar global." 
  },
};

export function FriendsLeaderboardCard({ 
  leaderboardData, 
  className, 
  language,
  currentUserId,
  onChallenge,
  onAddFriendManual
}: FriendsLeaderboardCardProps) {
  const [newFriendIdentifier, setNewFriendIdentifier] = useState("");
  const supabase = createClientComponentClient();

  const translate = (textKey: keyof typeof TEXTS) => {
    return TEXTS[textKey][language] || TEXTS[textKey]['en'];
  };

  const handleAddManually = async () => {
    if (!newFriendIdentifier.trim() || !currentUserId) return;

    // 1. Buscar usuario por email o nombre
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .or(`username.ilike.%${newFriendIdentifier}%,email.ilike.%${newFriendIdentifier}%`)
      .limit(1);

    if (error || !users?.length) {
      // Si no se encuentra, añadir como amigo manual
      onAddFriendManual(newFriendIdentifier.trim());
    } else {
      // Si se encuentra, añadir relación en tabla friends
      const { error: friendError } = await supabase
        .from('friends')
        .insert({
          user_id: currentUserId,
          friend_id: users[0].id,
          friend_name: users[0].username,
          friend_avatar: users[0].avatar_url
        });
    }

    setNewFriendIdentifier("");
  };

  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-semibold text-primary">{translate('title')}</CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2">
          {translate('description')}
          <br />
          <span className="text-xs text-muted-foreground/80 font-semibold">{translate('comingSoon')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardTable 
          scores={leaderboardData} 
          language={language}
          currentUserId={currentUserId}
          onChallenge={onChallenge}
          isFriendsLeaderboard={true}
        />
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
        <div>
          <h4 className="text-md font-semibold text-secondary">{translate('addFriendSectionTitle')}</h4>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
            <Input 
              type="text" 
              id="manual-friend-identifier"
              placeholder={translate('addFriendInputPlaceholder')} 
              value={newFriendIdentifier}
              onChange={(e) => setNewFriendIdentifier(e.target.value)}
              className="flex-grow"
              onKeyPress={(e) => e.key === 'Enter' && handleAddManually()}
            />
            <Button type="button" onClick={handleAddManually} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              {translate('addFriendButton')}
            </Button>
          </div>
          <Label htmlFor="manual-friend-identifier" className="text-xs text-muted-foreground mt-1">
            {translate('addFriendInputLabel')}
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
}
