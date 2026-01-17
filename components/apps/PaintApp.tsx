import React, { useState, useRef, useEffect } from 'react';

const PaintApp: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#000000');
    const [size, setSize] = useState(3);
    const [tool, setTool] = useState<'brush' | 'eraser' | 'rect' | 'circle'>('brush');
    const [isDrawing, setIsDrawing] = useState(false);
    const [snapshot, setSnapshot] = useState<ImageData | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDraw = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStartPos({ x, y });
        
        if (tool === 'brush' || tool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            draw(e);
        } else {
            // For shapes, save current state
            setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }
    };

    const stopDraw = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (tool === 'brush' || tool === 'eraser') {
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (snapshot) {
            // Restore snapshot to avoid trailing shapes
            ctx.putImageData(snapshot, 0, 0);
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.beginPath();
            
            if (tool === 'rect') {
                ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
            } else if (tool === 'circle') {
                const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
                ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const colors = ['#000000', '#787c7e', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'];

    return (
        <div className="flex flex-col h-full bg-[#f0f0f0] select-none">
            {/* Toolbar */}
            <div className="h-24 bg-[#f5f6f7] border-b flex items-center p-2 gap-4">
                <div className="flex flex-col gap-1 border-r pr-4">
                    <div className="text-xs text-gray-600 mb-1">Tools</div>
                    <div className="flex gap-1">
                        <button 
                            className={`p-1 border rounded ${tool === 'brush' ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-200'}`} 
                            onClick={() => setTool('brush')} title="Brush"
                        >
                            <i className="fas fa-paint-brush"></i>
                        </button>
                        <button 
                            className={`p-1 border rounded ${tool === 'eraser' ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-200'}`} 
                            onClick={() => setTool('eraser')} title="Eraser"
                        >
                             <i className="fas fa-eraser"></i>
                        </button>
                        <button 
                            className={`p-1 border rounded ${tool === 'rect' ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-200'}`} 
                            onClick={() => setTool('rect')} title="Rectangle"
                        >
                             <i className="far fa-square"></i>
                        </button>
                         <button 
                            className={`p-1 border rounded ${tool === 'circle' ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-200'}`} 
                            onClick={() => setTool('circle')} title="Circle"
                        >
                             <i className="far fa-circle"></i>
                        </button>
                        <button className="p-1 border rounded hover:bg-gray-200" onClick={clearCanvas} title="Clear All">
                             <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1 border-r pr-4">
                     <div className="text-xs text-gray-600 mb-1">Size</div>
                     <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full bg-black cursor-pointer ${size === 3 ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSize(3)}></div>
                         <div className={`w-3 h-3 rounded-full bg-black cursor-pointer ${size === 6 ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSize(6)}></div>
                         <div className={`w-4 h-4 rounded-full bg-black cursor-pointer ${size === 10 ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSize(10)}></div>
                         <div className={`w-6 h-6 rounded-full bg-black cursor-pointer ${size === 15 ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSize(15)}></div>
                     </div>
                </div>

                <div className="flex-1">
                     <div className="text-xs text-gray-600 mb-1">Colors</div>
                     <div className="flex items-center gap-2">
                         <div className="flex flex-wrap gap-1 w-48">
                            {colors.map(c => (
                                <div 
                                    key={c}
                                    className={`w-5 h-5 border cursor-pointer ${color === c ? 'ring-2 ring-blue-400 z-10' : 'border-gray-400'}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                ></div>
                            ))}
                         </div>
                         <div className="flex flex-col items-center ml-2 border-l pl-2">
                             <span className="text-[10px] text-gray-500 mb-1">Custom</span>
                             <input 
                                type="color" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 cursor-pointer"
                                title="Pick a custom color"
                             />
                         </div>
                     </div>
                </div>
            </div>

            <div className="flex-1 bg-gray-200 p-4 overflow-auto flex justify-center items-center">
                 <canvas 
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="bg-white shadow-lg cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onMouseMove={draw}
                 />
            </div>
        </div>
    );
};

export default PaintApp;