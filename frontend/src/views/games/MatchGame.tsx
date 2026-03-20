import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ArrowLeft, Trophy, RefreshCw } from 'lucide-react';
import { useGetWordsQuery } from '../../store/apiSlice';
import './MatchGame.css';

interface MatchGameProps {
  onBack: () => void;
}

type GameItem = {
  id: string; // unique item id
  wordId: number; // to check for matches
  text: string;
  type: 'en' | 'vi';
};

const MatchGame: React.FC<MatchGameProps> = ({ onBack }) => {
  const { data: wordsData, isLoading } = useGetWordsQuery({ limit: 'all' });
  const words = wordsData?.data || [];

  const [items, setItems] = useState<GameItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [errorIds, setErrorIds] = useState<[string, string] | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    initGame();
  }, [words]);

  const initGame = () => {
    if (words.length < 5) return;
    
    // Pick 6 random words
    const shuffledWords = [...words].sort(() => 0.5 - Math.random()).slice(0, Math.min(6, words.length));
    
    // Create 2 items per word (English and Vietnamese)
    let gameItems: GameItem[] = [];
    shuffledWords.forEach(w => {
      gameItems.push({ id: `en_${w.id}`, wordId: w.id, text: w.word, type: 'en' });
      gameItems.push({ id: `vi_${w.id}`, wordId: w.id, text: w.meaningVi, type: 'vi' });
    });
    
    // Shuffle all items
    gameItems = gameItems.sort(() => 0.5 - Math.random());
    
    setItems(gameItems);
    setMatchedIds(new Set());
    setSelectedId(null);
    setErrorIds(null);
    setGameCompleted(false);
  };

  const handleItemClick = (item: GameItem) => {
    if (matchedIds.has(item.wordId)) return; // Already matched
    if (errorIds) return; // Wait for error animation
    if (selectedId === item.id) {
      setSelectedId(null); // Deselect
      return;
    }

    if (!selectedId) {
      setSelectedId(item.id);
    } else {
      const selectedItem = items.find(i => i.id === selectedId)!;
      
      // If clicking same type (e.g. English -> English), just change selection
      if (selectedItem.type === item.type) {
        setSelectedId(item.id);
        return;
      }

      // Check match
      if (selectedItem.wordId === item.wordId) {
        setMatchedIds(prev => {
          const next = new Set(prev);
          next.add(item.wordId);
          if (next.size === items.length / 2) {
            setTimeout(() => setGameCompleted(true), 500);
          }
          return next;
        });
        setSelectedId(null);
      } else {
        // Mismatch
        setErrorIds([selectedId, item.id]);
        setTimeout(() => {
          setSelectedId(null);
          setErrorIds(null);
        }, 600);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="match-game empty">
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2>Loading words... 🐰✨</h2>
        </div>
      </div>
    );
  }

  if (words.length < 5) {
    return (
      <div className="match-game empty">
        <Button variant="outline" onClick={onBack} className="back-btn">
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="game-over-card">
          <h2>Not enough words 😿</h2>
          <p>Please add at least 5 words to your library to play the matching game.</p>
        </Card>
      </div>
    );
  }

  const renderItem = (item: GameItem) => {
    const isSelected = selectedId === item.id;
    const isMatched = matchedIds.has(item.wordId);
    const isError = errorIds?.includes(item.id);

    let className = `match-item clickable ${item.type}-card `;
    if (isMatched) className += 'matched ';
    if (isSelected) className += 'selected ';
    if (isError) className += 'error ';

    return (
      <Card 
        key={item.id} 
        className={className}
        onClick={() => handleItemClick(item)}
      >
        {item.text}
      </Card>
    );
  };

  return (
    <div className="match-game">
      <div className="match-header">
        <Button variant="outline" onClick={onBack} className="back-btn">
          <ArrowLeft size={16} /> Back
        </Button>
        <div className="match-title">
          <Trophy size={20} className="trophy-icon" />
          <h2>Word Match</h2>
        </div>
        <div className="score">
          {matchedIds.size} / {items.length / 2}
        </div>
      </div>

      {gameCompleted ? (
        <Card className="game-over-card animate-pop">
          <h2>You did it! 🎉</h2>
          <p>All words matched perfectly.</p>
          <Button variant="primary" onClick={initGame} className="play-again-btn">
            <RefreshCw size={18} /> Play Again
          </Button>
        </Card>
      ) : (
        <div className="match-columns">
          <div className="match-column">
            <h3 className="column-title">English 🇺🇸</h3>
            <div className="match-list">
              {items.filter(i => i.type === 'en').map(renderItem)}
            </div>
          </div>

          <div className="match-column">
            <h3 className="column-title">Tiếng Việt 🇻🇳</h3>
            <div className="match-list">
              {items.filter(i => i.type === 'vi').map(renderItem)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchGame;
