"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardTable, type EnrichedPlayerScore } from './leaderboard-table';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/contexts/language-context';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

interface GlobalLeaderboardCardProps {
  className?: string;
  language: Language;
  currentUserId?: string | null;
  onAddFriend?: (player: EnrichedPlayerScore) => void;
  onChallenge?: (player: EnrichedPlayerScore) => void;
}

const TEXTS = {
  title: { es: "Puntuaciones Globales", en: "Global Scores", fr: "Scores Mondiaux", pt: "Pontuações Globais" },
  description: { 
    es: "Los mejores jugadores de Global Stop", 
    en: "Top Global Stop players", 
    fr: "Les meilleurs joueurs de Global Stop", 
    pt: "Melhores jogadores do Global Stop" 
  },
  loading: {
    es: "Cargando clasificación...",
    en: "Loading leaderboard...",
    fr: "Chargement du classement...",
    pt: "Carregando classificação..."
  },
  error: {
    es: "Error al cargar los datos",
    en: "Error loading data",
    fr: "Erreur de chargement",
    pt: "Erro ao carregar dados"
  }
};

export function GlobalLeaderboardCard({ 
  className, 
  language,
  currentUserId,
  onAddFriend,
  onChallenge 
}: GlobalLeaderboardCardProps) {
  const [leaderboardData, setLeaderboardData] = useState<EnrichedPlayerScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const translate = (textKey: keyof typeof TEXTS) => {
    return TEXTS[textKey][language] || TEXTS[textKey]['en'];
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('leaderboard')
          .select(`
            id,
            username,
            score,
            avatar_url,
            last_played
          `)
          .order('score', { ascending: false })
          .limit(50);

        if (error) throw error;

        setLeaderboardData(data?.map(player => ({
          id: player.id,
          name: player.username,
          score: player.score,
          avatar: player.avatar_url,
          lastPlayed: player.last_played
        })) || []);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError(translate('error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    // Set up realtime subscription
    const channel = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard'
        },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, language]);

  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-7 w-7 text-accent" />
          <CardTitle className="text-2xl font-semibold text-accent">
            {translate('title')}
          </CardTitle>
        </div>
        <CardDescription>
          {isLoading ? translate('loading') : 
           error ? error : translate('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-muted-foreground">
              {translate('loading')}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            {error}
          </div>
        ) : (
          <LeaderboardTable 
            scores={leaderboardData} 
            language={language}
            currentUserId={currentUserId}
            onAddFriend={onAddFriend}
            onChallenge={onChallenge}
          />
        )}
      </CardContent>
    </Card>
  );
}
