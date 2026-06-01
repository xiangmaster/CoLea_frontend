import { create } from 'zustand';
import { persist, persistOptions } from '@/lib/persist';
import { SEED_COURSES, type Course } from '@/mocks/courses';

interface CourseState {
  courses: Course[];
  create: (input: Omit<Course, 'id' | 'progress' | 'studentCount' | 'taskCount' | 'docCount'> & Partial<Pick<Course, 'progress' | 'studentCount' | 'taskCount' | 'docCount'>>) => Course;
  reset: () => void;
}

const PALETTES = [
  { gradient: 'from-rose-500 to-rose-600', shortCode: '?' },
  { gradient: 'from-emerald-500 to-emerald-600', shortCode: '?' },
  { gradient: 'from-amber-500 to-amber-600', shortCode: '?' },
  { gradient: 'from-indigo-500 to-indigo-600', shortCode: '?' },
];

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: SEED_COURSES,
      create: (input) => {
        const palette = PALETTES[get().courses.length % PALETTES.length];
        const c: Course = {
          id: `c-new-${Date.now()}`,
          progress: 0,
          studentCount: 0,
          taskCount: 0,
          docCount: 0,
          ...input,
          gradient: input.gradient ?? palette.gradient,
          shortCode: input.shortCode ?? input.name.slice(0, 2).toUpperCase(),
        } as Course;
        set({ courses: [...get().courses, c] });
        return c;
      },
      reset: () => set({ courses: SEED_COURSES }),
    }),
    persistOptions<CourseState>('courses'),
  ),
);
