import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';

const MEMORIES_KEY = 'safe-space:memories';

interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  author: 'mehrdad' | 'sogol';
  song?: string;
  moodMehrdad: string;
  moodSogol: string;
  createdAt: number;
}

const isKvConfigured = () => {
  return !!(import.meta.env.KV_REST_API_URL && import.meta.env.KV_REST_API_TOKEN);
};

const getLocalMemories = (): Memory[] => {
  try {
    const data = localStorage.getItem(MEMORIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocalMemories = (memories: Memory[]) => {
  try {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

const getMemories = async (): Promise<Memory[]> => {
  if (isKvConfigured()) {
    try {
      const data = await kv.get<Memory[]>(MEMORIES_KEY);
      return data || [];
    } catch (e) {
      console.error('KV GET failed, falling back to localStorage:', e);
      return getLocalMemories();
    }
  }
  return getLocalMemories();
};

const saveMemories = async (memories: Memory[]): Promise<void> => {
  if (isKvConfigured()) {
    try {
      await kv.set(MEMORIES_KEY, memories);
      return;
    } catch (e) {
      console.error('KV SET failed, falling back to localStorage:', e);
    }
  }
  setLocalMemories(memories);
};

export const GET: APIRoute = async () => {
  try {
    const memories = await getMemories();
    const sorted = memories.sort((a, b) => b.createdAt - a.createdAt);
    return new Response(JSON.stringify(sorted), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    console.error('GET /api/memories error:', e);
    return new Response(JSON.stringify({ error: 'Failed to fetch memories' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const memories = await getMemories();

    const newMemory: Memory = {
      id: crypto.randomUUID(),
      title: formData.get('title')?.toString().trim() || '',
      description: formData.get('description')?.toString().trim() || '',
      date: formData.get('date')?.toString().trim() || '',
      time: formData.get('time')?.toString().trim() || '',
      author: (formData.get('author')?.toString() as 'mehrdad' | 'sogol') || 'mehrdad',
      song: formData.get('song')?.toString().trim() || undefined,
      moodMehrdad: formData.get('moodMehrdad')?.toString().trim() || '',
      moodSogol: formData.get('moodSogol')?.toString().trim() || '',
      createdAt: Date.now(),
    };

    if (!newMemory.title || !newMemory.description || !newMemory.date || !newMemory.time) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    memories.unshift(newMemory);
    await saveMemories(memories);

    return new Response(JSON.stringify(newMemory), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('POST /api/memories error:', e);
    return new Response(JSON.stringify({ error: 'Failed to create memory' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), { status: 400 });
    }

    const memories = await getMemories();
    const filtered = memories.filter(m => m.id !== id);

    if (filtered.length === memories.length) {
      return new Response(JSON.stringify({ error: 'Memory not found' }), { status: 404 });
    }

    await saveMemories(filtered);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('DELETE /api/memories error:', e);
    return new Response(JSON.stringify({ error: 'Failed to delete memory' }), { status: 500 });
  }
};