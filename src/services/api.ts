import { Batch, Concept, FolderItem, Subject, Topic, VideoLecture } from '../types';

export interface ApiConfig {
  domain: string;
  courseid: number | string;
  pdf_view_api: string;
  pdf_dow_api: string;
  player_url: string;
  token: string;
}

// Fallback seed data in case network is disconnected
const FALLBACK_BATCHES: Batch[] = [
  {
    id: 757,
    title: 'RWA Bihar Board Class 12th Free batch',
    thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2026-09-16-0.6407783334322323.jpeg',
  },
  {
    id: 756,
    title: 'RWA Bihar Board Class 11th Free batch',
    thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2026-09-16-0.8552371198563197.jpeg',
  },
  {
    id: 744,
    title: 'CLASS 12th CBSE – Free Classes | RWA CBSE Classes',
    thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2026-09-08-0.4262491479823469.jpeg',
  },
];

export async function fetchApiConfig(): Promise<ApiConfig> {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const json = await res.json();
      return json.config;
    }
  } catch (e) {
    console.warn('Config fetch warning:', e);
  }
  return {
    domain: 'rozgarapinew.teachx.in',
    courseid: 757,
    pdf_view_api: 'https://pdfweb.classx.co.in/pdfjs-latest/web/viewer.html?file=',
    pdf_dow_api: 'https://pdf-appx.edumate.life/?url=',
    player_url: 'https://studybeepro.site/player.html',
    token: '',
  };
}

export async function fetchBatches(): Promise<Batch[]> {
  try {
    const res = await fetch('/api/batches');
    if (res.ok) {
      const data = await res.json();
      const list = [...(data.new || []), ...(data.old || [])];
      if (list.length > 0) {
        localStorage.setItem('studybee_cached_batches', JSON.stringify(list));
        return list;
      }
    }
  } catch (err) {
    console.warn('Batches API error, checking cache:', err);
  }

  const cached = localStorage.getItem('studybee_cached_batches');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  return FALLBACK_BATCHES;
}

export async function fetchCourseSubjects(courseId: string | number): Promise<Subject[]> {
  const cacheKey = `studybee_subjects_${courseId}`;
  try {
    const res = await fetch(`/api/content?action=subjects&courseid=${courseId}`);
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Subjects fetch error:', err);
  }

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  // Fallback default for course 757
  if (String(courseId) === '757') {
    return [
      { subjectid: '3531', subject_name: 'Maths ( Pratibha Batch )', subject_logo: '' },
      { subjectid: '3532', subject_name: 'Biology ( Pratibha Batch )', subject_logo: '' },
    ];
  }
  return [];
}

export async function fetchSubjectTopics(courseId: string | number, subjectId: string): Promise<Topic[]> {
  const cacheKey = `studybee_topics_${courseId}_${subjectId}`;
  try {
    const res = await fetch(`/api/content?action=topics&courseid=${courseId}&subjectid=${subjectId}`);
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Topics fetch error:', err);
  }

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  if (subjectId === '3531') {
    return [
      { topicid: '42167', topic_name: 'त्रिविमीय ज्यामिति_ CHAPTER 11' },
      { topicid: '42324', topic_name: 'सदिश बीजगणित - CHAPTER 10' },
      { topicid: '42333', topic_name: 'अवकल समीकरण # - CHAPTER 09' },
      { topicid: '42521', topic_name: 'रैखिक प्रोग्रामिंग_' },
      { topicid: '42741', topic_name: 'प्रायिकता:' },
    ];
  }
  return [];
}

export async function fetchTopicConcepts(
  courseId: string | number,
  subjectId: string,
  topicId: string
): Promise<Concept[]> {
  const cacheKey = `studybee_concepts_${courseId}_${subjectId}_${topicId}`;
  try {
    const res = await fetch(`/api/content?action=concepts&courseid=${courseId}&subjectid=${subjectId}&topicid=${topicId}`);
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Concepts fetch error:', err);
  }

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  return [
    {
      conceptid: '1',
      concept_name: 'All video',
      concept_logo: 'https://lh3.googleusercontent.com/hzWH_Rv1s6J8BU51P0QG6-R6ofYM6XFa0OLxPqLsXmmowu0IxYjhJk_exVQhNqESwyE=s360',
    },
  ];
}

export async function fetchConceptVideos(
  courseId: string | number,
  subjectId: string,
  topicId: string,
  conceptId: string
): Promise<VideoLecture[]> {
  const cacheKey = `studybee_videos_${courseId}_${subjectId}_${topicId}_${conceptId}`;
  try {
    const res = await fetch(
      `/api/content?action=videos&courseid=${courseId}&subjectid=${subjectId}&topicid=${topicId}&conceptid=${conceptId}&start=0`
    );
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        // Sort lectures logically: e.g. from #1 to #8 or by date
        const sorted = [...json.data].sort((a: any, b: any) => {
          const matchA = (a.Title || '').match(/#(\d+)/);
          const matchB = (b.Title || '').match(/#(\d+)/);
          if (matchA && matchB) {
            return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
          }
          return (a.strtotime || 0) - (b.strtotime || 0);
        });
        localStorage.setItem(cacheKey, JSON.stringify(sorted));
        return sorted;
      }
    }
  } catch (err) {
    console.warn('Videos fetch error:', err);
  }

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return [];
}

/**
 * Fetch live folder contents from studybeepro.site via proxy
 */
export async function fetchStudyBeeFolderContents(
  courseId: string | number,
  parentId: string | number = '-1',
  start: number = 0
): Promise<FolderItem[]> {
  const cacheKey = `studybee_sf_folder_${courseId}_${parentId}_${start}`;
  try {
    const res = await fetch(`/get/folder_contentsv3?course_id=${courseId}&parent_id=${parentId}&start=${start}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.status === 200 && Array.isArray(json.data) && json.data.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn(`[StudyBee API] Folder content fetch warning for ${courseId}/${parentId}:`, err);
  }

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return [];
}

/**
 * Fetch live video playback details and tokens from studybeepro.site
 */
export async function fetchStudyBeeVideoDetails(
  courseId: string | number,
  videoId: string | number
): Promise<any> {
  const cacheKey = `studybee_sf_vid_details_${courseId}_${videoId}`;
  try {
    const res = await fetch(`/get/fetchVideoDetailsById?course_id=${courseId}&video_id=${videoId}`);
    if (res.ok) {
      const json = await res.json();
      if (json && (json.success || json.decoded_video_link)) {
        localStorage.setItem(cacheKey, JSON.stringify(json));
        return json;
      }
    }
  } catch (err) {
    console.warn(`[StudyBee API] Video details fetch error for ${courseId}/${videoId}:`, err);
  }

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return null;
}

