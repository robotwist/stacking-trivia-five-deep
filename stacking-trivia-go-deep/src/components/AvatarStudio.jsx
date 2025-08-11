import React, { useEffect, useRef, useState } from 'react';
import { saveAvatar, loadAvatar, clearAvatar } from '../utils/avatarStorage';

const collageFrames = [
  { id: 'torn-1', className: 'rotate-[-2deg] border-4 border-yellow-300 shadow-[8px_8px_0_rgba(0,0,0,0.4)]' },
  { id: 'tape-1', className: 'rotate-[3deg] border-2 border-amber-400 shadow-[6px_6px_0_rgba(0,0,0,0.45)]' },
  { id: 'polaroid', className: 'rotate-[-1deg] bg-white p-2 shadow-[10px_10px_0_rgba(0,0,0,0.5)]' },
  { id: 'ransom', className: 'rotate-[1deg] border-2 border-pink-400 shadow-[6px_6px_0_rgba(0,0,0,0.45)]' },
];

const defaultStickers = [
  '🎩','🧠','🎭','📎','✂️','📌','📰','🎨','🧷','📼','📻','📺'
];

const AvatarStudio = ({ userId, onClose, onSave }) => {
  const [mode, setMode] = useState('choose'); // choose | draw | collage
  const [imageSrc, setImageSrc] = useState(null);
  const [frame, setFrame] = useState(collageFrames[0].id);
  const [stickers, setStickers] = useState([]);
  const [bgColor, setBgColor] = useState('#f7e8b0');
  const canvasRef = useRef(null);

  useEffect(() => {
    const existing = loadAvatar(userId);
    if (existing) {
      setImageSrc(existing.imageSrc || null);
      setFrame(existing.frame || collageFrames[0].id);
      setStickers(existing.stickers || []);
      setBgColor(existing.bgColor || '#f7e8b0');
    }
  }, [userId]);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDraw = () => {
    setMode('draw');
    // Simple drawing: allow user to doodle on canvas
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let drawing = false;
      const start = (x, y) => { drawing = true; ctx.beginPath(); ctx.moveTo(x, y); };
      const move = (x, y) => { if (!drawing) return; ctx.lineTo(x, y); ctx.strokeStyle = '#222'; ctx.lineWidth = 4; ctx.stroke(); };
      const stop = () => { drawing = false; };
      const getPos = (ev) => {
        const rect = canvas.getBoundingClientRect();
        const x = (ev.touches?.[0]?.clientX ?? ev.clientX) - rect.left;
        const y = (ev.touches?.[0]?.clientY ?? ev.clientY) - rect.top;
        return { x, y };
      };
      canvas.addEventListener('mousedown', (ev) => { const { x, y } = getPos(ev); start(x, y); });
      canvas.addEventListener('mousemove', (ev) => { const { x, y } = getPos(ev); move(x, y); });
      window.addEventListener('mouseup', stop);
      canvas.addEventListener('touchstart', (ev) => { const { x, y } = getPos(ev); start(x, y); }, { passive: true });
      canvas.addEventListener('touchmove', (ev) => { const { x, y } = getPos(ev); move(x, y); }, { passive: true });
      window.addEventListener('touchend', stop);
    }, 0);
  };

  const addSticker = (s) => setStickers((prev) => [...prev, { id: `${s}_${Date.now()}`, value: s, x: 50, y: 50, r: Math.random()*10-5 }]);

  const save = () => {
    const data = { imageSrc, frame, stickers, bgColor, mode };
    saveAvatar(userId, data);
    onSave?.(data);
    onClose?.();
  };

  const FramePreview = () => {
    const frameClass = collageFrames.find(f => f.id === frame)?.className || '';
    return (
      <div className={`inline-block ${frameClass} bg-[${bgColor}]`}> 
        <div className="w-28 h-28 overflow-hidden flex items-center justify-center bg-[color:var(--bg)]" style={{ background: bgColor }}>
          {imageSrc ? (
            <img src={imageSrc} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="text-xs text-gray-500">No Image</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-gray-900 text-white w-full max-w-4xl rounded-lg border-2 border-yellow-400 shadow-[12px_12px_0_rgba(0,0,0,0.6)]">
        <div className="p-4 border-b border-yellow-700 flex items-center justify-between">
          <h3 className="font-bold text-xl">Avatar Studio · Monty Collage</h3>
          <button onClick={onClose} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded">Close</button>
        </div>
        <div className="grid grid-cols-12 gap-4 p-4">
          {/* Left: Controls */}
          <div className="col-span-4 space-y-4">
            <div>
              <div className="text-sm text-yellow-300 mb-1">Mode</div>
              <div className="flex gap-2">
                <button onClick={() => setMode('choose')} className={`px-3 py-1 rounded border ${mode==='choose'?'bg-yellow-600 border-yellow-500':'border-yellow-700'}`}>Choose</button>
                <button onClick={handleDraw} className={`px-3 py-1 rounded border ${mode==='draw'?'bg-yellow-600 border-yellow-500':'border-yellow-700'}`}>Draw</button>
                <button onClick={() => setMode('collage')} className={`px-3 py-1 rounded border ${mode==='collage'?'bg-yellow-600 border-yellow-500':'border-yellow-700'}`}>Collage</button>
              </div>
            </div>
            <div>
              <div className="text-sm text-yellow-300 mb-1">Frame</div>
              <div className="flex flex-wrap gap-2">
                {collageFrames.map((f) => (
                  <button key={f.id} onClick={() => setFrame(f.id)} className={`px-2 py-1 text-xs rounded border ${frame===f.id?'bg-yellow-600 border-yellow-500':'border-yellow-700'}`}>{f.id}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-yellow-300 mb-1">Background</div>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 border border-yellow-700 rounded bg-transparent" />
            </div>
            <div>
              <div className="text-sm text-yellow-300 mb-1">Stickers</div>
              <div className="flex flex-wrap gap-2">
                {defaultStickers.map((s) => (
                  <button key={s} onClick={() => addSticker(s)} className="px-2 py-1 rounded border border-yellow-700 hover:bg-yellow-700/30">{s}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={save} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold text-gray-900">Save Avatar</button>
              <button onClick={() => { clearAvatar(userId); onSave?.(null); onClose?.(); }} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded">Clear</button>
            </div>
          </div>

          {/* Right: Workspace */}
          <div className="col-span-8">
            {mode === 'choose' && (
              <div onDragOver={(e)=>e.preventDefault()} onDrop={handleDrop} className="border-2 border-dashed border-yellow-600 rounded-lg p-6 text-center">
                <div className="mb-3">Drop an image here, or select a file</div>
                <input type="file" accept="image/*" onChange={(e)=>e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="mt-4"><FramePreview /></div>
              </div>
            )}

            {mode === 'draw' && (
              <div className="border-2 border-yellow-600 rounded-lg p-3 bg-gray-800">
                <canvas ref={canvasRef} width={512} height={512} className="w-full h-[360px] bg-[color:var(--bg)]" style={{ background: bgColor }} />
                <div className="text-xs text-gray-400 mt-2">Draw with mouse or touch. Saving captures the current canvas snapshot.</div>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      setImageSrc(canvas.toDataURL('image/png'));
                    }}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-gray-900"
                  >Use Drawing</button>
                </div>
              </div>
            )}

            {mode === 'collage' && (
              <div className="border-2 border-yellow-600 rounded-lg p-4 bg-[color:var(--bg)] relative overflow-hidden" style={{ background: bgColor }}>
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.15),transparent_40%)]" />
                <div className="relative z-10 flex flex-wrap gap-4 items-center">
                  <FramePreview />
                  {stickers.map((st) => (
                    <div key={st.id} className="select-none cursor-move" style={{ transform: `rotate(${st.r}deg)` }}>
                      <span className="text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">{st.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-300">Tip: Add multiple stickers to get that ransom-note Python vibe.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarStudio;


