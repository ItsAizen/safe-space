export interface Mood {
  key: string;
  label: string;
  emoji: string;
}

export const MEHRDAD_MOODS: Mood[] = [
  { key: 'relax', label: 'ریلکس / خفن', emoji: '😎' },
  { key: 'tired', label: 'خسته', emoji: '🫠' },
  { key: 'overwhelmed', label: 'پشم‌ریزون', emoji: '🤯' },
  { key: 'tea', label: 'چای به دست', emoji: '🍵' },
];

export const SOGOL_MOODS: Mood[] = [
  { key: 'wolf', label: 'گرگی / مود', emoji: '🐺' },
  { key: 'helpless', label: 'مظلوم', emoji: '🥺' },
  { key: 'laughing', label: 'در حال پاره شدن', emoji: '😂' },
  { key: 'sweet', label: 'شکر‌لازم', emoji: '🍧' },
];

export function findMood(list: Mood[], key: string): Mood | undefined {
  return list.find((m) => m.key === key);
}

export const AUTHOR_LABEL: Record<string, string> = {
  mehrdad: 'مهرداد',
  sogol: 'سوگل',
};
