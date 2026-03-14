import { useState } from 'react';
import { Setup } from './components/Setup';
import { Dashboard } from './components/Dashboard';
import type { Player } from './types';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const handleStartGame = (setupPlayers: Player[]) => {
    setPlayers(setupPlayers);
    setIsSetupComplete(true);
  };

  return (
    <div className="app-container">
      {!isSetupComplete ? (
        <Setup onStartGame={handleStartGame} />
      ) : (
        <Dashboard players={players} setPlayers={setPlayers} />
      )}
    </div>
  );
}

export default App;
