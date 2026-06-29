import { useState } from 'react';
import { setApiKey } from '../lib/storage';

interface Props {
  onSaved: () => void;
}

export function ApiKeySetup({ onSaved }: Props) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.startsWith('sk-ant-')) {
      setError('La clé doit commencer par sk-ant-');
      return;
    }
    setSaving(true);
    try {
      await setApiKey(value.trim());
      onSaved();
    } catch {
      setError('Erreur lors de l’enregistrement. Réessayer.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-[#0B1F3A] mb-2" style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}>
            Stratège
          </h1>
          <p className="text-[#3D5A73] text-sm leading-relaxed">
            Entraînement au français professionnel de haut niveau.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#D4CFC6] rounded-lg p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#0B1F3A] mb-1">Clé API Anthropic</h2>
          <p className="text-sm text-[#3D5A73] mb-4 leading-relaxed">
            L&apos;application appelle l&apos;API Claude directement depuis votre navigateur. La clé est stockée localement, jamais transmise à un serveur tiers.
          </p>

          <label className="block text-xs font-medium text-[#0B1F3A] mb-1 uppercase tracking-wide">
            Clé API
          </label>
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            placeholder="sk-ant-api03-..."
            className="w-full border border-[#D4CFC6] rounded px-3 py-2 text-sm font-mono text-[#0B1F3A] focus:outline-none focus:border-[#3D5A73] bg-[#F7F5F0]"
            autoComplete="off"
          />
          {error && <p className="text-xs text-[#A8342A] mt-1">{error}</p>}

          <button
            type="submit"
            disabled={saving || !value}
            className="mt-4 w-full bg-[#0B1F3A] text-white text-sm font-medium rounded px-4 py-2.5 hover:bg-[#1a3556] disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D5A73] focus:ring-offset-2"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer et démarrer'}
          </button>
        </form>

        <p className="text-xs text-[#3D5A73] mt-4 text-center">
          Obtenir une clé sur{' '}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#0B1F3A]"
          >
            console.anthropic.com
          </a>
        </p>
      </div>
    </div>
  );
}
