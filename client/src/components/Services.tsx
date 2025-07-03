import React from 'react';
import CleaningServices from './CleaningServices';
import NotesService from './NotesService';
import './Home.css';

const Services: React.FC = () => {
  const [active, setActive] = React.useState<'notes'|'cleaning'>('notes');

  return (
    <div className="main-module-panel" style={{width:'100%',height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:8}}>
        <button className={`service-btn ${active==='notes'?'selected':''}`} onClick={()=>setActive('notes')}>Notes</button>
        <button className={`service-btn ${active==='cleaning'?'selected':''}`} onClick={()=>setActive('cleaning')}>Cleaning</button>
      </div>
      {active==='notes'?<NotesService/>:<CleaningServices />}
    </div>
  );
};

export default Services; 