import { useEffect, useMemo, useRef, useState } from 'react';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  docId: string;
  docTitle: string;
  docxPath: string;
  fileType?: string;
  userId: string;
  userName: string;
  mode?: 'edit' | 'view';
  onError?: (err: string) => void;
}

const DS_URL = (import.meta.env.VITE_ONLYOFFICE_URL as string | undefined) ?? 'http://localhost:8080';
const DOC_HOST = (import.meta.env.VITE_ONLYOFFICE_DOC_HOST as string | undefined) ?? 'http://host.docker.internal:5173';

/** 探测 Document Server 是否就绪：浏览器没法读 healthcheck 的 body（CORS），
 * 但能用 Image 加载 `/welcome` favicon 等检测连通性。这里用 fetch + AbortSignal.timeout
 * 走 no-cors 模式，能否成功完成 = 端口可达 */
async function probeDS(): Promise<boolean> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    await fetch(`${DS_URL}/web-apps/apps/api/documents/api.js`, {
      mode: 'no-cors',
      signal: ctl.signal,
    });
    clearTimeout(t);
    return true;
  } catch {
    return false;
  }
}

export function OnlyOfficeEditor({ docId, docTitle, docxPath, fileType = 'docx', userId, userName, mode = 'edit', onError }: Props) {
  const [phase, setPhase] = useState<'checking' | 'down' | 'ready' | 'errored'>('checking');
  const [errMsg, setErrMsg] = useState('');
  // 每次组件挂载固定一个 key，避免 React StrictMode 双挂载导致 key 不一致 → 403
  const keyRef = useRef<string>(`${docId}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await probeDS();
      if (cancelled) return;
      if (!ok) {
        setPhase('down');
        onError?.('Document Server 未就绪');
      } else {
        setPhase('ready');
      }
    })();
    return () => { cancelled = true; };
  }, [onError]);

  const config = useMemo(
    () => ({
      document: {
        fileType,
        // 单次挂载内 key 必须稳定（取自 ref）
        key: keyRef.current,
        title: `${docTitle}.${fileType}`,
        url: `${DOC_HOST}${docxPath}`,
        permissions: {
          comment: true,
          download: true,
          edit: mode === 'edit',
          print: true,
          review: mode === 'edit',
        },
      },
      documentType: fileType === 'xlsx' ? 'cell' : fileType === 'pptx' ? 'slide' : 'word',
      editorConfig: {
        mode,
        lang: 'zh-CN',
        user: { id: userId, name: userName },
        customization: {
          autosave: true,
          forcesave: false,
          compactToolbar: false,
          chat: true,
          comments: true,
          help: false,
          plugins: false,
        },
      },
    }),
    [docId, docTitle, docxPath, fileType, userId, userName, mode],
  );

  if (phase === 'checking') {
    return (
      <div className="flex-1 flex items-center justify-center bg-white" style={{ minHeight: 500 }}>
        <div className="text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
          <div className="text-sm">正在连接 OnlyOffice Document Server …</div>
          <div className="text-xs text-slate-400 mt-1">{DS_URL}</div>
        </div>
      </div>
    );
  }

  if (phase === 'down') {
    return (
      <div className="flex-1 flex items-center justify-center bg-amber-50 border-y border-amber-100" style={{ minHeight: 500 }}>
        <div className="text-center max-w-md px-6">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <div className="text-sm font-semibold text-amber-800 mb-1">OnlyOffice Document Server 未就绪</div>
          <div className="text-xs text-amber-700 leading-relaxed">
            预期地址 <code className="bg-amber-100 px-1 rounded">{DS_URL}</code> 未响应。请确认本地 Docker 已启动：
            <pre className="text-left bg-amber-100/60 rounded p-2 mt-2 text-amber-900 overflow-x-auto">cd onlyoffice && docker compose up -d</pre>
            首次拉镜像约 5~8 分钟，启动后 30s 健康检查通过即可刷新本页。已自动回退到 Tiptap 简易视图。
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'errored') {
    return (
      <div className="flex-1 flex items-center justify-center bg-red-50" style={{ minHeight: 500 }}>
        <div className="text-center text-red-700 text-sm px-6">
          <div className="font-semibold mb-1">OnlyOffice 编辑器加载失败</div>
          <div className="text-xs">{errMsg}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white onlyoffice-shell"
      style={{ height: 'calc(100vh - 230px)', minHeight: 560 }}
    >
      <DocumentEditor
        id={`onlyoffice-${docId}`}
        documentServerUrl={DS_URL}
        config={config as any}
        height="100%"
        width="100%"
        events_onAppReady={() => {
          // noop
        }}
        onLoadComponentError={(code, desc) => {
          setPhase('errored');
          setErrMsg(`[${code}] ${desc}`);
          onError?.(`${code}: ${desc}`);
        }}
      />
    </div>
  );
}
