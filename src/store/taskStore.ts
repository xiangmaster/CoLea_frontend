import { create } from 'zustand';
import { persist, persistOptions } from '@/lib/persist';
import { SEED_SUBMISSIONS, SEED_TASKS, type Submission, type SubmissionFile, type Task } from '@/mocks/tasks';

interface TaskState {
  tasks: Task[];
  submissions: Submission[];
  publishTask: (t: Omit<Task, 'id' | 'completed' | 'status'> & { status?: Task['status'] }) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  submitWork: (input: { taskId: string; groupId: string; groupName: string; content: string; files: SubmissionFile[]; submitterName: string }) => Submission;
  gradeSubmission: (id: string, score: number, feedback: string) => void;
  reset: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,
      submissions: SEED_SUBMISSIONS,
      publishTask: (t) => {
        const id = `t-new-${Date.now()}`;
        const total = t.total ?? 4;
        const created: Task = { ...t, id, status: t.status ?? 'pending', completed: 0, total } as Task;
        set({ tasks: [...get().tasks, created] });
        return created;
      },
      updateTask: (id, patch) => set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),
      submitWork: ({ taskId, groupId, groupName, content, files, submitterName }) => {
        const s: Submission = {
          id: `s-${Date.now()}`,
          taskId,
          groupId,
          groupName,
          content,
          files,
          submittedAt: new Date().toISOString(),
          status: 'submitted',
        };
        set({
          submissions: [s, ...get().submissions],
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? { ...t, completed: Math.min(t.total, t.completed + 1), status: t.status === 'overdue' ? 'overdue' : 'in_progress' }
              : t,
          ),
        });
        return s;
      },
      gradeSubmission: (id, score, feedback) =>
        set({
          submissions: get().submissions.map((s) =>
            s.id === id ? { ...s, score, feedback, status: 'graded' } : s,
          ),
        }),
      reset: () => set({ tasks: SEED_TASKS, submissions: SEED_SUBMISSIONS }),
    }),
    persistOptions<TaskState>('tasks'),
  ),
);
