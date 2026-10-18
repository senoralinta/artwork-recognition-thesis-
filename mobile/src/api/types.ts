export type User = {
  id?: number;
  name: string;
  email: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type ArtworkSummary = {
  id: number;
  title: string;
  artist: string | null;
  museum: string | null;
  image_url: string;
};

export type ArtworkDetail = ArtworkSummary & {
  met_object_id: number;
  year: string | null;
  type: string | null;
  museum: string | null;
  source_url: string | null;
  description_tr: string | null;
  description_en: string | null;
};

export type Candidate = {
  artwork: ArtworkSummary;
  score: number;
};

export type RecognitionResponse = {
  recognized: boolean;
  score: number;
  threshold: number;
  history_id: number | null;
  artwork: ArtworkDetail | null;
  candidates: Candidate[];
};

export type HistoryItem = {
  id: number;
  created_at: string;
  recognized: boolean;
  score: number;
  artwork: ArtworkSummary | null;
};

export type DailyResponse = {
  day: string;
  artwork: ArtworkDetail;
  fact_tr: string | null;
  fact_en: string | null;
};
