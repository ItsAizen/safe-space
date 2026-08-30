import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';

interface Memory {
  id: string;
  title: string;
  description: string;
  song: string | null;
  mehrdadMood: string | null;
  sogolMood: string | null;
  author: 'mehrdad' | 'sogol';
  date: string;
  createdAt: string;
}

const KV_KEY = 'safe-space:memories';
const hasKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Fallback to in-memory store for local dev
let localStore: Memory[] = [];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function getAll(): Promise<Memory[]> {
  if (hasKV) {
    const data = await kv.get<Memory[]>(KV_KEY);
    return data || [];
  }
  return localStore;
}

async function saveAll(memories: Memory[]): Promise<void> {
  if (hasKV) {
    await kv.set(KV_KEY, memories);
  } else {
    localStore = memories;
  }
}

export const GET: APIRoute = async () => {
  try {
    const memories = await getAll();
    return new Response(JSON.stringify(memories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/memories error:', err);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, description, song, mehrdadMood, sogolMood, author, date } = body;

    if (!title || !author) {
      return new Response(JSON.stringify({ error: 'Title and author are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newMemory: Memory = {
      id: generateId(),
      title: String(title).slice(0, 120),
      description: String(description || '').slice(0, 1000),
      song: song ? String(song).slice(0, 200) : null,
      mehrdadMood: mehrdadMood || null,
      sogolMood: sogolMood || null,
      author: author === 'sogol' ? 'sogol' : 'mehrdad',
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const memories = await getAll();
    memories.push(newMemory);
    await saveAll(memories);

    return new Response(JSON.stringify(newMemory), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/memories error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const memories = await getAll();
    const filtered = memories.filter(m => m.id !== id);

    if (filtered.length === memories.length) {
      return new Response(JSON.stringify({ error: 'Memory not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await saveAll(filtered);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('DELETE /api/memories error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
