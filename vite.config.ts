import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    // 监听所有接口，让 Docker 里的 OnlyOffice DS 能通过 host.docker.internal:5173 拉到示例 docx
    host: '0.0.0.0',
    open: false,
    // Vite 5 默认用 Host header 白名单挡掉非 localhost 的来源（返回 403）；
    // 加上自定义本地域名 + OnlyOffice 容器域名
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'host.docker.internal',
      '.docker.internal',
      'colea.edu.cn',
      '.colea.edu.cn',
    ],
    // 通过 Caddy 反代时 HMR 走域名
    hmr: {
      host: 'colea.edu.cn',
      protocol: 'ws',
      clientPort: 80,
    },
  },
});
