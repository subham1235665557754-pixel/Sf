export interface Batch {
  id: number | string;
  title: string;
  thumbnail: string;
  badge?: string;
}

export interface FolderItem {
  id: string | number;
  Title: string;
  title?: string;
  material_type?: string;
  type?: string;
  videos_count?: number | string;
  files_count?: number | string;
  tests_count?: number | string;
  thumbnail?: string;
  icon?: string;
  duration?: string | number;
  duration_in_secs?: number;
  date_and_time?: string;
  pdf_link?: string;
  pdf_link2?: string;
  file_link?: string;
  decoded_video_link?: string;
  download_links?: { quality: string; path: string }[];
  is_upcoming?: boolean;
}

export interface BreadcrumbNav {
  id: string | number;
  title: string;
}

export interface BreadcrumbStep {
  level: string;
  title: string;
  id?: string;
  meta?: any;
}

export interface Subject {
  subjectid: string;
  subject_name: string;
  subject_logo?: string;
  sortingparam?: string | number;
  is_paid?: string;
}

export interface Topic {
  topicid: string;
  topic_name: string;
  topic_logo?: string;
  sortingparam?: number;
}

export interface Concept {
  conceptid: string;
  concept_name: string;
  concept_logo?: string;
  sortingparam?: number;
}

export interface DownloadLink {
  bitrate?: string;
  quality: string;
  path: string;
  backup_url?: string;
  backup_url2?: string;
}

export interface VideoLecture {
  id: string;
  Title: string;
  material_type?: string;
  thumbnail: string;
  course_id: string;
  subject?: string;
  topic?: string;
  concept?: string;
  pdf_link?: string;
  pdf_link2?: string;
  date_and_time: string;
  strtotime?: number;
  duration?: string | number;
  duration_in_secs?: number;
  download_link?: string;
  download_links?: DownloadLink[];
  file_link?: string;
  livestream_links?: { quality: string; path: string }[];
  live_status?: string | number;
  description?: string;
}

export type ViewLevel = 'batches' | 'subjects' | 'topics' | 'concepts' | 'videos';
