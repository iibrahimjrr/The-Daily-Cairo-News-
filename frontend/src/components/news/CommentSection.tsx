import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { commentService } from '../../services/api';
import { Comment } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, Reply, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  articleId: number;
  comments: Comment[];
}

export default function CommentSection({ articleId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentService.addComment(articleId, { content: newComment });
      setComments(prev => [res.data.data, ...prev]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch {
      toast.error('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await commentService.addComment(articleId, { content: replyContent, parent_id: parentId });
      setReplyTo(null);
      setReplyContent('');
      toast.success('Reply posted!');
    } catch {
      toast.error('Failed to post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted.');
    } catch {
      toast.error('Failed to delete comment.');
    }
  };

  return (
    <div className="mt-10 pt-8 border-t border-outline-variant/30">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={18} className="text-secondary" />
        <h3 className="font-serif text-headline-md">Comments ({comments.length})</h3>
      </div>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-full object-cover shrink-0 mt-1" />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full bg-surface-container-low dark:bg-[#1a1a2e] border border-outline-variant/40 rounded-lg px-4 py-3 font-sans text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-outline resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="btn-primary flex items-center gap-2 py-2 px-4 text-xs disabled:opacity-50"
                >
                  <Send size={13} />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-surface-container-low rounded-lg p-5 mb-8 text-center">
          <p className="font-sans text-sm text-on-surface-variant mb-3">Join the conversation</p>
          <Link to="/auth/login" className="btn-primary text-sm py-2 px-5 inline-block">
            Login to Comment
          </Link>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <img src={comment.user.avatar} alt={comment.user.name} className="w-9 h-9 rounded-full object-cover shrink-0 mt-1" />
            <div className="flex-1">
              <div className="bg-surface-container-low dark:bg-[#1a1a2e] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-sm font-semibold text-on-surface">{comment.user.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-xs text-on-surface-variant">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {(user?.id === comment.user.id || user?.is_admin) && (
                      <button onClick={() => handleDelete(comment.id)} className="text-on-surface-variant hover:text-secondary transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="font-sans text-sm text-on-surface">{comment.content}</p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 font-sans text-xs text-on-surface-variant hover:text-on-surface mt-1.5 ml-2 transition-colors"
                >
                  <Reply size={12} /> Reply
                </button>
              )}

              {/* Reply form */}
              {replyTo === comment.id && (
                <form onSubmit={e => handleReply(e, comment.id)} className="mt-3 ml-2">
                  <div className="flex gap-2">
                    <textarea
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="flex-1 bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2 font-sans text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-outline resize-none"
                    />
                    <button type="submit" disabled={submitting} className="btn-primary py-2 px-3 text-xs self-start">
                      <Send size={13} />
                    </button>
                  </div>
                </form>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-4 mt-3 space-y-3">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <img src={reply.user.avatar} alt={reply.user.name} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                      <div className="flex-1 bg-surface-container-low dark:bg-[#1a1a2e] rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-sans text-xs font-semibold">{reply.user.name}</span>
                          <span className="font-sans text-xs text-on-surface-variant">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-on-surface">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
