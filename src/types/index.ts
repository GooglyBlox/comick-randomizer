export interface Comic {
  id: number;
  hid: string;
  slug: string;
  title: string;
  content_rating?: "safe" | "suggestive" | "erotica";
  country?: "jp" | "kr" | "cn" | "hk" | "gb";
  desc?: string;
  status?: number; // 1: Ongoing, 2: Completed, 3: Cancelled, 4: Hiatus
  last_chapter?: number;
  translation_completed?: boolean | null;
  view_count?: number;
  demographic?: number | null;
  uploaded_at?: string;
  genres?: number[];
  user_follow_count?: number;
  year?: number;
  is_english_title?: boolean | null;
  md_titles?: Array<{ title: string }>;
  md_covers?: Array<{ w: number; h: number; b2key: string }>;
  rating?: number | null;
  bayesian_rating?: number | null;
  rating_count?: number;
  follow_count?: number;
}
