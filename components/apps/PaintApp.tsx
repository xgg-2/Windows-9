import React, { useState, useRef, useEffect } from 'react';

const PaintApp: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#000000');
    const [size, setSize] = useState(3);
    const [tool, setTool] = useState<'brush' | 'eraser' | 'rect' | 'circle' | 'line' | 'fill' | 'text'>('brush');
    const [isDrawing, setIsDrawing] = useState(false);
    const [snapshot, setSnapshot] = useState<ImageData | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [text, setText] = useState('');
    const [history, setHistory] = useState<ImageData[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }, []);

    const saveToHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev.slice(-19), currentData]); // Keep last 20 steps
    };

    const undo = () => {
        if (history.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const lastState = history[history.length - 1];
        ctx.putImageData(lastState, 0, 0);
        setHistory(prev => prev.slice(0, -1));
    };

    const floodFill = (startX: number, startY: number, fillColor: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const targetColor = getPixelColor(data, startX, startY, canvas.width);
        const replacementColor = hexToRgb(fillColor);

        if (colorsMatch(targetColor, replacementColor)) return;

        const pixelsToCheck = [[startX, startY]];
        while (pixelsToCheck.length > 0) {
            const [x, y] = pixelsToCheck.pop()!;
            const currentColor = getPixelColor(data, x, y, canvas.width);

            if (colorsMatch(currentColor, targetColor)) {
                setPixelColor(data, x, y, canvas.width, replacementColor);
                if (x > 0) pixelsToCheck.push([x - 1, y]);
                if (x < canvas.width - 1) pixelsToCheck.push([x + 1, y]);
                if (y > 0) pixelsToCheck.push([x, y - 1]);
                if (y < canvas.height - 1) pixelsToCheck.push([x, y + 1]);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const getPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number) => {
        const index = (y * width + x) * 4;
        return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    };

    const setPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number, color: number[]) => {
        const index = (y * width + x) * 4;
        data[index] = color[0];
        data[index + 1] = color[1];
        data[index + 2] = color[2];
        data[index + 3] = 255;
    };

    const colorsMatch = (c1: number[], c2: number[]) => {
        return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2];
    };

    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    };

    const startDraw = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        
        saveToHistory();
        setStartPos({ x, y });
        setIsDrawing(true);
        setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

        if (tool === 'fill') {
            floodFill(x, y, color);
            setIsDrawing(false);
        } else if (tool === 'text') {
            const textToDraw = prompt('Enter text:');
            if (textToDraw) {
                ctx.font = `${size * 5}px Segoe UI, sans-serif`;
                ctx.fillStyle = color;
                ctx.fillText(textToDraw, x, y);
            }
            setIsDrawing(false);
        } else if (tool === 'brush' || tool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(x, y);
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
            } else if (tool === 'line') {
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        saveToHistory();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'painting.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const colors = ['#000000', '#787c7e', '#ffffff', '#ff0000', '#ff7800', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'];

    return (
        <div className="flex flex-col h-full bg-[#f0f0f0] select-none">
            {/* Toolbar */}
            <div className="h-32 bg-[#f5f6f7] border-b flex items-center p-2 gap-4 overflow-x-auto no-scrollbar">
                <div className="flex flex-col gap-1 border-r pr-4 min-w-fit">
                    <div className="text-xs text-gray-600 mb-1 font-semibold">Tools</div>
                    <div className="grid grid-cols-4 gap-1">
                        <button 
                            className={`p-2 border rounded transition ${tool === 'brush' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'hover:bg-white border-transparent'}`} 
                            onClick={() => setTool('brush')} title="Brush"
                        >
                            <i className="fas fa-paint-brush text-sm"></i>
                        </button>
                        <button 
                            className={`p-2 border rounded transition ${tool === 'eraser' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'hover:bg-white border-transparent'}`} 
                            onClick={() => setTool('eraser')} title="Eraser"
                        >
                             <i className="fas fa-eraser text-sm"></i>
                        </button>
                        <button 
                            className={`p-2 border rounded transition ${tool === 'fill' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'hover:bg-white border-transparent'}`} 
                            onClick={() => setTool('fill')} title="Fill Bucket"
                        >
                             <i className="fas fa-fill-drip text-sm"></i>
                        </button>
                        <button 
                            className={`p-2 border rounded transition ${tool === 'text' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'hover:bg-white border-transparent'}`} 
                            onClick={() => setTool('text')} title="Text"
                        >
                             <i className="fas fa-font text-sm"></i>
                        </button>
                        <button 
                            className={`p-2 border rounded transition ${tool === 'rect' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'hover:bg-white border-transparent'}`} 
                            onClick={() => setTool('rect')} title="Rectangle"
                        >
                             <i className="far fa-square text-sm"></i>
                        </button>
                        <button 
                            className={`p-2 border rounded transition ${tool === 'circle' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'hover:bg-white border-transparent'}`} 
                            onClick={() => setTool('circle')} title="Circle"
                        >
                             <i className="far fa-circle text-sm"></i>
                        </button>
                        <button 
                            className={`p-2 border rounded transition ${tool === 'line' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'hover:bg-white border-transparent'}`} 
                            onClick={() => setTool('line')} title="Line"
                        >
                             <i className="fas fa-slash text-sm"></i>
                        </button>
                        <button className="p-2 border border-transparent rounded hover:bg-white hover:text-red-600 transition" onClick={clearCanvas} title="Clear All">
                             <i className="fas fa-trash-alt text-sm"></i>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1 border-r pr-4 min-w-fit">
                    <div className="text-xs text-gray-600 mb-1 font-semibold">Actions</div>
                    <div className="flex flex-col gap-1">
                        <button className="flex items-center gap-2 px-3 py-1 text-xs hover:bg-white rounded transition" onClick={undo}>
                            <i className="fas fa-undo"></i> Undo
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1 text-xs hover:bg-white rounded transition text-blue-600" onClick={downloadImage}>
                            <i className="fas fa-download"></i> Save
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1 border-r pr-4 min-w-fit">
                     <div className="text-xs text-gray-600 mb-1 font-semibold">Size</div>
                     <div className="flex items-center gap-2 h-10">
                         {[2, 5, 10, 20].map(s => (
                             <div 
                                key={s}
                                className={`rounded-full bg-gray-800 cursor-pointer transition-transform hover:scale-110 ${size === s ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} 
                                style={{ width: s + 4, height: s + 4 }}
                                onClick={() => setSize(s)}
                             ></div>
                         ))}
                     </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                     <div className="text-xs text-gray-600 mb-1 font-semibold">Colors</div>
                     <div className="flex items-center gap-2">
                         <div className="flex flex-wrap gap-1 w-44">
                            {colors.map(c => (
                                <div 
                                    key={c}
                                    className={`w-5 h-5 border transition-transform hover:scale-110 cursor-pointer ${color === c ? 'ring-2 ring-blue-500 z-10 scale-110' : 'border-gray-300'}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                ></div>
                            ))}
                         </div>
                         <div className="flex flex-col items-center border-l pl-2">
                             <input 
                                type="color" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)}
                                className="w-10 h-10 cursor-pointer bg-transparent border-none"
                                title="Custom Color"
                             />
                             <span className="text-[10px] text-gray-500 mt-1">Edit</span>
                         </div>
                     </div>
                </div>
            </div>

            <div className="flex-1 bg-[#cfd3d7] p-8 overflow-auto flex justify-center items-start">
                 <div className="relative">
                    <canvas 
                        ref={canvasRef}
                        width={1000}
                        height={700}
                        className="bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)] cursor-crosshair rounded-sm"
                        onMouseDown={startDraw}
                        onMouseUp={stopDraw}
                        onMouseLeave={stopDraw}
                        onMouseMove={draw}
                    />
                    <div className="absolute -bottom-6 left-0 text-[10px] text-gray-500">
                        1000 x 700 px
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default PaintApp;
