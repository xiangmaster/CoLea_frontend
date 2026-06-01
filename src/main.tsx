import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// StrictMode 会双挂载组件 → OnlyOffice 一个 iframe 还在初始化、另一个被丢弃 → 403/缓存错乱
// 演示项目里去掉 StrictMode 避免这个坑
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
