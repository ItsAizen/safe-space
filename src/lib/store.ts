import type { Memory } from './types';

const KEY = 'safe_space_memories';
const API = '/api/memories';

export function getLocal(): Memory[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function setLocal(list: Memory[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function removeLocal(id: string): void {
  setLocal(getLocal().filter((m) => m.id !== id));
}

async function load(): Promise<Memory[]> {
  try {
    const res = await fetch(API, { cache: 'no-store' });
    const data = await res.json();
    if (!data || data.source === 'local') return getLocal();
    return Array.isArray(data.memories) ? data.memories : [];
  } catch {
    return getLocal();
  }
}

async function save(m: Memory): Promise<void> {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(m),
    });
    const data = await res.json();
    if (!data || data.source === 'local') {
      const list = getLocal();
      list.unshift(m);
      setLocal(list);
    }
  } catch {
    const list = getLocal();
    list.unshift(m);
    setLocal(list);
  }
}

async function destroy(id: string): Promise<void> {
  try {
    const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data || data.source === 'local') removeLocal(id);
  } catch {
    removeLocal(id);
  }
}

export async function refresh(): Promise<void> {
  const list = await load();
  window.dispatchEvent(new CustomEvent('memories:updated', { detail: list }));
}

export async function createMemory(
  input: Omit<Memory, 'id' | 'createdAt'> & { createdAt?: string },
): Promise<void> {
  const memory: Memory = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: input.createdAt ?? new Date().toISOString(),
    title: input.title,
    description: input.description,
    song: input.song,
    mehrdadMood: input.mehrdadMood,
    sogolMood: input.sogolMood,
    author: input.author,
  };
  await save(memory);
  await refresh();
}

export async function deleteMemory(id: string): Promise<void> {
  await destroy(id);
  await refresh();
}
