import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  MessageSquare,
  Heart,
  Send,
  Trash2,
  Edit3,
  X,
  Save,
  MessageCircle,
  Filter,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import {
  db,
  handleFirestoreError,
  OperationType,
  isOfflineError,
} from '../config/firebase';
import { CommunityPost, CommunityPostReply } from '../types';
import { getRankFromXP } from '../config/constants';
import { VipSectionLockedView } from '../components/common/UiPrimitives';
import { useAppContext } from '../context/AppContext';

const FORUM_CATEGORIES = [
  { id: 'all', label: 'सभी चर्चाएं (All)', hindi: 'सभी' },
  {
    id: 'Daily Epiphany',
    label: 'दैनिक अनुभव (Daily Epiphany)',
    hindi: 'दैनिक अनुभव',
  },
  {
    id: 'Social Reality',
    label: 'सामाजिक सत्य (Social Reality)',
    hindi: 'सामाजिक सत्य',
  },
  {
    id: 'Mental Model',
    label: 'मानसिक मॉडल (Mental Models)',
    hindi: 'मानसिक मॉडल',
  },
  { id: 'Question', label: 'जटिल प्रश्न (Deep Question)', hindi: 'प्रश्न' },
  {
    id: 'Systemic Observations',
    label: 'व्यवस्था अवलोकन (Systemic)',
    hindi: 'व्यवस्था अवलोकन',
  },
  {
    id: '100-Day Protocol',
    label: '१००-दिवसीय प्रोटोकॉल (100-Day)',
    hindi: '१००-दिवसीय प्रोटोकॉल',
  },
  {
    id: 'Book Insights',
    label: 'ग्रंथ सूत्र (Book Insights)',
    hindi: 'ग्रंथ सूत्र',
  },
];

