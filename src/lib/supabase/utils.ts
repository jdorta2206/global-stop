import { supabase } from '../client';

interface User {
    id: string;
    email: string;
    created_at: string;
}

export async function getUsers(): Promise<User[]> {
    const { data, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
    }

    return data || [];
}