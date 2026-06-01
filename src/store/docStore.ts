import { create } from 'zustand';
import { persist, persistOptions } from '@/lib/persist';
import { DOC_INITIAL_HTML, SEED_COMMENTS, SEED_DOCS, SEED_VERSIONS, type Doc, type DocComment, type DocVersion } from '@/mocks/docs';

interface DocState {
  docs: Doc[];
  comments: DocComment[];
  versions: DocVersion[];
  lastSavedAt: Record<string, string>;
  updateContent: (id: string, html: string) => void;
  addComment: (c: Omit<DocComment, 'id' | 'createdAt'>) => DocComment;
  resolveComment: (id: string) => void;
  addReply: (commentId: string, reply: { authorId: string; authorName: string; body: string }) => void;
  snapshotVersion: (input: { docId: string; authorName: string; summary: string }) => DocVersion;
  restoreVersion: (id: string) => void;
  reset: () => void;
}

export const useDocStore = create<DocState>()(
  persist(
    (set, get) => ({
      docs: SEED_DOCS,
      comments: SEED_COMMENTS,
      versions: SEED_VERSIONS,
      lastSavedAt: {},
      updateContent: (id, html) =>
        set({
          docs: get().docs.map((d) => (d.id === id ? { ...d, contentHtml: html, updatedAt: new Date().toISOString() } : d)),
          lastSavedAt: { ...get().lastSavedAt, [id]: new Date().toISOString() },
        }),
      addComment: (c) => {
        const cm: DocComment = { ...c, id: `cm-${Date.now()}`, createdAt: new Date().toISOString() };
        set({ comments: [cm, ...get().comments] });
        return cm;
      },
      resolveComment: (id) =>
        set({ comments: get().comments.map((c) => (c.id === id ? { ...c, resolved: true } : c)) }),
      addReply: (commentId, reply) =>
        set({
          comments: get().comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: [
                    ...(c.replies ?? []),
                    { id: `r-${Date.now()}`, ...reply, createdAt: new Date().toISOString() },
                  ],
                }
              : c,
          ),
        }),
      snapshotVersion: ({ docId, authorName, summary }) => {
        const v: DocVersion = {
          id: `v-${Date.now()}`,
          docId,
          label: `v2.${get().versions.filter((x) => x.docId === docId).length + 1}`,
          savedAt: new Date().toISOString(),
          authorName,
          summary,
        };
        set({ versions: [v, ...get().versions] });
        return v;
      },
      restoreVersion: (id) => {
        const v = get().versions.find((x) => x.id === id);
        if (!v) return;
        set({
          docs: get().docs.map((d) => (d.id === v.docId ? { ...d, contentHtml: DOC_INITIAL_HTML, updatedAt: new Date().toISOString() } : d)),
        });
      },
      reset: () => set({ docs: SEED_DOCS, comments: SEED_COMMENTS, versions: SEED_VERSIONS, lastSavedAt: {} }),
    }),
    persistOptions<DocState>('docs'),
  ),
);
