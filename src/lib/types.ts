export interface Memory {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  song?: string;
  mehrdadMood: string;
  sogolMood: string;
  author: 'mehrdad' | 'sogol';
}
