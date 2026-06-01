import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/Toaster';
import { DemoToolbar } from './components/nav/DemoToolbar';
import { CommandPalette } from './components/nav/CommandPalette';

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
      <Toaster />
      <CommandPalette />
      <DemoToolbar />
    </HashRouter>
  );
}
