# Sample 文档目录

OnlyOffice Document Server 编辑器需要一个真实可被 docker 容器 HTTP 访问的 docx 文件。

## 放什么

把你想演示的 docx 放在这里，文件名建议保持为 `colea-requirements.docx`（与 `OnlyOfficeEditor.tsx` 里默认 URL 一致）。

任意一个合法的 .docx 都可以，下面这些来源都可：
- 自己 Word 创建一个空文档，另存为 `.docx`
- macOS 终端：`textutil -convert docx -output public/sample/colea-requirements.docx <你的 .rtf 或 .txt>`
- OnlyOffice 官方示例：https://api.onlyoffice.com/editors/demodocs
- 课程交付的"需求分析报告.docx"原稿

## 它是怎么被读到的

- 前端 dev 跑在 `http://127.0.0.1:5173`
- OnlyOffice DS 跑在 Docker 容器里
- 容器内访问宿主机的 5173 端口通过 `http://host.docker.internal:5173/sample/colea-requirements.docx`
- 这是 `OnlyOfficeEditor.tsx` 里 `document.url` 的来源

## 没有 docx 文件时

OnlyOffice 视图会显示加载错误，自动回退到 Tiptap 视图，不影响演示其他流程。
