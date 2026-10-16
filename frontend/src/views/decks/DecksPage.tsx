import React, { useState } from 'react';
import { Layers, Search, BookOpen, ArrowRight } from 'lucide-react';
import Card from '../../components/Card';
import CuteSelect from '../../components/CuteSelect';
import { useGetCuratedDecksQuery } from '../../store/apiSlice';
import DeckDetailModal from './DeckDetailModal';
import './DecksPage.css';

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Tất cả chủ đề' },
  { value: 'IELTS', label: 'IELTS Academic' },
  { value: 'TOEIC', label: 'TOEIC 800+' },
  { value: 'IT_TECH', label: 'IT Tech & Software' },
  { value: 'TRAVEL', label: 'Giao tiếp & Travel' },
  { value: 'GENERAL', label: 'Cơ bản & Hàng ngày' },
];

const DecksPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeDeckId, setActiveDeckId] = useState<number | null>(null);

  const { data: decksRes, isLoading } = useGetCuratedDecksQuery(
    selectedCategory !== 'ALL' ? { category: selectedCategory, search } : { search }
  );

  const decks = decksRes?.data || [];

  return (
    <div className="decks-page-container">
      <div className="decks-header">
        <div className="decks-header-title">
          <Layers size={28} style={{ color: 'var(--primary)' }} />
          Bộ Từ Vựng Chủ Đề (Curated Decks)
        </div>
        <p className="decks-header-subtitle">
          Tuyển tập bộ từ vựng luyện thi IELTS, TOEIC, IT Chuyên ngành & Giao tiếp được biên soạn sẵn. 1-click import vào thư viện cá nhân!
        </p>
      </div>

      <div className="decks-filter-bar">
        <div className="decks-search-bar">
          <Search size={20} className="decks-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ từ vựng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <CuteSelect
          options={CATEGORY_OPTIONS}
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val)}
          className="decks-category-select"
          align="right"
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Đang tải danh sách bộ từ vựng...
        </div>
      ) : decks.length === 0 ? (
        <Card className="empty-state-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <Layers size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>Chưa có bộ từ vựng nào</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Không tìm thấy bộ từ vựng phù hợp với bộ lọc hiện tại.
          </p>
        </Card>
      ) : (
        <div className="decks-grid">
          {decks.map(deck => (
            <div key={deck.id} className="deck-card" onClick={() => setActiveDeckId(deck.id)}>
              <div className="deck-cover-wrapper">
                {deck.coverImage ? (
                  <img src={deck.coverImage} alt={deck.title} className="deck-cover-img" />
                ) : (
                  <Layers size={48} style={{ opacity: 0.8 }} />
                )}
                <span className="deck-badge-category">{deck.category}</span>
                {deck.level && <span className="deck-badge-level">{deck.level}</span>}
              </div>

              <div className="deck-card-body">
                <h4 className="deck-card-title">{deck.title}</h4>
                <p className="deck-card-description">{deck.description || 'Bộ từ vựng chất lượng cao được tuyển chọn.'}</p>
                <div className="deck-card-footer">
                  <span className="deck-word-count">
                    <BookOpen size={14} />
                    {deck.wordCount} Từ Vựng
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Xem & Import <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeckDetailModal
        deckId={activeDeckId}
        isOpen={Boolean(activeDeckId)}
        onClose={() => setActiveDeckId(null)}
      />
    </div>
  );
};

export default DecksPage;
