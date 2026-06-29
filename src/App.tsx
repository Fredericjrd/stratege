import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getApiKey } from './lib/storage';
import { ApiKeySetup } from './components/ApiKeySetup';
import { Nav } from './components/Nav';
import { Board } from './features/board/Board';
import { Practice } from './features/practice/Practice';
import { Rules } from './features/rules/Rules';
import { Articles } from './features/articles/Articles';
import { Certification } from './features/certification/Certification';

export default function App() {
  const [apiKeyReady, setApiKeyReady] = useState<boolean | null>(null);

  useEffect(() => {
    getApiKey().then((key) => setApiKeyReady(!!key));
  }, []);

  if (apiKeyReady === null) return null;

  if (!apiKeyReady) {
    return <ApiKeySetup onSaved={() => setApiKeyReady(true)} />;
  }

  return (
    <BrowserRouter basename="/stratege">
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Board />} />
          <Route path="/entrainement" element={<Practice />} />
          <Route path="/regles" element={<Rules />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/certification" element={<Certification />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
