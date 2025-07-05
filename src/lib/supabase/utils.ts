// Importación que ahora funcionará correctamente
import { supabase } from './client';

// Tipos definidos internamente (sin necesidad de carpeta types)
type User = {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
};

type HighScore = {
  user_id: string;
  score: number;
  users: {
    username: string;
    avatar_url?: string;
  };
};

// Función utilitaria cn para Tailwind
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

// Servicios existentes
export const UserService = {
  async getUsers(page = 1, pageSize = 10): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return data || [];
  },
};

export const ScoreService = {
  async getHighScores(limit = 10): Promise<HighScore[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('user_id, score, users(username, avatar_url)')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};