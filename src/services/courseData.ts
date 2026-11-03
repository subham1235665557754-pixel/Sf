import { FolderItem } from '../types';

// Pre-seeded folders for Course 141 (Class 11th Topper Crash Course Science Batch) matching screenshots 1, 3, 4, 5, 8
export const COURSE_141_ROOT_ITEMS: FolderItem[] = [
  {
    id: 'folder_home',
    Title: 'Home',
    material_type: 'FOLDER',
    videos_count: 514,
    files_count: 73,
    icon: 'folder',
  },
];

export const COURSE_141_HOME_ITEMS: FolderItem[] = [
  {
    id: 'folder_ebooks',
    Title: 'E-Books',
    material_type: 'FOLDER',
    videos_count: 0,
    files_count: 4,
    icon: 'ebooks',
  },
  {
    id: 'folder_maths',
    Title: 'Maths',
    material_type: 'FOLDER',
    videos_count: 71,
    files_count: 5,
    icon: 'maths',
  },
  {
    id: 'folder_chemistry',
    Title: 'Chemistry',
    material_type: 'FOLDER',
    videos_count: 101,
    files_count: 16,
    icon: 'chemistry',
  },
  {
    id: 'folder_english',
    Title: 'English',
    material_type: 'FOLDER',
    videos_count: 35,
    files_count: 0,
    icon: 'english',
  },
  {
    id: 'folder_physics',
    Title: 'Physics',
    material_type: 'FOLDER',
    videos_count: 0,
    files_count: 1,
    icon: 'physics',
  },
  {
    id: 'vid_neet_jee',
    Title: 'How To Crack NEET & JEE in First Attempt',
    material_type: 'VIDEO',
    duration: '02:16:49',
    date_and_time: '19-04-2026 at 11:00 am',
    thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2025-10-25-0_14983521030015323.jpg',
    decoded_video_link: '/sample-video.mp4',
    download_links: [
      {
        quality: '720p',
        path: '/sample-video.mp4',
      },
      {
        quality: '480p',
        path: '/sample-video.mp4',
      },
    ],
    pdf_link: 'https://static-db-v2.appx.co.in/subject/neet_jee_prep_guide.pdf',
  },
];

export const COURSE_141_ENGLISH_ITEMS: FolderItem[] = [
  {
    id: 'folder_birth',
    Title: 'Birth',
    material_type: 'FOLDER',
    videos_count: 1,
    files_count: 1,
    icon: 'folder',
  },
  {
    id: 'folder_silk_road',
    Title: 'Silk Road',
    material_type: 'FOLDER',
    videos_count: 1,
    files_count: 1,
    icon: 'folder',
  },
  {
    id: 'folder_mothers_day',
    Title: "Mother's Day",
    material_type: 'FOLDER',
    videos_count: 1,
    files_count: 1,
    icon: 'folder',
  },
  {
    id: 'folder_adventure',
    Title: 'The Adventure',
    material_type: 'FOLDER',
    videos_count: 1,
    files_count: 1,
    icon: 'folder',
  },
  {
    id: 'folder_we_are_not_afraid',
    Title: "We're not afraid to die",
    material_type: 'FOLDER',
    videos_count: 1,
    files_count: 1,
    icon: 'folder',
  },
  {
    id: 'folder_discovering_tut',
    Title: 'Discovering Tut',
    material_type: 'FOLDER',
    videos_count: 1,
    files_count: 1,
    icon: 'folder',
  },
  {
    id: 'folder_the_address',
    Title: 'The Address',
    material_type: 'FOLDER',
    videos_count: 1,
    files_count: 1,
    icon: 'folder',
  },
];

export const COURSE_141_BIRTH_ITEMS: FolderItem[] = [
  {
    id: 'vid_birth_class_xi',
    Title: 'Class XI - BIRTH Lecture',
    title: 'Class XI - BIRTH',
    material_type: 'VIDEO',
    duration: '1:25:06',
    date_and_time: '20-04-2026 at 10:00 am',
    thumbnail: 'https://appx-content-v2.classx.co.in/paid_course3/2025-10-25-0_14983521030015323.jpg',
    decoded_video_link: '/sample-video.mp4',
    pdf_link: 'https://static-db-v2.appx.co.in/subject/Class_XI_Birth_Notes.pdf',
    download_links: [
      {
        quality: '720p',
        path: '/sample-video.mp4',
      },
      {
        quality: '480p',
        path: '/sample-video.mp4',
      },
    ],
  },
];