function getTimestampMillis(ts: any): number {
  if (!ts) return Date.now();
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  const parsed = new Date(ts).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

export const CommunityForumView: React.FC = () => {
  const {
    user,
    profile: currentUserProfile,
    isCurrentUserAdmin,
    isSectionVipGated,
    openAscensionModal,
    handleTabClick,
    handleLogin,
    showToast,
  } = useAppContext();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTopic, setNewPostTopic] = useState('Daily Epiphany');
  const [newPostDay, setNewPostDay] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(
    null
  );
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState('');
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(
      collection(db, 'posts'),
      (snap) => {
        const fetched = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as CommunityPost)
        );
        fetched.sort(
          (a, b) =>
            getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
        );
        setPosts(fetched);
        setLoading(false);
      },
      (error) => {
        if (!isOfflineError(error)) {
          handleFirestoreError(error, OperationType.LIST, 'posts');
        }
        setLoading(false);
      }
    );
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return posts;
    return posts.filter(
      (p) => (p.topic || 'Daily Epiphany') === selectedCategory
    );
  }, [posts, selectedCategory]);

  if (isSectionVipGated('forum')) {
    return (
      <VipSectionLockedView
        sectionTitle="Community Discussion Forum"
        hindiTitle="समुदाय चर्चा मंच"
        description="The practitioner community forum and discussion board are reserved for Sovereign VIP members. Upgrade to participate in discussions and reflections."
        onUnlock={openAscensionModal}
      />
    );
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);
    if (!currentUserProfile || !newPostContent.trim() || isSubmitting) return;

    if (!user) {
      showToast({
        title: 'साइन-इन आवश्यक (Sign-In Required)',
        message: 'मंच पर विचार प्रकाशित करने के लिए कृपया Google से साइन-इन करें।',
        type: 'warning',
      });
      await handleLogin();
      return;
    }

    const trimmed = newPostContent.trim();
    if (trimmed.length < 5) {
      setPostError(
        'कृपया कम से कम एक पूर्ण विचार लिखें (Minimum 5 characters).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const rank = getRankFromXP(currentUserProfile.xp || 0);
      const dayNum = parseInt(newPostDay, 10);

      const payload: Record<string, any> = {
        authorId: user.uid,
        authorName: currentUserProfile.displayName || 'Sovereign Practitioner',
        authorPhotoURL: currentUserProfile.photoURL || null,
        authorRank: `${rank.hindiName} (${rank.name})`,
        topic: newPostTopic,
        content: trimmed,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        replies: [],
      };

      if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 100) {
        payload.dayNumber = dayNum;
      }

      await addDoc(collection(db, 'posts'), payload);
      setNewPostContent('');
      setNewPostDay('');
      showToast({
        title: 'विचार प्रकाशित (Reflection Published)',
        message: 'आपका विचार साधक संवाद मंच पर लाइव हो गया है।',
        type: 'success',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
      setPostError('संदेश पोस्ट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEditPost = async (postId: string) => {
    if (!editingPostContent.trim()) return;
    try {
      await updateDoc(doc(db, 'posts', postId), {
        content: editingPostContent.trim(),
        updatedAt: serverTimestamp(),
      });
      setEditingPostId(null);
      setEditingPostContent('');
      showToast({
        title: 'विचार अपडेट किया गया (Post Updated)',
        message: 'आपका संदेश सफलतापूर्वक संपादित हो गया है।',
        type: 'success',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const handleToggleLike = async (post: CommunityPost) => {
    if (!user || !currentUserProfile) {
      showToast({
        title: 'साइन-इन आवश्यक (Sign-In Required)',
        message: 'समर्थन देने के लिए कृपया Google से साइन-इन करें।',
        type: 'info',
      });
      return;
    }
    const uid = user.uid;
    const alreadyLiked = (post.likedBy || []).includes(uid);
    const postRef = doc(db, 'posts', post.id);

    try {
      if (alreadyLiked) {
        await updateDoc(postRef, {
          likes: Math.max(0, (post.likes || 1) - 1),
          likedBy: arrayRemove(uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(uid),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}`);
    }
  };

  const handleAddReply = async (post: CommunityPost) => {
    if (!user || !currentUserProfile) {
      showToast({
        title: 'साइन-इन आवश्यक (Sign-In Required)',
        message: 'उत्तर देने के लिए कृपया Google से साइन-इन करें।',
        type: 'info',
      });
      return;
    }
    const replyContent = (replyTextMap[post.id] || '').trim();
    if (!replyContent) return;

    const newReply: CommunityPostReply = {
      id: `rep_${Date.now()}`,
      authorId: user.uid,
      authorName: currentUserProfile.displayName || 'Practitioner',
      authorPhotoURL: currentUserProfile.photoURL || undefined,
      content: replyContent,
      createdAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'posts', post.id), {
        replies: arrayUnion(newReply),
      });
      setReplyTextMap((prev) => ({ ...prev, [post.id]: '' }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setDeleteConfirmPostId(null);
      showToast({
        title: 'पोस्ट हटाई गई (Post Deleted)',
        message: 'संदेश मंच से हटा दिया गया है।',
        type: 'info',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'अभी (Just now)';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'हाल ही में';
    }
  };

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      <div className="bg-[#0c0e14] border border-[#1d222e] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SOVEREIGN THINKERS FORUM // विचार विमर्श मंच</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              साधक संवाद मंच{' '}
              <span className="text-amber-400">(Community Reflections)</span>
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              यहाँ सतही गपशप नहीं होती। अपने 100-Day Journey के ज़मीनी अनुभव, समाज की अदृश्य व्यवस्थाओं के अवलोकन और मानसिक स्पष्टता के सूत्र साझा करें।
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              {posts.length}
            </div>
            <div>
              <div className="text-xs font-bold text-white">सक्रिय विमर्श</div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Verified Reflections
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentUserProfile && (
        <form
          onSubmit={handleCreatePost}
          className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  currentUserProfile.photoURL ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile.uid}`
                }
                alt=""
                className="w-10 h-10 rounded-xl object-cover border border-amber-500/30"
              />
              <div>
                <div className="text-sm font-bold text-white">
                  {currentUserProfile.displayName}
                </div>
                <div className="text-[11px] text-amber-400 font-mono">
                  {getRankFromXP(currentUserProfile.xp || 0).hindiName} · Share
                  your observation
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={newPostTopic}
                onChange={(e) => setNewPostTopic(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50"
              >
                <option value="Daily Epiphany">
                  💡 दैनिक अनुभव (Daily Epiphany)
                </option>
                <option value="Social Reality">
                  🔍 सामाजिक सत्य (Social Reality)
                </option>
                <option value="Mental Model">
                  🧠 मानसिक मॉडल (Mental Model)
                </option>
                <option value="Question">❓ गहन प्रश्न (Deep Question)</option>
                <option value="Systemic Observations">
                  🏛️ व्यवस्था अवलोकन (Systemic)
                </option>
                <option value="100-Day Protocol">
                  🔥 १००-दिवसीय प्रोटोकॉल (100-Day)
                </option>
                <option value="Book Insights">
                  📖 ग्रंथ सूत्र (Book Insights)
                </option>
              </select>

              <input
                type="number"
                min={1}
                max={100}
                value={newPostDay}
                onChange={(e) => setNewPostDay(e.target.value)}
                placeholder="Day # (Optional)"
                className="w-32 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="आज आपने अपने व्यवहार या समाज की किस अदृश्य व्यवस्था को नोटिस किया? अपना अनुभव स्पष्ट शब्दों में लिखें..."
            rows={3}
            maxLength={2000}
            className="w-full bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 leading-relaxed resize-none"
          />

          {postError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{postError}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-[11px] font-mono text-zinc-500">
              {newPostContent.length}/2000 अक्षर · सम्मानजनक एवं तथ्यपूर्ण विचार लिखें
            </span>

            <button
              type="submit"
              disabled={!newPostContent.trim() || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-black font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'प्रकाशित हो रहा है...'
                  : 'विचार प्रकाशित करें (Post Reflection)'}
              </span>
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-zinc-500 shrink-0 mr-1" />
        {FORUM_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-zinc-900/70 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 bg-zinc-900/40 border border-zinc-800 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
          <MessageCircle className="w-10 h-10 text-zinc-600 mx-auto" />
          <div className="text-base font-bold text-white">
            इस श्रेणी में अभी कोई विचार नहीं है
          </div>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            सबसे पहले अपना दैनिक चिंतन या सामाजिक अवलोकन ऊपर साझा करें।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isLiked =
              user && (post.likedBy || []).includes(user.uid);
            const canModify = Boolean(
              user && (user.uid === post.authorId || isCurrentUserAdmin)
            );
            const replies = post.replies || [];
            const isExpanded = expandedPostId === post.id;
            const isEditingThis = editingPostId === post.id;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0e1017] border border-zinc-800/90 hover:border-zinc-700 rounded-3xl p-5 sm:p-6 space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        post.authorPhotoURL ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`
                      }
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {post.authorName}
                        </span>
                        {(post.authorRank || post.authorRole) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                            {post.authorRank || post.authorRole}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.dayNumber && (
                      <button
                        onClick={() => handleTabClick('journey')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold cursor-pointer hover:bg-emerald-500/20"
                      >
                        Day {post.dayNumber}
                      </button>
                    )}
                    {post.topic && (
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-mono">
                        {post.topic}
                      </span>
                    )}
                    {canModify && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPostId(post.id);
                            setEditingPostContent(post.content);
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {deleteConfirmPostId === post.id ? (
                          <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-500/40 rounded-lg px-2 py-1">
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-[10px] font-mono font-bold text-rose-300 hover:text-white px-1.5 cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmPostId(null)}
                              className="text-[10px] font-mono text-zinc-400 hover:text-white px-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmPostId(post.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isEditingThis ? (
                  <div className="space-y-2.5">
                    <textarea
                      value={editingPostContent}
                      onChange={(e) => setEditingPostContent(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950 border border-amber-500/40 rounded-2xl p-3.5 text-sm text-white focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPostId(null);
                          setEditingPostContent('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditPost(post.id)}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-zinc-200 leading-relaxed whitespace-pre-line font-normal">
                    {post.content}
                  </p>
                )}

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleLike(post)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isLiked
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isLiked ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                      <span>{post.likes || 0} समर्थन (Respect)</span>
                    </button>

                    <button
                      onClick={() =>
                        setExpandedPostId(isExpanded ? null : post.id)
                      }
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{replies.length} उत्तर (Replies)</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-3 space-y-3 overflow-hidden"
                    >
                      {replies.length > 0 && (
                        <div className="space-y-2.5 pl-3 sm:pl-4 border-l-2 border-zinc-800">
                          {replies.map((rep) => (
                            <div
                              key={rep.id}
                              className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-amber-400">
                                  {rep.authorName}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {formatTimestamp(rep.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                                {rep.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {currentUserProfile && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={replyTextMap[post.id] || ''}
                            onChange={(e) =>
                              setReplyTextMap((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddReply(post);
                              }
                            }}
                            placeholder="अपना संक्षिप्त उत्तर या दृष्टिकोण लिखें..."
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddReply(post)}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono cursor-pointer shrink-0"
                          >
                            उत्तर दें
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityForumView;
