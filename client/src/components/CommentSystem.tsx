import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';
import './CommentSystem.css';

interface CommentType {
  id: string;
  imageId: string;
  text: string;
  timestamp: number;
  author: string;
}

interface CommentSystemProps {
  imageId: number;
}

const CommentSystem: React.FC<CommentSystemProps> = ({ imageId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('Pilot');

  // Load comments when imageId changes
  useEffect(() => {
    if (imageId <= 0) {
      setComments([]);
      return;
    }
    
    const loadComments = async () => {
      try {
        const db = await openDB('fogghyaDB', 1);
        const commentsByImage = await db.getAllFromIndex('comments', 'by-image', imageId);
        setComments(commentsByImage.sort((a: CommentType, b: CommentType) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };
    
    loadComments();
  }, [imageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || imageId <= 0) return;
    
    try {
      const db = await openDB('fogghyaDB', 1);
      
      const newCommentObj = {
        imageId: String(imageId),
        author,
        text: newComment,
        timestamp: Date.now()
      };
      
      // Add to database
      const id = await db.add('comments', newCommentObj);
      
      // Update state with new comment
      setComments(prev => [{...newCommentObj, id: String(id)}, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="comment-system">
      <div className="comment-header">
        <div className="comment-title">COMMS CHANNEL</div>
        <div className="comment-count">{comments.length}</div>
      </div>
      
      <div className="comments-container">
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-meta">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-time">
                  {new Date(comment.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))
        ) : (
          <div className="no-comments">No communications available</div>
        )}
      </div>
      
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="author-field">
          <label htmlFor="author">CALLSIGN:</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="author-input"
          />
        </div>
        <div className="message-field">
          <input
            type="text"
            placeholder="Enter message..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="message-input"
          />
          <button type="submit" className="send-button">SEND</button>
        </div>
      </form>
    </div>
  );
};

export default CommentSystem;