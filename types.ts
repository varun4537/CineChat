export interface Movie {
  title: string;
  year?: number;
  director?: string;
  genres: string[];
  language: string;
  country: string;
  summary: string;
  recommender?: string; // If the chat log identifies who recommended it
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  mentionCount?: number; // How many times this movie was discussed/mentioned
}

export interface AnalysisResult {
  movies: Movie[];
  totalMessagesAnalyzed: number; // Placeholder for now, or estimated
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  READING_FILE = 'READING_FILE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}