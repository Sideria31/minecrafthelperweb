import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Trash2, Undo2, ListChecks, X, Plus, Package,
  Bold, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, Link as LinkIcon, Save, FilePlus, FileUp, Type, ExternalLink,
  Calculator, Maximize2, Minimize2
} from 'lucide-react';
import { parseNbtToMaterials, parseTxtToMaterials } from './nbtService';

// --- COMPOSANT CALCULATRICE ---
const MinecraftCalculator = ({ onAddMaterial, onClose }) => {
  // PERSISTANCE : Récupération des données sauvegardées
  const [expression, setExpression] = useState(() => localStorage.getItem('mc_calc_expr') || "");
  const [result, setResult] = useState(() => Number(localStorage.getItem('mc_calc_res')) || 0);
  const [isRounded, setIsRounded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // DRAG & DROP : Position initiale et états
  const [position, setPosition] = useState({ x: window.innerWidth - 360, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // SAUVEGARDE AUTOMATIQUE
  useEffect(() => {
    localStorage.setItem('mc_calc_expr', expression);
    localStorage.setItem('mc_calc_res', result);
  }, [expression, result]);

  // GESTION DU DÉPLACEMENT
  const handleMouseDown = (e) => {
    if (isFullscreen) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const btns = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'];

  const handleAction = (val) => {
    if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        const rawRes = eval(expression);
        const finalRes = Math.ceil(rawRes); // Arrondi supérieur
        setIsRounded(finalRes !== rawRes); // Active le tilde si différent
        setResult(finalRes);
      } catch { 
        setResult("Err"); 
        setIsRounded(false);
      }
    } else {
      setExpression(prev => prev + val);
    }
  };

  return (
    <div 
      style={!isFullscreen ? { left: `${position.x}px`, top: `${position.y}px` } : {}}
      className={`fixed bg-[#252526] border border-[#444] shadow-2xl z-[1000] flex flex-col transition-shadow
      ${isFullscreen 
        ? 'inset-0 m-0 rounded-none' 
        : 'w-80 rounded-3xl resize overflow-auto min-w-[280px] min-h-[450px]'
      } ${isDragging ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-90' : ''}`}
    >
      {/* HEADER : Zone de drag */}
      <div 
        onMouseDown={handleMouseDown}
        className={`flex justify-between items-center p-6 pb-4 ${isFullscreen ? 'cursor-default' : 'cursor-grab active:cursor-grabbing select-none'}`}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-[#569cd6] font-bold text-xs uppercase tracking-widest pointer-events-none">Stack Calculator</h3>
          <button 
            onMouseDown={(e) => e.stopPropagation()} 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="text-gray-500 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
          </button>
        </div>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={onClose} className="text-gray-500 hover:text-white">
          <X size={18}/>
        </button>
      </div>
      
      {/* ECRAN D'AFFICHAGE */}
      <div className="px-6 mb-4 select-none">
        <input 
          type="text" 
          readOnly 
          value={expression} 
          className="w-full bg-[#1e1e1e] text-right p-3 rounded-lg text-[#569cd6] font-mono text-xl mb-2 outline-none border border-[#333]" 
          placeholder="0" 
        />
        <div className={`text-right font-black text-white font-mono transition-all flex items-center justify-end gap-2 ${isFullscreen ? 'text-7xl py-10' : 'text-3xl'}`}>
          {isRounded && <span className="text-[#ce9178] animate-pulse" title="Value rounded up">~</span>}
          {result}
        </div>
      </div>

      {/* LOGISTIQUE MC */}
      <div className="grid grid-cols-2 gap-2 mb-4 mx-6 bg-[#1e1e1e] p-3 rounded-xl border border-[#333] select-none">
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">Stacks</div>
          <div className="text-[#ce9178] font-mono text-lg">{Math.floor(result / 64)} <span className="text-[10px] text-gray-600">({result % 64})</span></div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-gray-500 uppercase">Chests</div>
          <div className="text-[#ce9178] font-mono text-lg">{Math.floor(result / (64 * 54))}</div>
        </div>
      </div>

      {/* TOUCHES */}
      <div className={`grid grid-cols-4 gap-2 mb-4 px-6 flex-grow overflow-y-auto ${isFullscreen ? 'max-w-4xl mx-auto w-full pb-10' : ''}`}>
        {btns.map(b => (
          <button 
            key={b} 
            onClick={() => handleAction(b)} 
            className={`rounded-lg font-bold transition-all ${isFullscreen ? 'text-3xl p-10' : 'p-3'} ${isNaN(b) && b !== '.' ? 'bg-[#569cd6] text-white hover:bg-[#4a86b8]' : 'bg-[#37373d] text-gray-300 hover:bg-[#45454d]'}`}
          >
            {b}
          </button>
        ))}
        <button onClick={() => {setExpression(""); setResult(0); setIsRounded(false);}} className={`col-span-2 bg-red-900/20 text-red-500 rounded-lg font-bold hover:bg-red-900/40 transition-all ${isFullscreen ? 'text-2xl p-8' : 'p-3'}`}>CLEAR</button>
        <button onClick={() => onAddMaterial(result)} className={`col-span-2 bg-green-900/20 text-green-500 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-900/40 transition-all ${isFullscreen ? 'text-2xl p-8' : 'p-3'}`}><Plus size={isFullscreen ? 24 : 16}/> ADD</button>
      </div>

      {/* INDICATEUR DE REDIMENSIONNEMENT */}
      {!isFullscreen && (
        <div className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 pointer-events-none opacity-30">
          <div className="border-r-2 border-b-2 border-white w-2 h-2"></div>
        </div>
      )}
    </div>
  );
};

// --- COMPOSANTS UI ---
const Tooltip = ({ text }) => (
  <span className="fixed invisible group-hover:visible opacity-0 group-hover:opacity-100 -translate-y-10 px-2 py-1 bg-[#121212] text-[#569cd6] text-[10px] rounded border border-[#444] shadow-2xl z-[9999] transition-all pointer-events-none font-bold uppercase tracking-widest border-b border-[#569cd6]">
    {text}
  </span>
);

const ToolbarButton = ({ icon, onClick, label }) => (
  <button 
    onClick={onClick}
    className="relative group p-2 rounded hover:bg-[#3d3d3d] text-gray-400 hover:text-white transition-all flex items-center justify-center"
  >
    {icon}
    <Tooltip text={label} />
  </button>
);

export default function App() {
  const [projects, setProjects] = useState([]); 
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState('materials'); 
  const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });
  const [customColors, setCustomColors] = useState(['#7b2eda', '#da2e7b', '#2eda7b']);
  const [showCalc, setShowCalc] = useState(false);

  const editorRef = useRef(null);
  const activeProject = projects.find(p => p.id === activeProjectId);

  const exec = (command, value = null) => {
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  const addBulletPoint = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      const fontSize = document.getElementById('font-size-select')?.value || "3";
      exec('insertHTML', `<font size="${fontSize}">•&nbsp;</font>`);
    }
  };

  const handleKeyDown = (e) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer;
    const lineText = currentNode.textContent || "";

    if (e.key === 'Enter') {
      if (lineText.includes('•')) {
        if (lineText.trim() === '•') {
          e.preventDefault();
          if (currentNode.nodeType === 3) currentNode.textContent = ""; 
          else currentNode.innerHTML = "";
          return;
        }
        const indentMatch = lineText.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[0] : "";
        e.preventDefault();
        const fontSize = document.getElementById('font-size-select')?.value || "3";
        const bulletHtml = `<br>${indent}<font size="${fontSize}">•&nbsp;</font>`;
        exec('insertHTML', bulletHtml);
      }
    }

    if (e.key === 'Tab') {
      if (lineText.includes('•')) {
        e.preventDefault();
        if (e.shiftKey) {
          if (lineText.startsWith("    ")) {
            currentNode.textContent = lineText.substring(4);
          }
        } else {
          currentNode.textContent = "    " + lineText;
        }
        const newRange = document.createRange();
        newRange.selectNodeContents(currentNode);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    const isNbt = file.name.toLowerCase().endsWith('.nbt');
    reader.onload = async (event) => {
      try {
        const results = isNbt ? await parseNbtToMaterials(event.target.result) : parseTxtToMaterials(event.target.result);
        const newId = Date.now();
        setProjects(prev => [...prev, { id: newId, name: file.name.replace(/\.[^/.]+$/, ""), data: results, history: [] }]);
        setActiveProjectId(newId);
      } catch (err) { alert("Error: " + err.message); }
    };
    if (isNbt) reader.readAsArrayBuffer(file); else reader.readAsText(file);
    e.target.value = null;
  };

  const updateActiveData = (newData, newHistory = null) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, data: newData, history: newHistory || p.history } : p));
  };

  const addManualMaterial = (qty) => {
    if (!activeProject) return alert("Please select or create a project first");
    const name = prompt("Item name:");
    if (name && qty > 0) {
      const newItem = { id: Date.now(), name: name, total: parseInt(qty), done: false };
      updateActiveData([...activeProject.data, newItem]);
    }
  };

  const deleteItem = (id) => {
    const itemToDelete = activeProject.data.find(m => m.id === id);
    const newHistory = [...activeProject.history, { item: itemToDelete, index: activeProject.data.indexOf(itemToDelete) }];
    updateActiveData(activeProject.data.filter(m => m.id !== id), newHistory);
  };

  const undoDelete = () => {
    if (!activeProject || activeProject.history.length === 0) return;
    const lastAction = activeProject.history[activeProject.history.length - 1];
    const newData = [...activeProject.data];
    newData.splice(lastAction.index, 0, lastAction.item);
    updateActiveData(newData, activeProject.history.slice(0, -1));
  };

  const sortedMaterials = useMemo(() => {
    if (!activeProject) return [];
    let items = [...activeProject.data.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let aV = a[sortConfig.key], bV = b[sortConfig.key];
        return sortConfig.direction === 'asc' ? (aV > bV ? 1 : -1) : (aV < bV ? 1 : -1);
      });
    }
    return items;
  }, [activeProject, sortConfig, search]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-sans pb-32">
      {showCalc && <MinecraftCalculator onAddMaterial={addManualMaterial} onClose={() => setShowCalc(false)} />}

      <div className="max-w-6xl mx-auto p-4 md:p-10">
        
      <header className="relative flex justify-between items-center mb-6 select-none">
        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
          <ListChecks className="text-[#569cd6]" size={32} /> PROJECT MANAGER
        </h1>
        
        <div className="flex items-center gap-3 pr-16"> 
          {activeProject?.history?.length > 0 && viewMode === 'materials' && (
            <button 
              onClick={undoDelete} 
              className="flex items-center gap-2 px-4 py-2 bg-[#37373d] text-[#569cd6] rounded-xl font-bold border border-[#569cd6]/30 hover:bg-[#45454d] animate-in fade-in zoom-in-95 duration-200"
            >
              <Undo2 size={18} /> UNDO
            </button>
          )}

          <label className="cursor-pointer bg-[#569cd6] hover:bg-[#4a86b8] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all">
            <Plus size={20}/> NEW PROJECT
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".nbt,.txt" />
          </label>
        </div>

        <button 
          onClick={() => setShowCalc(!showCalc)} 
          className={`absolute top-0 right-0 p-3 rounded-xl font-bold border transition-all z-50 ${
            showCalc 
            ? 'bg-[#569cd6] text-white border-[#569cd6] shadow-[0_0_15px_rgba(86,156,214,0.4)]' 
            : 'bg-[#252526] text-gray-400 border-[#444] hover:border-[#569cd6] hover:text-white'
          }`}
        >
          <Calculator size={20} />
        </button>
      </header>

        {/* TABS */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto no-scrollbar border-b border-[#333] select-none">
          {projects.map((p) => (
            <div key={p.id} onClick={() => setActiveProjectId(p.id)} className={`group flex items-center gap-3 px-4 py-2.5 rounded-t-xl cursor-pointer transition-all border-t-2 ${activeProjectId === p.id ? 'bg-[#252526] text-white border-[#569cd6]' : 'bg-[#1e1e1e] text-gray-500 border-transparent hover:bg-[#2d2d2d]'}`}>
              <span className="truncate text-xs font-bold w-24">{p.name}</span>
              <X size={14} className="hover:text-red-500" onClick={(e) => { e.stopPropagation(); setProjects(projects.filter(proj => proj.id !== p.id)); }} />
            </div>
          ))}
        </div>

        {/* MODE SELECTOR */}
        <div className="flex gap-4 mb-6 border-b border-[#333] pb-2 select-none">
          <button onClick={() => setViewMode('materials')} className={`pb-2 px-2 font-bold text-sm ${viewMode === 'materials' ? 'text-[#569cd6] border-b-2 border-[#569cd6]' : 'text-gray-500'}`}>MATERIALS</button>
          <button onClick={() => setViewMode('notes')} className={`pb-2 px-2 font-bold text-sm ${viewMode === 'notes' ? 'text-[#569cd6] border-b-2 border-[#569cd6]' : 'text-gray-500'}`}>NOTES</button>
        </div>

        {/* CONTENU PRINCIPAL */}
        {viewMode === 'materials' ? (
          activeProject ? (
            <div className="animate-in fade-in">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input type="text" placeholder="Search materials..." className="w-full bg-[#252526] border border-[#333] pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-[#569cd6]" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="bg-[#252526] border border-[#333] rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-[#1e1e1e]/50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                        <th className="p-5 w-16 text-center text-white">Done</th>
                        <th className="p-5">Item Name</th>
                        <th className="p-5 text-right">Qty</th>
                        <th className="p-5 text-right">Logistics</th>
                        <th className="p-5 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333]">
                    {sortedMaterials.map((m) => (
                      <tr key={m.id} className={`group ${m.done ? 'opacity-50' : ''}`}>
                        <td className="p-5 text-center"><input type="checkbox" checked={m.done} onChange={() => updateActiveData(activeProject.data.map(i => i.id === m.id ? {...i, done: !i.done} : i))} className="w-5 h-5 accent-[#569cd6]" /></td>
                        <td className="p-5 font-bold text-white">{m.name}</td>
                        <td className="p-5 text-right text-[#ce9178]">{m.total}</td>
                        <td className="p-5 text-right text-gray-500">{Math.floor(m.total/64)} STACKS + {m.total%64}</td>
                        <td className="p-5 text-center"><button onClick={() => deleteItem(m.id)}><Trash2 size={18} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-32 text-center text-gray-600 font-bold uppercase tracking-widest border-2 border-dashed border-[#333] rounded-3xl">Upload a project to start</div>
          )
        ) : (
          /* ÉDITEUR */
          <div className="flex flex-col bg-[#252526] rounded-3xl border border-[#333] overflow-visible shadow-2xl relative">
            <div className="flex flex-wrap items-center gap-1 p-3 bg-[#1e1e1e] border-b border-[#333] rounded-t-3xl z-[100]">
              <div className="flex bg-[#2d2d2d] rounded-lg p-1 mr-2 border border-[#444]">
                <ToolbarButton icon={<Bold size={18}/>} label="Bold" onClick={() => exec('bold')} />
                <ToolbarButton icon={<Underline size={18}/>} label="Underline" onClick={() => exec('underline')} />
              </div>

              <div className="flex items-center bg-[#2d2d2d] rounded-lg p-1 mr-2 border border-[#444] px-3 gap-2">
                <Type size={14} className="text-gray-500" />
                <select 
                  id="font-size-select" 
                  className="bg-transparent text-xs font-black text-[#569cd6] outline-none cursor-pointer" 
                  onChange={(e) => exec('fontSize', e.target.value)} 
                  defaultValue="3"
                >
                  {[12, 14, 16, 18, 24, 30, 36, 48].map((s, i) => <option key={s} value={i+1}>{s}px</option>)}
                </select>
              </div>

              <div className="flex bg-[#2d2d2d] rounded-lg p-1 mr-2 border border-[#444]">
                <ToolbarButton icon={<List size={18}/>} label="Bullet List" onClick={addBulletPoint} />
                <ToolbarButton icon={<ExternalLink size={18}/>} label="Project Link" onClick={() => {}} />
              </div>

              <div className="flex bg-[#2d2d2d] rounded-lg p-1 gap-1 border border-[#444] items-center px-2">
                {['#ffffff', '#ff4d4d', '#4ade80', '#569cd6', '#ffd33d'].map(c => (
                  <button key={c} className="w-4 h-4 rounded-sm hover:scale-125 transition-transform" style={{ backgroundColor: c }} onClick={() => exec('foreColor', c)} />
                ))}
                <div className="w-[1px] h-4 bg-[#444] mx-1"></div>
                {customColors.map((color, i) => (
                  <div key={i} className="relative group flex items-center">
                    <button className="w-5 h-5 rounded border border-white/20 transition-transform hover:scale-110" style={{ backgroundColor: color }} 
                      onClick={() => exec('foreColor', color)}
                      onContextMenu={(e) => { e.preventDefault(); e.target.nextSibling.click(); }}
                    />
                    <input type="color" value={color} onChange={(e) => {
                      const newCols = [...customColors];
                      newCols[i] = e.target.value;
                      setCustomColors(newCols);
                    }} className="absolute inset-0 opacity-0 pointer-events-none" />
                    <Tooltip text="L: Use / R: Edit" />
                  </div>
                ))}
              </div>
            </div>

            <div 
              ref={editorRef}
              contentEditable
              onKeyDown={handleKeyDown}
              className="p-10 outline-none min-h-[600px] text-white bg-[#252526] rounded-b-3xl z-10 whitespace-pre-wrap"
              style={{ lineHeight: '1.6' }}
            >
              <div><br/></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}