import React, { useState, useEffect, useRef } from 'react';
import './NotesService.css';

const FILES: { label: string; filename: string }[] = [
  { label: 'Gyan', filename: 'Gyan.txt' },
  { label: 'History', filename: 'History.txt' },
  { label: 'ModernHistory', filename: 'ModernHistory.txt' },
  { label: 'Polity', filename: 'Polity.txt' },
  { label: 'Environment', filename: 'Environment.txt' },
];

// prepare raw mapping
const RAW_TXT: Record<string, () => Promise<string>> = (import.meta as any).glob('../*.txt', { as: 'raw' });

const fetchFromNotes = async (filename: string): Promise<string | null> => {
  try {
    const res = await fetch(`/notes/${filename}`);
    if (res.ok && res.headers.get('content-type')?.includes('text')) {
      return await res.text();
    }
  } catch {}
  return null;
};

const NotesService: React.FC = () => {
  const [currentFile, setCurrentFile] = useState<string>(FILES[0].filename);
  const [content, setContent] = useState('');
  const [loadingPct, setLoadingPct] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showLoader,setShowLoader]=useState(false);
  const loadStartRef=useRef(Date.now());

  const loadFile = async (filename: string) => {
    loadStartRef.current=Date.now(); setShowLoader(false);
    const bookmarkKey = `notes-bookmark-${filename}`;
    const key = `notes-${filename}`;
    const cached = localStorage.getItem(key);
    if (cached !== null) {
      setContent(cached);
      setLoadingPct(100);
      setTimeout(()=>restoreBookmark(bookmarkKey),0);
      return;
    }
    // 1) fetch from /notes/
    const textDirect = await fetchFromNotes(filename);
    if (textDirect !== null) {
      setContent(textDirect);
      setLoadingPct(100);
      setTimeout(()=>restoreBookmark(bookmarkKey),0);
      return;
    }
    // 2) fallback raw import
    const rel = `../${filename}`;
    if (RAW_TXT[rel]) {
      const raw = await RAW_TXT[rel]();
      setContent(raw as unknown as string);
      setLoadingPct(100);
      setTimeout(()=>restoreBookmark(bookmarkKey),0);
      return;
    }
    setContent('File not found');
    setLoadingPct(100);
  };

  useEffect(() => {
    loadFile(currentFile);
  }, [currentFile]);

  const handleSave = () => {
    localStorage.setItem(`notes-${currentFile}`, content);
  };

  // page info
  const [pageInfo, setPageInfo] = useState({ page: 1, total: 1 });
  const updatePageInfo = () => {
    if (!textareaRef.current) return;
    const lineHeight = 18; // approximate px
    const totalLines = content.split('\n').length;
    const linesPerPage = Math.floor(textareaRef.current.clientHeight / lineHeight);
    const totalPages = Math.max(1, Math.ceil(totalLines / linesPerPage));
    const scrollLine = Math.floor(textareaRef.current.scrollTop / lineHeight);
    const currentPage = Math.min(totalPages, Math.floor(scrollLine / linesPerPage) + 1);
    setPageInfo({ page: currentPage, total: totalPages });
  };

  useEffect(() => {
    updatePageInfo();
  }, [content]);

  // --- bookmark helpers ---
  const restoreBookmark = (key:string)=>{
    if(!textareaRef.current) return;
    const posStr = localStorage.getItem(key);
    if(posStr){ textareaRef.current.scrollTop = Number(posStr);}
  };

  const saveBookmark=(key:string)=>{
    if(!textareaRef.current) return;
    localStorage.setItem(key,String(textareaRef.current.scrollTop));
  };

  const updatePct=(pct:number)=>{ setLoadingPct(pct); if(!showLoader && Date.now()-loadStartRef.current>800) setShowLoader(true);}

  return (
    <div className="notes-container">
      <div className="notes-topbar">
        {FILES.map((f) => (
          <button
            key={f.filename}
            className={`file-btn ${f.filename === currentFile ? 'active' : ''}`}
            onClick={() => setCurrentFile(f.filename)}
          >
            {f.label}
          </button>
        ))}
        <button className="file-btn" onClick={() => alert('Add file feature coming soon')}>＋</button>
        <div className="topbar-spacer" />
        <span className="page-info">{pageInfo.page}/{pageInfo.total}</span>
        <button className="save-btn" onClick={handleSave}>💾 Save</button>
        <button className="page-btn" onClick={()=>{
          if(!textareaRef.current)return; textareaRef.current.scrollTop-=textareaRef.current.clientHeight;}}>&#x23EE;</button>
        <button className="page-btn" onClick={()=>{
          if(!textareaRef.current)return; textareaRef.current.scrollTop+=textareaRef.current.clientHeight;}}>&#x23ED;</button>
        <button className="page-btn" onClick={()=>saveBookmark(`notes-bookmark-${currentFile}`)}>🔖</button>
      </div>

      {showLoader && loadingPct<100 && (
        <div className="loading-overlay">
          <div className="loading-bar-wrapper">
            <div className="loading-bar" style={{width:`${loadingPct}%`}}/>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="notes-editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onScroll={updatePageInfo}
      />
    </div>
  );
};

export default NotesService;
