import React, { useState } from 'react';
import RealNESEmulator from './RealNESEmulator';
import './Game.css';

interface NESGame {
  id: string;
  name: string;
  year: number;
  category: string;
  description: string;
  publisher: string;
  romUrl: string;
  size: string;
}

const classicNESGames: NESGame[] = [
  {
    id: 'super-mario-bros',
    name: 'Super Mario Bros.',
    year: 1985,
    category: 'Platformer',
    description: 'The iconic platformer that defined a generation. Save Princess Peach from Bowser!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Super%20Mario%20Bros.%20%28USA%29.nes',
    size: '40KB'
  },
  {
    id: 'super-mario-bros-3',
    name: 'Super Mario Bros. 3',
    year: 1990,
    category: 'Platformer',
    description: 'The ultimate Mario adventure with power-ups, worlds, and amazing graphics!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Super%20Mario%20Bros.%203%20%28USA%29.nes',
    size: '384KB'
  },
  {
    id: 'legend-of-zelda',
    name: 'The Legend of Zelda',
    year: 1986,
    category: 'Adventure',
    description: 'The epic adventure that started it all. Explore dungeons and save Princess Zelda!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/The%20Legend%20of%20Zelda%20%28USA%29.nes',
    size: '128KB'
  },
  {
    id: 'metroid',
    name: 'Metroid',
    year: 1986,
    category: 'Action-Adventure',
    description: 'Explore alien worlds as Samus Aran in this groundbreaking action-adventure!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Metroid%20%28USA%29.nes',
    size: '128KB'
  },
  {
    id: 'mega-man',
    name: 'Mega Man',
    year: 1987,
    category: 'Action',
    description: 'Fight Dr. Wily\'s robot masters in this classic action platformer!',
    publisher: 'Capcom',
    romUrl: 'https://archive.org/download/nes-roms/Mega%20Man%20%28USA%29.nes',
    size: '128KB'
  },
  {
    id: 'castlevania',
    name: 'Castlevania',
    year: 1986,
    category: 'Action',
    description: 'Vampire hunting action in Dracula\'s castle with the legendary whip!',
    publisher: 'Konami',
    romUrl: 'https://archive.org/download/nes-roms/Castlevania%20%28USA%29.nes',
    size: '128KB'
  },
  {
    id: 'contra',
    name: 'Contra',
    year: 1988,
    category: 'Shooter',
    description: 'Run and gun action against alien invaders. The ultimate co-op experience!',
    publisher: 'Konami',
    romUrl: 'https://archive.org/download/nes-roms/Contra%20%28USA%29.nes',
    size: '128KB'
  },
  {
    id: 'pac-man',
    name: 'Pac-Man',
    year: 1984,
    category: 'Arcade',
    description: 'The classic maze chase game. Eat dots and avoid the ghosts!',
    publisher: 'Namco',
    romUrl: 'https://archive.org/download/nes-roms/Pac-Man%20%28USA%29.nes',
    size: '16KB'
  },
  {
    id: 'tetris',
    name: 'Tetris',
    year: 1989,
    category: 'Puzzle',
    description: 'The addictive block-stacking puzzle game that took the world by storm!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Tetris%20%28USA%29.nes',
    size: '48KB'
  },
  {
    id: 'duck-hunt',
    name: 'Duck Hunt',
    year: 1984,
    category: 'Shooter',
    description: 'Hunt ducks with your trusty dog companion. Classic light gun action!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Duck%20Hunt%20%28USA%29.nes',
    size: '24KB'
  },
  {
    id: 'donkey-kong',
    name: 'Donkey Kong',
    year: 1983,
    category: 'Platformer',
    description: 'The arcade classic that introduced Mario to the world!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Donkey%20Kong%20%28USA%29.nes',
    size: '24KB'
  },
  {
    id: 'kirby-adventure',
    name: 'Kirby\'s Adventure',
    year: 1993,
    category: 'Platformer',
    description: 'Kirby\'s first console adventure with amazing graphics and abilities!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Kirby%27s%20Adventure%20%28USA%29.nes',
    size: '512KB'
  },
  {
    id: 'final-fantasy',
    name: 'Final Fantasy',
    year: 1990,
    category: 'RPG',
    description: 'The first Final Fantasy game that started the legendary RPG series!',
    publisher: 'Square',
    romUrl: 'https://archive.org/download/nes-roms/Final%20Fantasy%20%28USA%29.nes',
    size: '256KB'
  },
  {
    id: 'dragon-warrior',
    name: 'Dragon Warrior',
    year: 1989,
    category: 'RPG',
    description: 'The first Dragon Quest game in the West. Classic turn-based RPG!',
    publisher: 'Enix',
    romUrl: 'https://archive.org/download/nes-roms/Dragon%20Warrior%20%28USA%29.nes',
    size: '64KB'
  },
  {
    id: 'excitebike',
    name: 'Excitebike',
    year: 1984,
    category: 'Racing',
    description: 'High-speed motorcycle racing with track editor!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Excitebike%20%28USA%29.nes',
    size: '32KB'
  },
  {
    id: 'ice-climber',
    name: 'Ice Climber',
    year: 1985,
    category: 'Platformer',
    description: 'Climb mountains and break ice blocks in this classic platformer!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Ice%20Climber%20%28USA%29.nes',
    size: '24KB'
  },
  {
    id: 'balloon-fight',
    name: 'Balloon Fight',
    year: 1985,
    category: 'Arcade',
    description: 'Float around and pop enemy balloons in this addictive arcade game!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Balloon%20Fight%20%28USA%29.nes',
    size: '24KB'
  },
  {
    id: 'clu-clu-land',
    name: 'Clu Clu Land',
    year: 1985,
    category: 'Puzzle',
    description: 'Navigate through mazes and collect golden ingots!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Clu%20Clu%20Land%20%28USA%29.nes',
    size: '24KB'
  },
  {
    id: 'wrecking-crew',
    name: 'Wrecking Crew',
    year: 1985,
    category: 'Puzzle',
    description: 'Demolish buildings while avoiding enemies in this unique puzzle game!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Wrecking%20Crew%20%28USA%29.nes',
    size: '24KB'
  },
  {
    id: 'dr-mario',
    name: 'Dr. Mario',
    year: 1990,
    category: 'Puzzle',
    description: 'Match colored pills to eliminate viruses in this medical-themed puzzle!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Dr.%20Mario%20%28USA%29.nes',
    size: '64KB'
  },
  {
    id: 'yoshi',
    name: 'Yoshi',
    year: 1991,
    category: 'Puzzle',
    description: 'Yoshi\'s first starring role in this egg-matching puzzle game!',
    publisher: 'Nintendo',
    romUrl: 'https://archive.org/download/nes-roms/Yoshi%20%28USA%29.nes',
    size: '64KB'
  }
];

