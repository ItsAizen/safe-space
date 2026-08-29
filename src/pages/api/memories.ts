import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';
import type { Memory } from '../../lib/types';

export const prerender = false;

const KV_KEY = 'safe_space_memories';

function kvEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const GET: APIRoute = async () => {
  if (!kvEnabled()) {
    return json({ source: 'local', memories: [] });
  }
  try {
    const list = (await kv.lrange(KV_KEY, 0, -1)) as Memory[];
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return json({ source: 'kv', memories: sorted });
  } catch {
    return json({ source: 'local', memories: [] });
  }
};

export const POST: APIRoute = async ({ request }) => {
  let body: Partial<Memory>;
  try {
    body = await request.json();
  } catch {
    return json({ source: 'local', error: 'invalid body' });
  }

  const memory: Memory = {
    id: crypto.randomUUID(),
    createdAt: body.createdAt ?? new Date().toISOString(),
    title: String(body.title ?? ''),
    description: String(body.description ?? ''),
    song: body.song ? String(body.song) : undefined,
    mehrdadMood: String(body.mehrdadMood ?? 'relax'),
    sogolMood: String(body.sogolMood ?? 'wolf'),
    author: (body.author as Memory['author']) ?? 'mehrdad',
  };

  if (!kvEnabled()) {
    return json({ source: 'local', memory });
  }

  try {
    await kv.lpush(KV_KEY, memory);
    return json({ source: 'kv', memory });
  } catch {
    return json({ source: 'local', memory });
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) return json({ source: 'local', error: 'missing id' });

  if (!kvEnabled()) {
    return json({ source: 'local', id });
  }

  try {
    const list = (await kv.lrange(KV_KEY, 0, -1)) as Memory[];
    const filtered = list.filter((m) => m.id !== id);
    await kv.del(KV_KEY);
    if (filtered.length) await kv.rpush(KV_KEY, ...filtered);
    return json({ source: 'kv', id });
  } catch {
    return json({ source: 'local', id });
  }
};
