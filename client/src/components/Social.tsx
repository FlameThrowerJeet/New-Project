import React, { useState, useEffect } from 'react';
import './Social.css';
import { users, posts as generatedPosts } from '../data/socialSeed';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  karma: number;
  reputation: number;
  followers: number;
  following: number;
  connections: number;
  isAnonymous: boolean;
  isVerified: boolean;
  bio: string;
  location: string;
  company: string;
  position: string;
  relationshipStatus: 'single' | 'in_relationship' | 'married' | 'complicated' | 'private';
}

interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
  shares: number;
  comments: number;
  karma: number;
  isAnonymous: boolean;
  board: string;
  tags: string[];
  quoteTweet?: Post;
  isQuoteTweet: boolean;
  originalPost?: Post;
  visibility: 'public' | 'friends' | 'connections' | 'private';
  type: 'text' | 'image' | 'link' | 'poll' | 'event';
}

interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  likes: number;
  karma: number;
  isAnonymous: boolean;
  replies: Comment[];
}

interface Board {
  id: string;
  name: string;
  description: string;
  isAnonymous: boolean;
  postCount: number;
  subscriberCount: number;
  rules: string[];
}

const Social: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: '1',
    username: 'user123',
    displayName: 'जॉन डो | John Doe',
    avatar: 'https://via.placeholder.com/50',
    karma: 1250,
    reputation: 850,
    followers: 342,
    following: 156,
    connections: 89,
    isAnonymous: false,
    isVerified: true,
    bio: 'सॉफ्टवेयर डेवलपर | टेक उत्साही | कॉफी प्रेमी | Software Developer | Tech Enthusiast | Coffee Lover',
    location: 'सैन फ्रांसिस्को, सीए | San Francisco, CA',
    company: 'टेक कॉर्प | Tech Corp',
    position: 'वरिष्ठ डेवलपर | Senior Developer',
    relationshipStatus: 'in_relationship'
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentView, setCurrentView] = useState<'feed' | 'boards' | 'profile' | 'network' | 'messages'>('feed');
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [newPost, setNewPost] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState<'public' | 'friends' | 'connections' | 'private'>('public');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);

  // Sample data
  useEffect(() => {
    // Replace sample data with generated data
    setPosts(generatedPosts);
  }, []);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: currentUser,
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      shares: 0,
      comments: 0,
      karma: 0,
      isAnonymous,
      board: selectedBoard,
      tags: [],
      isQuoteTweet: false,
      visibility: selectedVisibility,
      type: 'text'
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setShowCreatePost(false);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleShare = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, shares: post.shares + 1 } : post
    ));
  };

  const handleKarma = (postId: string, isUpvote: boolean) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, karma: post.karma + (isUpvote ? 1 : -1) } : post
    ));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'अभी | Just now';
    if (diffInHours < 24) return `${diffInHours} घंटे पहले | ${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} दिन पहले | ${diffInDays}d ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderFeed = () => (
    <div className="social-feed">
      <div className="create-post-section">
        <button 
          className="create-post-btn"
          onClick={() => setShowCreatePost(true)}
        >
          <span className="hindi-text">नई पोस्ट बनाएं</span>
          <span className="english-text">Create New Post</span>
        </button>
      </div>

      {showCreatePost && (
        <div className="create-post-modal">
          <div className="modal-content">
            <h3>
              <span className="hindi-text">नई पोस्ट</span>
              <span className="english-text">New Post</span>
            </h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="अपनी पोस्ट यहाँ लिखें... | Write your post here..."
              rows={4}
            />
            <div className="post-options">
              <label>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span className="hindi-text">गुमनाम पोस्ट</span>
                <span className="english-text">Anonymous Post</span>
              </label>
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value as any)}
              >
                <option value="public">
                  <span className="hindi-text">सार्वजनिक</span>
                  <span className="english-text">Public</span>
                </option>
                <option value="friends">
                  <span className="hindi-text">दोस्त</span>
                  <span className="english-text">Friends</span>
                </option>
                <option value="connections">
                  <span className="hindi-text">कनेक्शन</span>
                  <span className="english-text">Connections</span>
                </option>
                <option value="private">
                  <span className="hindi-text">निजी</span>
                  <span className="english-text">Private</span>
                </option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreatePost(false)}>
                <span className="hindi-text">रद्द करें</span>
                <span className="english-text">Cancel</span>
              </button>
              <button onClick={handleCreatePost}>
                <span className="hindi-text">पोस्ट करें</span>
                <span className="english-text">Post</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="posts-list" style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: 24 }}>
        {[...posts]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, visibleCount)
          .map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <img src={post.author.avatar} alt="avatar" />
                  <div className="author-info">
                    <div className="author-name">
                      {post.author.displayName}
                      {post.author.isVerified && <span className="verified-badge">✓</span>}
                    </div>
                    <div className="post-meta">
                      <span>{formatTimeAgo(post.timestamp)}</span>
                      <span>•</span>
                      <span>{post.board}</span>
                    </div>
                  </div>
                </div>
                <div className="post-karma">
                  <span className="karma-score">{post.karma}</span>
                  <span className="karma-label">
                    <span className="hindi-text">कर्म</span>
                    <span className="english-text">Karma</span>
                  </span>
                </div>
              </div>
              <div className="post-content">
                {post.content}
              </div>
              <div className="post-actions">
                <button onClick={() => handleLike(post.id)}>
                  <span>❤️</span>
                  <span>{formatNumber(post.likes)}</span>
                </button>
                <button onClick={() => handleShare(post.id)}>
                  <span>🔄</span>
                  <span>{formatNumber(post.shares)}</span>
                </button>
                <button>
                  <span>💬</span>
                  <span>{formatNumber(post.comments)}</span>
                </button>
                <button onClick={() => handleKarma(post.id, true)}>
                  <span>⬆️</span>
                </button>
                <button onClick={() => handleKarma(post.id, false)}>
                  <span>⬇️</span>
                </button>
              </div>
            </div>
          ))}
        {visibleCount < posts.length && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: 24 }}>
            <button className="load-more-btn" onClick={() => setVisibleCount(visibleCount + 30)}>
              <span className="hindi-text">और लोड करें</span>
              <span className="english-text">Load More</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderBoards = () => (
    <div className="boards-section">
      <h3>
        <span className="hindi-text">बोर्ड्स</span>
        <span className="english-text">Boards</span>
      </h3>
      <div className="boards-grid">
        {boards.map(board => (
          <div key={board.id} className="board-card">
            <div className="board-header">
              <h4>{board.name}</h4>
              {board.isAnonymous && (
                <span className="anonymous-badge">
                  <span className="hindi-text">गुमनाम</span>
                  <span className="english-text">Anonymous</span>
                </span>
              )}
            </div>
            <p className="board-description">{board.description}</p>
            <div className="board-stats">
              <span>
                <span className="hindi-text">{board.postCount} पोस्ट</span>
                <span className="english-text">{board.postCount} posts</span>
              </span>
              <span>
                <span className="hindi-text">{board.subscriberCount} सदस्य</span>
                <span className="english-text">{board.subscriberCount} members</span>
              </span>
            </div>
            <div className="board-rules">
              <h5>
                <span className="hindi-text">नियम</span>
                <span className="english-text">Rules</span>
              </h5>
              <ul>
                {board.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-section">
      <div className="profile-header">
        <img src={currentUser.avatar} alt="profile" className="profile-avatar" />
        <div className="profile-info">
          <h3>{currentUser.displayName}</h3>
          <p className="profile-bio">{currentUser.bio}</p>
          <div className="profile-details">
            <span>📍 {currentUser.location}</span>
            <span>🏢 {currentUser.company}</span>
            <span>💼 {currentUser.position}</span>
          </div>
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">{currentUser.followers}</span>
          <span className="stat-label">
            <span className="hindi-text">अनुयायी</span>
            <span className="english-text">Followers</span>
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{currentUser.following}</span>
          <span className="stat-label">
            <span className="hindi-text">अनुसरण</span>
            <span className="english-text">Following</span>
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{currentUser.connections}</span>
          <span className="stat-label">
            <span className="hindi-text">कनेक्शन</span>
            <span className="english-text">Connections</span>
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{currentUser.karma}</span>
          <span className="stat-label">
            <span className="hindi-text">कर्म</span>
            <span className="english-text">Karma</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="social-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Compact, fixed neon header */}
      <div className="social-header neon-header" style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%', background: 'rgba(10,20,30,0.95)', borderBottom: '2px solid #00d4aa', boxShadow: '0 2px 20px #00d4aa33' }}>
        <span className="neon-title" style={{ fontSize: 28, fontWeight: 900, color: '#00fff7', letterSpacing: 2, textShadow: '0 0 8px #00fff7, 0 0 16px #00d4aa' }}>
          सामाजिक नेटवर्क | Social Network
        </span>
        <span style={{ fontSize: 14, color: '#00d4aa', marginLeft: 24, fontWeight: 400, textShadow: '0 0 8px #00d4aa' }}>
          Community & Networking Platform
        </span>
      </div>
      {/* Neon horizontal nav bar */}
      <div className="social-nav neon-nav" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', background: 'rgba(10,20,30,0.85)', borderBottom: '2px solid #00d4aa', boxShadow: '0 2px 12px #00d4aa22', minHeight: 48 }}>
        <button className={`nav-button neon-btn${currentView === 'feed' ? ' active' : ''}`} onClick={() => setCurrentView('feed')}><span>📰</span> Feed</button>
        <button className={`nav-button neon-btn${currentView === 'boards' ? ' active' : ''}`} onClick={() => setCurrentView('boards')}><span>📋</span> Boards</button>
        <button className={`nav-button neon-btn${currentView === 'profile' ? ' active' : ''}`} onClick={() => setCurrentView('profile')}><span>👤</span> Profile</button>
        <button className={`nav-button neon-btn${currentView === 'network' ? ' active' : ''}`} onClick={() => setCurrentView('network')}><span>🌐</span> Network</button>
        <button className={`nav-button neon-btn${currentView === 'messages' ? ' active' : ''}`} onClick={() => setCurrentView('messages')}><span>💬</span> Messages</button>
      </div>
      {/* Main content area: fill and scroll */}
      <div className="social-content neon-content" style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'rgba(10,20,30,0.85)', padding: 0 }}>
        {currentView === 'feed' && renderFeed()}
        {currentView === 'boards' && renderBoards()}
        {currentView === 'profile' && renderProfile()}
        {currentView === 'network' && (
          <div className="network-section" style={{ color: '#00fff7', textAlign: 'center', marginTop: 48 }}>
            <h3>🌐 Network</h3>
            <p>Network feature coming soon...</p>
          </div>
        )}
        {currentView === 'messages' && (
          <div className="messages-section" style={{ color: '#00fff7', textAlign: 'center', marginTop: 48 }}>
            <h3>💬 Messages</h3>
            <p>Messages feature coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
export type { User, Post, Comment }; 