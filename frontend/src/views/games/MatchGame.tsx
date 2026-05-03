import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Trophy, RefreshCw } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { useGetWordsQuery } from '../../store/apiSlice';
import { useTranslation } from 'react-i18next';
import { useSound } from '../../hooks/useSound';
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
  const { t } = useTranslation();
  const { playSound } = useSound();

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
    
    playSound('click');

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
        playSound('success');
        setMatchedIds(prev => {
          const next = new Set(prev);
          next.add(item.wordId);
          if (next.size === items.length / 2) {
            playSound('win');
            setTimeout(() => setGameCompleted(true), 500);
          }
          return next;
        });
        setSelectedId(null);
      } else {
        // Mismatch
        playSound('error');
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
          <h2>{t('games.loading_game')}</h2>
        </div>
      </div>
    );
  }

  if (words.length < 5) {
    return (
      <div className="match-game empty">
        <div className="page-back-wrapper" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', width: '100%' }}>
          <BackButton onClick={onBack} />
        </div>
        <Card className="game-over-card">
          <h2>{t('games.not_enough_words')}</h2>
          <p>{t('games.not_enough_words_desc')}</p>
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
      <div className="page-back-wrapper" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <BackButton onClick={onBack} />
      </div>
      <div className="match-header">
        <div className="match-title">
          <Trophy size={20} className="trophy-icon" />
          <h2>{t('games.match_game_title')}</h2>
        </div>
        <div className="score">
          {matchedIds.size} / {items.length / 2}
        </div>
      </div>

      {gameCompleted ? (
        <Card className="game-over-card animate-pop">
          <h2>{t('games.game_win_title')}</h2>
          <p>{t('games.game_win_desc')}</p>
          <Button variant="primary" onClick={initGame} className="play-again-btn">
            <RefreshCw size={18} /> {t('games.play_again')}
          </Button>
        </Card>
      ) : (
        <div className="match-columns">
          <div className="match-column">
            <h3 className="column-title">{t('games.column_en')}</h3>
            <div className="match-list">
              {items.filter(i => i.type === 'en').map(renderItem)}
            </div>
          </div>

          <div className="match-column">
            <h3 className="column-title">{t('games.column_vi')}</h3>
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