const Game: React.FC = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'selector' | 'emulator'>('menu');
  const [selectedGame, setSelectedGame] = useState<NESGame | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(classicNESGames.map(game => game.category)))];

  const filteredGames = classicNESGames.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGameSelect = (game: NESGame) => {
    setSelectedGame(game);
    setCurrentView('emulator');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setSelectedGame(null);
  };

  const handleBackToSelector = () => {
    setCurrentView('selector');
    setSelectedGame(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  if (currentView === 'emulator' && selectedGame) {
    return (
      <div className="game-container">
        <div className="game-header">
          <div>
            <div className="game-title">{selectedGame.name}</div>
            <div className="game-subtitle">Real NES Emulator - {selectedGame.year}</div>
          </div>
          <button className="back-button" onClick={handleBackToSelector}>
            ← Back to Games
          </button>
        </div>
        <div className="game-content">
          <RealNESEmulator 
            selectedGame={selectedGame}
            onBack={handleBackToSelector} 
          />
        </div>
      </div>
    );
  }

  if (currentView === 'selector') {
    return (
      <div className="game-container">
        <div className="game-header">
          <div>
            <div className="game-title">NES Game Library</div>
            <div className="game-subtitle">Select Your Classic Game</div>
          </div>
          <button className="back-button" onClick={handleBackToMenu}>
            ← Back to Menu
          </button>
        </div>
        <div className="game-content">
          <div className="game-selector">
            <div className="selector-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="category-filter">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredGames.length > 0 ? (
              <div className="games-grid">
                {filteredGames.map(game => (
                  <div
                    key={game.id}
                    className="game-card"
                    onClick={() => handleGameSelect(game)}
                  >
                    <div className="game-card-header">
                      <div className="game-name">{game.name}</div>
                      <div className="game-year">{game.year}</div>
                    </div>
                    <div className="game-card-body">
                      <div className="game-category">{game.category}</div>
                      <div className="game-description">{game.description}</div>
                      <div className="game-publisher">{game.publisher}</div>
                      <div className="game-size">Size: {game.size}</div>
                    </div>
                    <div className="game-card-footer">
                      <button className="play-button">PLAY NOW</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-games">
                <p>No games found matching your criteria.</p>
                <button className="clear-filters" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div>
          <div className="game-title">वास्तविक एनईएस एमुलेटर</div>
          <div className="game-subtitle">क्लासिक एनईएस गेम खेलें</div>
        </div>
      </div>
      <div className="game-content">
        <div className="game-menu">
          <div className="menu-logo">
            <div className="nes-logo">NES</div>
            <div className="emulator-title">वास्तविक मनोरंजन प्रणाली</div>
          </div>
          
          <div className="menu-options">
            <button 
              className="menu-button primary"
              onClick={() => setCurrentView('selector')}
            >
              🎮 खेल खेलें
            </button>
            <button className="menu-button secondary">
              📊 उच्च स्कोर
            </button>
            <button className="menu-button secondary">
              ⚙️ सेटिंग्स
            </button>
          </div>

          <div className="menu-info">
            <p>वास्तविक एनईएस एमुलेटर में आपका स्वागत है!</p>
            <p>प्रामाणिक अनुकरण के साथ 20+ क्लासिक एनईएस गेम्स फीचर कर रहा है।</p>
            <p>सभी गेम्स सार्वजनिक डोमेन स्रोतों से लोड किए गए हैं।</p>
          </div>

          <div className="controls-info">
            <strong>एनईएस नियंत्रण:</strong><br/>
            तीर कुंजियां: डी-पैड<br/>
            A/S: A/B बटन<br/>
            Enter: शुरू<br/>
            Shift: चयन<br/>
            P: विराम, R: रीसेट
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;