// src/lib/supabase/utils.ts
import { supabase } from '../client';

interface User {
  id: string;
  email: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

/**
 * Obtiene todos los usuarios de la base de datos
 * @returns Promise<User[]> - Lista de usuarios
 */
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}

/**
 * Obtiene un usuario por su ID
 * @param userId - ID del usuario
 * @returns Promise<User | null> - Datos del usuario o null si no se encuentra
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error al obtener usuario ${userId}:`, error);
    return null;
  }
}

/**
 * Actualiza los datos de un usuario
 * @param userId - ID del usuario
 * @param updates - Campos a actualizar
 * @returns Promise<boolean> - True si la actualización fue exitosa
 */
export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error al actualizar usuario ${userId}:`, error);
    return false;
  }
}

/**
 * Elimina un usuario (solo para administradores)
 * @param userId - ID del usuario a eliminar
 * @returns Promise<boolean> - True si la eliminación fue exitosa
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error al eliminar usuario ${userId}:`, error);
    return false;
  }
}

/**
 * Obtiene los puntajes más altos
 * @param limit - Límite de resultados
 * @returns Promise<Array<{user_id: string, score: number}>>
 */
export async function getHighScores(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('user_id, score')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener puntajes:', error);
    return [];
  }
}
