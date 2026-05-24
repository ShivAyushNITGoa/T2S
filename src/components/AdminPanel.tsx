import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { JourneyModule, VideoArchive, LibraryBook, CommunityPost, UserProfile, ShopProduct } from '../types';
import { RAW_JOURNEY_MODULES } from '../journeyData';
import { Plus, Edit2, Trash2, X, Save, Film, Book, Map, Zap, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'journey' | 'archives' | 'library' | 'posts' | 'users' | 'shop'>('journey');
  
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 border-b border-white/5 pb-4">
        <SubTabBtn active={activeSubTab === 'journey'} onClick={() => setActiveSubTab('journey')} icon={<Map className="w-4 h-4" />} label="Journey" />
        <SubTabBtn active={activeSubTab === 'archives'} onClick={() => setActiveSubTab('archives')} icon={<Film className="w-4 h-4" />} label="Archives" />
        <SubTabBtn active={activeSubTab === 'library'} onClick={() => setActiveSubTab('library')} icon={<Book className="w-4 h-4" />} label="Library" />
        <SubTabBtn active={activeSubTab === 'shop'} onClick={() => setActiveSubTab('shop')} icon={<ShoppingCart className="w-4 h-4" />} label="Shop" />
        <SubTabBtn active={activeSubTab === 'posts'} onClick={() => setActiveSubTab('posts')} icon={<Plus className="w-4 h-4" />} label="Moderate Posts" />
        <SubTabBtn active={activeSubTab === 'users'} onClick={() => setActiveSubTab('users')} icon={<Plus className="w-4 h-4" />} label="Users" />
      </div>

      <div className="bg-neutral-900/20 rounded-3xl p-6 border border-white/5">
        {activeSubTab === 'journey' && <JourneyManager />}
        {activeSubTab === 'archives' && <ArchiveManager />}
        {activeSubTab === 'library' && <LibraryManager />}
        {activeSubTab === 'shop' && <ShopManager />}
        {activeSubTab === 'posts' && <PostModerator />}
        {activeSubTab === 'users' && <UserManager />}
      </div>
    </div>
  );
}

function SubTabBtn({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
    >
      {icon} {label}
    </button>
  );
}

// --- Managers ---

