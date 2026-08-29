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

export async function refresh(): Promise<void> {
  const list = await load();
  window.dispatchEvent(new CustomEvent('memories:updated', { detail: list }));
}

export async function createMemory(
  input: Omit<Memory, 'id' | 'createdAt'>,
): Promise<void> {
  const memory: Memory = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    ...input,
  };
  await save(memory);
  await refresh();
}
