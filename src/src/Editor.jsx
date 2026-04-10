import React, { useRef, useState } from 'react';
import { 
  Bold, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, Link as LinkIcon, Save, FilePlus, FileUp, Palette, Minus, Plus 
} from 'lucide-react';

export default function Editor() {
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState(3); // 1-7 (standard execCommand)
  const [showColorPicker, setShowColorPicker] = useState(false);

  // --- COMMANDES DE FORMATAGE ---
  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const addLink = () => {
    const url = prompt("Enter URL or Material List ID:");
    if (url) exec('createLink', url);
  };

  // --- FICHIERS ---
  const newFile = () => {
    if (confirm("Create new file? Unsaved changes will be lost.")) {
      editorRef.current.innerHTML = "";
    }
  };

  const saveFile = () => {
    const content = editorRef.current.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "notes.html";
    a.click();
  };

  const openFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      editorRef.current.innerHTML = event.target.result;
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] rounded-3xl border border-[#333] overflow-hidden shadow-2xl">
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-[#1e1e1e] border-b border-[#333]">
        
        {/* File Actions */}
        <div className="flex bg-[#2d2d2d] rounded-lg p-1 mr-2">
          <button onClick={newFile} className="p-2 hover:bg-[#3d3d3d] rounded text-gray-400" title="New"><FilePlus size={18}/></button>
          <label className="p-2 hover:bg-[#3d3d3d] rounded text-gray-400 cursor-pointer">
            <FileUp size={18}/><input type="file" className="hidden" onChange={openFile} accept=".html"/>
          </label>
          <button onClick={saveFile} className="p-2 hover:bg-[#3d3d3d] rounded text-gray-400" title="Save"><Save size={18}/></button>
        </div>

        {/* Text Style */}
        <div className="flex bg-[#2d2d2d] rounded-lg p-1 mr-2">
          <button onClick={() => exec('bold')} className="p-2 hover:bg-[#3d3d3d] rounded text-gray-400"><Bold size={18}/></button>
          <button onClick={() => exec('underline')} className="p-2 hover:bg-[#3d3d3d] rounded text-gray-400"><Underline size={18}/></button>
        </div>

        {/* Alignment */}
        <div className="flex bg-[#2d2d2d] rounded-lg p-1 mr-2">
          <button onClick={() => exec('justifyLeft')} className="p-2 hover:bg-[#3d3d3d] rounded text-gray-400"><AlignLeft size={18}/></button>
          <button onClick={() => exec('justifyCenter')} className="p-2 hover:bg-[#3d3d3d] rounded text-gray-400"><AlignCenter size={18}/></button>
          <button onClick={() => exec('justifyRight')} className="p-2 hover:bg-[#3d3d3d] rounded text-gray-400"><AlignRight size={18}/></button>
          <button onClick={() => exec('justifyFull')} className="p-2 hover:bg-[#3d3d3d] rounded text-gray-400"><AlignJustify size={18}/></button>
        </div>

        {/* Size & List */}
        <div className="flex items-center bg-[#2d2d2d] rounded-lg p-1 mr-2 gap-2 px-3">
          <button onClick={() => exec('fontSize', Math.max(1, fontSize-1))}><Minus size={14}/></button>
          <span className="text-xs font-bold text-[#569cd6] w-4 text-center">{fontSize}</span>
          <button onClick={() => exec('fontSize', Math.min(7, fontSize+1))}><Plus size={14}/></button>
          <div className="w-[1px] h-4 bg-[#444] mx-1"></div>
          <button onClick={() => exec('insertUnorderedList')} className="p-1 hover:bg-[#3d3d3d] rounded text-gray-400"><List size={18}/></button>
        </div>

        {/* Color & Link */}
        <div className="flex bg-[#2d2d2d] rounded-lg p-1 gap-1">
          <input 
            type="color" 
            onChange={(e) => exec('foreColor', e.target.value)}
            className="w-8 h-8 bg-transparent border-none cursor-pointer"
          />
          <button onClick={addLink} className="p-2 hover:bg-[#3d3d3d] rounded text-[#569cd6]"><LinkIcon size={18}/></button>
        </div>
      </div>

      {/* EDITABLE ZONE */}
      <div 
        ref={editorRef}
        contentEditable
        className="flex-1 p-8 outline-none overflow-y-auto text-white min-h-[500px] prose prose-invert max-w-none"
        style={{ fontSize: '1.1rem', lineHeight: '1.6' }}
        onInput={(e) => {/* Ici tu pourras gérer l'auto-save */}}
      >
        <p>Start writing your project notes here...</p>
      </div>
    </div>
  );
}