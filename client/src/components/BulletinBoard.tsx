import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  image: string;
  source: string;
  url: string;
  timestamp: string;
}

// Mock data for now
const mockNews: NewsItem[] = [
  {
    id: '1',
    headline: 'US and China Hold High-Level Talks Amid Indo-Pacific Tensions',
    summary: 'Diplomats from the US and China met in Singapore to discuss rising tensions in the South China Sea and Taiwan Strait.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    source: 'Reuters',
    url: 'https://www.reuters.com/',
    timestamp: '2024-06-10T08:00:00Z',
  },
  {
    id: '2',
    headline: 'Pakistan and Russia Sign New Defense Cooperation Agreement',
    summary: 'Pakistan and Russia have signed a new agreement to enhance military and intelligence cooperation, raising concerns in Washington and New Delhi.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    source: 'Al Jazeera',
    url: 'https://www.aljazeera.com/',
    timestamp: '2024-06-10T07:00:00Z',
  },
  {
    id: '3',
    headline: 'Turkey Expands Naval Presence in the Eastern Mediterranean',
    summary: 'Turkey has deployed additional naval assets to the Eastern Mediterranean, citing security and energy interests.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
    source: 'BBC',
    url: 'https://www.bbc.com/',
    timestamp: '2024-06-10T06:00:00Z',
  },
  {
    id: '4',
    headline: 'African Union Calls for De-Escalation in Red Sea Dispute',
    summary: 'The African Union has urged all parties to de-escalate tensions in the Red Sea following recent naval incidents.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    source: 'DW',
    url: 'https://www.dw.com/',
    timestamp: '2024-06-10T05:00:00Z',
  },
];

const getTrendSummary = (news: NewsItem[]) => {
  const keywords = ['tension', 'cooperation', 'military', 'talks', 'dispute', 'expands', 'de-escalation'];
  const icons = ['⚡', '🤝', '🪖', '💬', '🚩', '⛴️', '🕊️'];
  const counts = keywords.map(k => news.filter(n => n.headline.toLowerCase().includes(k)).length);
  const maxIdx = counts.indexOf(Math.max(...counts));
  return keywords[maxIdx] ? `${icons[maxIdx]} ${keywords[maxIdx].replace(/\b./g, c => c.toUpperCase())}` : '🌏 Stable';
};

const BulletinBoard: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/bulletin-news');
      setNews(res.data);
      setLastUpdated(new Date());
    } catch (e) {
      setNews(mockNews);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60 * 60 * 1000); // every hour
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #001a33 0%, #00334d 100%)', padding: 32, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      {/* Trend summary and refresh */}
      <div style={{ width: '100%', maxWidth: 1000, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ color: '#00fff7', fontSize: 28, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>{getTrendSummary(news)}</span>
          <span style={{ fontSize: 18, color: '#00d4aa', marginLeft: 18, fontWeight: 400 }}>
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </span>
        </div>
        <button onClick={fetchNews} disabled={loading} style={{ background: 'linear-gradient(90deg, #00fff7 0%, #00d4aa 100%)', color: '#001a33', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 900, fontSize: 18, cursor: 'pointer', boxShadow: '0 0 18px #00fff799', opacity: loading ? 0.5 : 1, transition: 'all 0.2s' }}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {/* News cards */}
      <div style={{ width: '100%', maxWidth: 1000, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 36, marginBottom: 32 }}>
        {news.map((item, idx) => (
          <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', animation: `fadeInUp 0.7s ${0.1 * idx}s both` }}>
            <div style={{ background: 'linear-gradient(120deg, #002a44 0%, #00334d 100%)', borderRadius: 18, boxShadow: '0 0 32px #00d4aa33, 0 2px 8px #001a33', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 410, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', border: '2px solid #00d4aa', position: 'relative', zIndex: 1 }}>
              <img src={item.image} alt={item.headline} style={{ width: '100%', height: 180, objectFit: 'cover', borderBottom: '2px solid #00d4aa', filter: 'brightness(0.92) contrast(1.1) saturate(1.2)', transition: 'filter 0.3s', boxShadow: '0 4px 16px #00d4aa22' }} />
              <div style={{ flex: 1, padding: '20px 18px 12px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#00fff7', marginBottom: 10, textShadow: '0 2px 8px #001a33' }}>{item.headline}</div>
                <div style={{ fontSize: 16, color: '#b2f7ef', marginBottom: 16, fontWeight: 500, textShadow: '0 1px 4px #001a33' }}>{item.summary}</div>
                <div style={{ fontSize: 14, color: '#00d4aa', opacity: 0.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                  <span>{item.source}</span>
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 0, right: 0, background: 'linear-gradient(90deg, #00fff7 0%, #00d4aa 100%)', color: '#001a33', fontWeight: 900, fontSize: 13, padding: '4px 14px', borderBottomLeftRadius: 12, boxShadow: '0 2px 8px #00d4aa44', letterSpacing: 1 }}>LIVE</div>
            </div>
          </a>
        ))}
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BulletinBoard; 