function JourneyManager() {
  const [modules, setModules] = useState<JourneyModule[]>([]);
  const [editing, setEditing] = useState<Partial<JourneyModule> | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'journey'), orderBy('day', 'asc')), (snap) => {
      setModules(snap.docs.map(d => ({ id: d.id, ...d.data() } as JourneyModule)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'journey'));
  }, []);

  const save = async (e: any) => {
    e.preventDefault();
    const data = {
      day: parseInt(e.target.day.value),
      title: e.target.title.value,
      description: e.target.description.value,
      isPremium: e.target.isPremium.checked
    };
    try {
      if (editing?.id) {
        await updateDoc(doc(db, 'journey', editing.id), data);
      } else {
        await addDoc(collection(db, 'journey'), data);
      }
      setEditing(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'journey');
    }
  };

  const seedJourney = async () => {
    try {
      setStatus("Seeding all 100 days...");
      for (const m of RAW_JOURNEY_MODULES) {
        const q = query(collection(db, 'journey'), where('day', '==', m.day));
        const snap = await getDocs(q);
        if (snap.empty) {
          await addDoc(collection(db, 'journey'), m);
        } else {
          // Keep it up to date
          const docId = snap.docs[0].id;
          await updateDoc(doc(db, 'journey', docId), m);
        }
      }
      setStatus("100-Day Journey Seeded/Updated successfully!");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'journey');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-black italic">Journey Modules</h3>
          {status && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="px-3 py-1 bg-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
              {status}
            </motion.span>
          )}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={seedJourney} 
            className="px-4 py-2 bg-white/5 text-white/60 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all font-mono"
          >
            Seed Core Journey
          </button>
          <button onClick={() => setEditing({})} className="p-2 bg-white text-black rounded-lg"><Plus /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {modules.map(m => (
          <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <span className="text-white/40 font-mono mr-4 italic">DAY {m.day}</span>
              <span className="font-bold uppercase tracking-tight text-white/80">{m.title}</span>
              {m.isPremium && <Zap className="w-3 h-3 text-white fill-white" />}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'journey', m.id), { isPremium: !m.isPremium });
                  } catch (e) {
                    handleFirestoreError(e, OperationType.UPDATE, `journey/${m.id}`);
                  }
                }}
                className={`p-2 rounded-lg border transition-all ${m.isPremium ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                title={m.isPremium ? "Strategist Policy Active" : "Set as Strategist Tier"}
              >
                <Zap size={16} fill={m.isPremium ? "currentColor" : "none"} />
              </button>
              <button onClick={() => setEditing(m)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit2 size={16}/></button>
              <button 
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'journey', m.id));
                  } catch (error) {
                    handleFirestoreError(error, OperationType.DELETE, `journey/${m.id}`);
                  }
                }} 
                className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onSubmit={save} className="bg-neutral-900 p-8 rounded-3xl border border-white/10 w-full max-w-lg space-y-4"
            >
              <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                </button>
                <h4 className="text-lg font-black uppercase tracking-widest italic">Edit Module</h4>
              </div>
              <input name="day" defaultValue={editing.day} placeholder="Day Number" className="w-full bg-white/5 p-3 rounded-xl" type="number" required />
              <input name="title" defaultValue={editing.title} placeholder="Title" className="w-full bg-white/5 p-3 rounded-xl" required />
              <textarea name="description" defaultValue={editing.description} placeholder="Description" className="w-full bg-white/5 p-3 rounded-xl h-32" required />
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                <input type="checkbox" name="isPremium" defaultChecked={editing.isPremium} className="w-4 h-4 accent-white" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                   Strategist Tier Only <Zap className="w-3 h-3 fill-white/60" />
                </span>
              </label>
              <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200">Save Content</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArchiveManager() {
  const [items, setItems] = useState<VideoArchive[]>([]);
  const [editing, setEditing] = useState<Partial<VideoArchive> | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'archives'), orderBy('title', 'asc')), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoArchive)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'archives'));
  }, []);

  const save = async (e: any) => {
    e.preventDefault();
    const data = {
      title: e.target.title.value,
      duration: e.target.duration.value,
      views: e.target.views.value,
      thumbnail: e.target.thumbnail.value,
      videoUrl: e.target.videoUrl.value,
      isPremium: e.target.isPremium.checked,
      createdAt: serverTimestamp()
    };
    try {
      if (editing?.id) {
        await updateDoc(doc(db, 'archives', editing.id), data);
      } else {
        await addDoc(collection(db, 'archives'), data);
      }
      setEditing(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'archives');
    }
  };

  const seedArchives = async () => {
    const archives = [
      {
        title: "The Core Philosophy",
        duration: "12:45",
        views: "1.2k",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder but real URL structure
        isPremium: false,
        createdAt: serverTimestamp()
      },
      {
        title: "Advanced Cognitive Mapping",
        duration: "24:00",
        views: "850",
        thumbnail: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        isPremium: true,
        createdAt: serverTimestamp()
      }
    ];

    try {
      for (const item of archives) {
        const q = query(collection(db, 'archives'), where('title', '==', item.title));
        const snap = await getDocs(q);
        if (snap.empty) await addDoc(collection(db, 'archives'), item);
      }
      setStatus("Archives Seeded Successfully");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'archives');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-black italic">Video Archives</h3>
          {status && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="px-3 py-1 bg-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
              {status}
            </motion.span>
          )}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={seedArchives} 
            className="px-4 py-2 bg-white/5 text-white/60 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all font-mono"
          >
            Seed Initial Archives
          </button>
          <button onClick={() => setEditing({})} className="p-2 bg-white text-black rounded-lg"><Plus /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map(m => (
          <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <img src={m.thumbnail} className="w-12 h-12 object-cover rounded-lg grayscale" />
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-tight text-white/80">{m.title}</span>
                {m.isPremium && <Zap className="w-3 h-3 text-white fill-white" />}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'archives', m.id), { isPremium: !m.isPremium });
                  } catch (e) {
                    handleFirestoreError(e, OperationType.UPDATE, `archives/${m.id}`);
                  }
                }}
                className={`p-2 rounded-lg border transition-all ${m.isPremium ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                title={m.isPremium ? "Strategist Policy Active" : "Set as Strategist Tier"}
              >
                <Zap size={16} fill={m.isPremium ? "currentColor" : "none"} />
              </button>
              <button onClick={() => setEditing(m)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit2 size={16}/></button>
              <button 
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'archives', m.id));
                  } catch (error) {
                    handleFirestoreError(error, OperationType.DELETE, `archives/${m.id}`);
                  }
                }} 
                className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onSubmit={save} className="bg-neutral-900 p-8 rounded-3xl border border-white/10 w-full max-w-lg space-y-4"
            >
              <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                </button>
                <h4 className="text-lg font-black uppercase tracking-widest italic">Edit Archive</h4>
              </div>
              <input name="title" defaultValue={editing.title} placeholder="Title" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="duration" defaultValue={editing.duration} placeholder="Duration (e.g. 15:00)" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="views" defaultValue={editing.views} placeholder="Views" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="thumbnail" defaultValue={editing.thumbnail} placeholder="Thumbnail URL" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="videoUrl" defaultValue={editing.videoUrl} placeholder="YouTube URL or Embed ID" className="w-full bg-white/5 p-3 rounded-xl" required />
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                <input type="checkbox" name="isPremium" defaultChecked={editing.isPremium} className="w-4 h-4 accent-white" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                   Strategist Tier Only <Zap className="w-3 h-3 fill-white/60" />
                </span>
              </label>
              <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200">Save Video</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LibraryManager() {
  const [items, setItems] = useState<LibraryBook[]>([]);
  const [editing, setEditing] = useState<Partial<LibraryBook> | null>(null);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'library'), orderBy('title', 'asc')), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryBook)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'library'));
  }, []);

  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const save = async (e: any) => {
    e.preventDefault();
    const data = {
      title: e.target.title.value,
      author: e.target.author.value,
      category: e.target.category.value,
      excerpt: e.target.excerpt.value,
      fileUrl: e.target.fileUrl.value,
      coverUrl: e.target.coverUrl.value,
      isPremium: e.target.isPremium.checked
    };
    try {
      if (editing?.id) {
        await updateDoc(doc(db, 'library', editing.id), data);
      } else {
        await addDoc(collection(db, 'library'), data);
      }
      setEditing(null);
      setStatus("Records Updated Successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'library');
    }
  };

  const seedLibrary = async () => {
    const books = [
      {
        title: "Untouchable",
        author: "A. K. Chandradipti",
        category: "Strategy & Power",
        excerpt: "The secret manual of power, conspiracy, and supremacy. Learn to break the mental chains of social conditioning.",
        fileUrl: "",
        coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400"
      },
      {
        title: "Command",
        author: "A. K. Chandradipti",
        category: "Grand Strategy",
        excerpt: "The Architect's manual for mass manipulation and eternal dominance. Move from being a pawn to the operator.",
        fileUrl: "",
        coverUrl: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=400"
      },
      {
        title: "Maya",
        author: "A. K. Chandradipti",
        category: "Dark Psychology",
        excerpt: "Perception is the only reality. Master the art of obsession and rule over the souls of the collective.",
        fileUrl: "",
        coverUrl: "https://images.unsplash.com/photo-1511108690759-009324a903df?auto=format&fit=crop&q=80&w=400",
        isPremium: true
      },
      {
        title: "Chakravyuh",
        author: "A. K. Chandradipti",
        category: "System Hacking",
        excerpt: "Understand the system. Hack the crowd. Master the algorithm that controls 140 crore data points.",
        fileUrl: "",
        coverUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
        isPremium: true
      }
    ];

    try {
      for (const book of books) {
        const q = query(collection(db, 'library'), where('title', '==', book.title));
        const snap = await getDocs(q);
        if (snap.empty) {
          await addDoc(collection(db, 'library'), book);
        }
      }
      setStatus("Library Seeded Successfully");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'library');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-black italic">Library Books</h3>
          {status && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="px-3 py-1 bg-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
              {status}
            </motion.span>
          )}
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <button 
              onClick={seedLibrary} 
              className="px-4 py-2 bg-white/5 text-white/60 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all font-mono"
            >
              Seed Core Library
            </button>
            <span className="text-[8px] text-gray-700 mt-1 uppercase font-bold tracking-widest leading-none">Standard Registry Protocol</span>
          </div>
          <button onClick={() => setEditing({})} className="p-2 bg-white text-black rounded-lg"><Plus /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map(m => (
          <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 font-mono">
            <div className="flex items-center gap-3">
              {m.coverUrl ? (
                <img src={m.coverUrl} className="w-8 h-10 object-cover rounded border border-white/10 grayscale" />
              ) : (
                <div className="w-8 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center">
                  <Book size={12} className="text-white/20" />
                </div>
              )}
              {!m.fileUrl && <div className="w-2 h-2 bg-white rounded-full animate-pulse" title="Missing URL" />}
              <span className="text-white/40 text-[10px] uppercase tracking-widest mr-4">{m.category}</span>
              <span className="font-bold text-white/80">{m.title}</span>
              {m.isPremium && <Zap className="w-3 h-3 text-white fill-white" />}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'library', m.id), { isPremium: !m.isPremium });
                  } catch (e) {
                    handleFirestoreError(e, OperationType.UPDATE, `library/${m.id}`);
                  }
                }}
                className={`p-2 rounded-lg border transition-all ${m.isPremium ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-gray-700 hover:text-white'}`}
                title={m.isPremium ? "Strategist Policy Active" : "Set as Strategist Tier"}
              >
                <Zap size={16} fill={m.isPremium ? "currentColor" : "none"} />
              </button>
              <button onClick={() => setEditing(m)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit2 size={16}/></button>
              <button 
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'library', m.id));
                  } catch (error) {
                    handleFirestoreError(error, OperationType.DELETE, `library/${m.id}`);
                  }
                }} 
                className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onSubmit={save} className="bg-neutral-900 p-8 rounded-3xl border border-white/10 w-full max-w-lg space-y-4"
            >
              <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                </button>
                <h4 className="text-lg font-black uppercase tracking-widest italic">Edit Library</h4>
              </div>
              <input name="title" defaultValue={editing.title} placeholder="Title" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="author" defaultValue={editing.author} placeholder="Author" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="category" defaultValue={editing.category} placeholder="Category" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="coverUrl" defaultValue={editing.coverUrl} placeholder="Cover Image URL" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="fileUrl" defaultValue={editing.fileUrl} placeholder="Google Drive Sharing URL" className="w-full bg-white/5 p-3 rounded-xl" required />
              <div className="text-[10px] text-white/40 bg-white/5 p-4 rounded-xl border border-white/10 mb-4 space-y-2 font-mono">
                <p className="font-bold text-white/60">REQUIRED SETUP FOR GOOGLE DRIVE:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Right click PDF in Drive → <strong>Share</strong></li>
                  <li>General Access: Change to <strong>"Anyone with the link"</strong></li>
                  <li>Click "Copy link" and paste it in the field above.</li>
                </ol>
              </div>
              <textarea name="excerpt" defaultValue={editing.excerpt} placeholder="Excerpt" className="w-full bg-white/5 p-3 rounded-xl h-32" required />
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                <input type="checkbox" name="isPremium" defaultChecked={editing.isPremium} className="w-4 h-4 accent-white" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                   Strategist Tier Only <Zap className="w-3 h-3 fill-white/60" />
                </span>
              </label>
              <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200">Save Book</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostModerator() {
  const [items, setItems] = useState<CommunityPost[]>([]);
  useEffect(() => {
    return onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black italic">Moderate Community Posts</h3>
      <div className="space-y-4">
        {items.map(post => (
          <div key={post.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-white/60 mb-1 font-mono uppercase italic">{post.authorName}</div>
              <p className="text-sm text-gray-500">{post.content}</p>
            </div>
            <button 
              onClick={async () => {
                try {
                  await deleteDoc(doc(db, 'posts', post.id));
                } catch (error) {
                  handleFirestoreError(error, OperationType.DELETE, `posts/${post.id}`);
                }
              }} 
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"
            >
              <Trash2 size={16}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserManager() {
  const [items, setItems] = useState<UserProfile[]>([]);
  useEffect(() => {
    return onSnapshot(collection(db, 'users'), (snap) => {
      setItems(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
  }, []);

  const handleApprove = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        isStrategist: true,
        premiumRequestStatus: 'approved'
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleDecline = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        isStrategist: false,
        premiumRequestStatus: 'denied'
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const toggleStrategist = async (user: UserProfile) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isStrategist: !user.isStrategist
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const pendingUsers = items.filter(u => u.premiumRequestStatus === 'pending');

  return (
    <div className="space-y-8 font-sans">
      {/* Pending Approvals Queue */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
          <span>👑 PENDING PREMIUM CONFIRMATIONS / भुगतान सत्यापन सूची</span>
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 font-sans font-bold text-xs rounded-full">
            {pendingUsers.length} pending
          </span>
        </h3>
        
        {pendingUsers.length === 0 ? (
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center text-xs text-zinc-500 font-mono italic">
            There are no pending premium upgrade requests currently in the manual ledger queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingUsers.map(u => (
              <div key={u.uid} className="p-5 bg-gradient-to-r from-amber-500/[0.02] via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
                <div className="flex items-center gap-4">
                  <img src={u.photoURL} className="w-12 h-12 rounded-full border border-amber-500/20" alt="" />
                  <div className="space-y-1 text-left">
                    <div className="font-bold text-white text-sm">{u.displayName}</div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-wide">{u.email}</div>
                    <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] font-black uppercase tracking-wider">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
                        Plan: {u.premiumRequestPlan === 'elite' ? 'Elite Consult 1-on-1' : 'Sovereign Pass'}
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md border border-white/5">
                        Details: {u.premiumRequestDetails || 'Standard payment details'}
                      </span>
                      {u.premiumRequestTransactionId && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-yellow-400 rounded-md border border-amber-500/30">
                          TXN ID / UTR: <strong className="select-all font-bold text-white tracking-widest block sm:inline-block">{u.premiumRequestTransactionId}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2.5 w-full md:w-auto pt-2 md:pt-0 self-end md:self-center">
                  <button 
                    onClick={() => handleApprove(u.uid)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-green-500 hover:bg-green-600 text-black text-[10px] font-mono font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold shadow-lg"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Payment / स्वीकृत करें
                  </button>
                  <button 
                    onClick={() => handleDecline(u.uid)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-xl border border-red-500/25 hover:border-red-500/40 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                  >
                    <X className="w-3.5 h-3.5" /> Decline / खारिज करें
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General User Registry list */}
      <div className="space-y-4 pt-6 border-t border-white/5">
        <h3 className="text-sm font-mono font-black text-white/50 uppercase tracking-widest text-left">
          ALL REGISTERED HUNTERS / सर्व उपयोगकर्ता सूची
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {items.map(u => (
            <div key={u.uid} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-4">
                  <img src={u.photoURL} className="w-10 h-10 rounded-full border border-white/10 grayscale" alt="" />
                  <div>
                    <div className="font-bold text-white/80 leading-tight text-sm flex items-center gap-2">
                      {u.displayName}
                      {u.isAdmin && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Admin</span>}
                      {u.isStrategist && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Premium</span>}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest font-mono pt-0.5">{u.email}</div>
                    {u.premiumRequestStatus && (
                      <div className="text-[9px] font-mono font-semibold text-zinc-400 pt-1">
                        Request status: <span className={u.premiumRequestStatus === 'approved' ? 'text-green-400' : u.premiumRequestStatus === 'pending' ? 'text-amber-400 font-bold animate-pulse' : 'text-red-400'}>{u.premiumRequestStatus.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {u.premiumRequestPlan && (
                  <div className="mt-3 p-3 bg-zinc-950/60 rounded-xl border border-white/5 space-y-1.5 max-w-xl">
                    <div className="text-[9px] font-mono font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      Submitted Payment Form / प्रेषित भुगतान विवरण
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-[9.5px]">
                      <div>
                        <span className="text-zinc-500">Plan:</span> <strong className="text-white">{u.premiumRequestPlan === 'elite' ? 'Elite Consult 1-on-1' : 'Sovereign Pass'}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Method:</span> <strong className="text-white">{(u.premiumRequestPaymentMethod || 'UPI').toUpperCase()}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-zinc-500">Details:</span> <strong className="text-zinc-300">{u.premiumRequestDetails || 'Standard payment details'}</strong>
                      </div>
                      {u.premiumRequestTransactionId && (
                        <div className="sm:col-span-2 pt-1 border-t border-white/5 mt-1">
                          <span className="text-zinc-500">Transaction ID / UTR:</span>{' '}
                          <strong className="text-amber-400 select-all tracking-wider">{u.premiumRequestTransactionId}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button 
                  onClick={() => toggleStrategist(u)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${u.isStrategist ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/50 hover:text-white'}`}
                >
                  {u.isStrategist ? 'Revoke Premium Authorization' : 'Grant Premium Access'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShopManager() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [editing, setEditing] = useState<Partial<ShopProduct> | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    return onSnapshot(query(collection(db, 'shop'), orderBy('category', 'asc')), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as ShopProduct)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'shop'));
  }, []);

  const save = async (e: any) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      description: e.target.description.value,
      price: e.target.price.value,
      imageUrl: e.target.imageUrl.value,
      affiliateUrl: e.target.affiliateUrl.value,
      category: e.target.category.value
    };
    try {
      if (editing?.id) {
        await updateDoc(doc(db, 'shop', editing.id), data);
      } else {
        await addDoc(collection(db, 'shop'), data);
      }
      setEditing(null);
      setStatus("Product Saved Successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'shop');
    }
  };

  const seedShop = async () => {
    const defaultProducts = [
      {
        name: 'The 48 Laws of Power',
        description: 'The definitive guide to understanding the mechanics of power and influence.',
        price: '$18.99',
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
        affiliateUrl: 'https://amazon.com',
        category: 'Psychology'
      },
      {
        name: 'Influence: Science and Practice',
        description: 'Robert Cialdini explains the psychology of why people say "yes".',
        price: '$14.50',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400',
        affiliateUrl: 'https://amazon.com',
        category: 'Persuasion'
      }
    ];

    try {
      for (const p of defaultProducts) {
        const q = query(collection(db, 'shop'), where('name', '==', p.name));
        const snap = await getDocs(q);
        if (snap.empty) await addDoc(collection(db, 'shop'), p);
      }
      setStatus("Shop Seeded Successfully");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'shop');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-black italic">Strategic Inventory Manager</h3>
          {status && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="px-3 py-1 bg-white/10 text-white text-[8px] font-black uppercase tracking-widest rounded-full border border-white/20">
              {status}
            </motion.span>
          )}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={seedShop} 
            className="px-4 py-2 bg-white/5 text-white/60 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all font-mono"
          >
            Seed Default Shop
          </button>
          <button onClick={() => setEditing({})} className="p-2 bg-white text-black rounded-lg"><Plus /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map(p => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <img src={p.imageUrl} className="w-12 h-12 object-cover rounded-lg grayscale" />
              <div>
                <span className="font-bold uppercase tracking-tight text-white/80 block">{p.name}</span>
                <span className="text-[10px] text-gray-500 font-mono italic uppercase">{p.category} — {p.price}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit2 size={16}/></button>
              <button 
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'shop', p.id));
                  } catch (error) {
                    handleFirestoreError(error, OperationType.DELETE, `shop/${p.id}`);
                  }
                }} 
                className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onSubmit={save} className="bg-neutral-900 p-8 rounded-3xl border border-white/10 w-full max-w-lg space-y-4"
            >
              <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                  <ArrowLeft size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Back</span>
                </button>
                <h4 className="text-lg font-black uppercase tracking-widest italic">Edit Product</h4>
              </div>
              <input name="name" defaultValue={editing.name} placeholder="Product Name" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="category" defaultValue={editing.category} placeholder="Category" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="price" defaultValue={editing.price} placeholder="Price (e.g. $19.99)" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="imageUrl" defaultValue={editing.imageUrl} placeholder="Image URL" className="w-full bg-white/5 p-3 rounded-xl" required />
              <input name="affiliateUrl" defaultValue={editing.affiliateUrl} placeholder="Affiliate/Purchase URL" className="w-full bg-white/5 p-3 rounded-xl" required />
              <textarea name="description" defaultValue={editing.description} placeholder="Description" className="w-full bg-white/5 p-3 rounded-xl h-24" required />
              <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200">Save Product</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
