import { useState } from 'react';
import { Setup } from './components/Setup';
import { Dashboard } from './components/Dashboard';
import { ContactForm } from './components/ContactForm';
import { LanguageProvider } from './i18n/LanguageContext';
import type { Player } from './types';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const handleStartGame = (setupPlayers: Player[]) => {
    setPlayers(setupPlayers);
    setIsSetupComplete(true);
  };

  return (
    <LanguageProvider>
      <div className="app-container">
        {!isSetupComplete ? (
          <Setup
            onStartGame={handleStartGame}
          />
        ) : (
          <Dashboard
            players={players}
            setPlayers={setPlayers}
            onEndGame={() => {
              setPlayers([]);
              setIsSetupComplete(false);
            }}
            onOpenContact={() => setShowContact(true)}
          />
        )}

        {showContact && (
          <ContactForm onClose={() => setShowContact(false)} />
        )}
      </div>
    </LanguageProvider>
  );
}

export default App;
