import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { classNames } from '@/lib/format';

interface Props {
  initialHtml: string;
  onChange?: (html: string) => void;
  onEditorReady?: (e: Editor) => void;
  onSelectText?: (text: string) => void;
  editable?: boolean;
}

export function TiptapEditor({ initialHtml, onChange, onEditorReady, onSelectText, editable = true }: Props) {
  const lastReportedRef = useRef('');
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: initialHtml,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== lastReportedRef.current) {
        lastReportedRef.current = html;
        onChange?.(html);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, ' ');
        if (text.trim()) onSelectText?.(text);
      } else {
        onSelectText?.('');
      }
    },
  });

  useEffect(() => {
    if (editor) onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  return (
    <div className={classNames('flex-1 px-12 py-10 bg-white overflow-y-auto')}>
      <EditorContent editor={editor} />
    </div>
  );
}

interface ToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return <div className="h-10 border-b border-slate-100 bg-white" />;

  const Btn = ({ active, onClick, children, label }: { active?: boolean; onClick: () => void; children: React.ReactNode; label?: string }) => (
    <button
      onClick={onClick}
      title={label}
      className={classNames(
        'w-7 h-7 rounded flex items-center justify-center text-sm transition',
        active ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100 text-slate-600',
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1 bg-white flex-wrap">
      <select
        onChange={(e) => {
          const lvl = Number(e.target.value);
          if (lvl === 0) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: lvl as 1 | 2 | 3 }).run();
        }}
        className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-600"
      >
        <option value="0">正文</option>
        <option value="1">标题1</option>
        <option value="2">标题2</option>
        <option value="3">标题3</option>
      </select>
      <select className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-600 ml-1" defaultValue="Inter">
        <option>Inter</option>
        <option>宋体</option>
        <option>等宽</option>
      </select>
      <select className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-600 ml-1" defaultValue="14">
        <option>12</option>
        <option>14</option>
        <option>16</option>
        <option>18</option>
      </select>
      <div className="w-px h-5 bg-slate-200 mx-2" />
      <Btn label="加粗" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </Btn>
      <Btn label="斜体" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </Btn>
      <Btn label="下划线" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </Btn>
      <div className="w-px h-5 bg-slate-200 mx-2" />
      <Btn label="无序列表" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        ≡
      </Btn>
      <Btn label="有序列表" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        ①
      </Btn>
      <Btn label="引用" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ❝
      </Btn>
      <div className="w-px h-5 bg-slate-200 mx-2" />
      <Btn label="撤销" onClick={() => editor.chain().focus().undo().run()}>↶</Btn>
      <Btn label="重做" onClick={() => editor.chain().focus().redo().run()}>↷</Btn>
    </div>
  );
}
