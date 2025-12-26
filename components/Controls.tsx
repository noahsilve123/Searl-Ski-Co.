import React, { useState, useEffect } from 'react';
import { SkiConfig } from '../types';
import { generateSkiSpecs } from '../services/ai';

interface ControlsProps {
    config: SkiConfig;
    setConfig: React.Dispatch<React.SetStateAction<SkiConfig>>;
}

const SECTION_titles: Record<string, string> = {
    ai: "AI Architect",
    dims: "Dimensions & Geometry",
    profile: "Camber & Profile",
    style: "Graphics & Identity",
    mats: "Materials & Hardware"
};

export const Controls: React.FC<ControlsProps> = ({ config, setConfig }) => {
    const [activeSection, setActiveSection] = useState<string | null>('ai');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiReasoning, setAiReasoning] = useState<string | null>(null);

    const isSnowboard = config.type === 'snowboard';

    // Auto-scroll reasoning into view if it appears
    useEffect(() => {
        if (aiReasoning) setActiveSection('ai');
    }, [aiReasoning]);

    const handleAI = async (overridePrompt?: string) => {
        const promptToUse = overridePrompt || aiPrompt;
        if (!promptToUse) return;
        
        setIsGenerating(true);
        setAiReasoning(null);
        try {
            const specs = await generateSkiSpecs(promptToUse + (isSnowboard ? " (Snowboard)" : " (Ski)"));
            // @ts-ignore
            setConfig(prev => ({ ...prev, ...specs }));
            // @ts-ignore
            if (specs.reasoning) setAiReasoning(specs.reasoning);
        } catch (e) {
            console.error(e);
            setAiReasoning("Connection Error. Please check API Key.");
        } finally {
            setIsGenerating(false);
        }
    };

    const update = (key: keyof SkiConfig, val: any) => {
        setConfig(prev => ({ ...prev, [key]: val }));
    };

    const toggleSection = (sec: string) => {
        setActiveSection(activeSection === sec ? null : sec);
    };

    const handleTypeChange = (targetType: 'ski' | 'snowboard') => {
        if (config.type === targetType) return;
        
        if (targetType === 'snowboard') {
            setConfig(prev => ({
                ...prev,
                type: 'snowboard',
                length: 156,
                tipWidth: 298,
                waistWidth: 254,
                tailWidth: 298,
                textPosition: 'waist'
            }));
        } else {
             setConfig(prev => ({
                ...prev,
                type: 'ski',
                length: 184,
                tipWidth: 138,
                waistWidth: 108,
                tailWidth: 128,
                textPosition: 'tail'
            }));
        }
    };

    const SectionHeader = ({ id, icon }: { id: string, icon: string }) => (
        <button 
            onClick={() => toggleSection(id)}
            className={`w-full flex items-center justify-between p-4 border-b border-white/5 bg-[#0f172a] hover:bg-slate-800 transition-colors group ${activeSection === id ? 'text-blue-400' : 'text-slate-400'}`}
        >
            <div className="flex items-center gap-3">
                <span className="material-icons-round text-lg group-hover:text-blue-400 transition-colors">{icon}</span>
                <span className="text-xs font-bold uppercase tracking-widest">{SECTION_titles[id]}</span>
            </div>
            <span className={`material-icons-round text-sm transition-transform duration-300 ${activeSection === id ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
    );

    const RangeControl = ({ label, prop, min, max, unit }: { label: string, prop: keyof SkiConfig, min: number, max: number, unit: string }) => (
        <div className="mb-4">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                <span>{label}</span>
                <span className="text-blue-400 font-mono">{config[prop]} {unit}</span>
            </div>
            <input 
                type="range" 
                min={min} 
                max={max} 
                value={config[prop] as number} 
                onChange={(e) => update(prop, parseInt(e.target.value))} 
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            />
        </div>
    );

    const ColorSwatch = ({ prop, label }: { prop: keyof SkiConfig, label: string }) => (
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            <div className="relative w-full h-10 rounded overflow-hidden border border-white/10 group cursor-pointer">
                <input 
                    type="color" 
                    value={config[prop] as string} 
                    onChange={(e) => update(prop, e.target.value)} 
                    className="absolute -top-4 -left-4 w-24 h-24 p-0 border-0 cursor-pointer" 
                />
            </div>
        </div>
    );

    return (
        <div className="w-full md:w-[420px] bg-[#0f172a]/95 backdrop-blur-xl border-l border-white/5 flex flex-col h-full z-20 text-slate-200 shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-[#0f172a]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black tracking-tighter text-white">SEARL<span className="text-blue-500">.</span>config</h2>
                    <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                        <button 
                            onClick={() => handleTypeChange('ski')}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${isSnowboard ? 'text-slate-400 hover:text-white' : 'bg-blue-600 text-white shadow-lg'}`}
                        >
                            Ski
                        </button>
                        <button 
                            onClick={() => handleTypeChange('snowboard')}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${!isSnowboard ? 'text-slate-400 hover:text-white' : 'bg-blue-600 text-white shadow-lg'}`}
                        >
                            Board
                        </button>
                    </div>
                </div>
                
                {/* Build Summary */}
                <div className="flex gap-4 text-[10px] font-mono text-slate-500 border-t border-white/5 pt-4">
                    <div>TYPE: <span className="text-white">{config.type.toUpperCase()}</span></div>
                    <div>LEN: <span className="text-white">{config.length}cm</span></div>
                    <div>PROFILE: <span className="text-white">{config.camberProfile.toUpperCase()}</span></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll">

                {/* --- SECTION: AI ARCHITECT --- */}
                <SectionHeader id="ai" icon="psychology" />
                {activeSection === 'ai' && (
                    <div className="p-6 bg-slate-900/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-xl p-1 shadow-inner">
                            <textarea 
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder={isSnowboard ? "e.g. A playful park board for buttering rails and small jumps..." : "e.g. Charging steep icy chutes in Chamonix, high stability..."}
                                className="w-full bg-transparent p-3 text-xs text-white placeholder-slate-500 h-24 outline-none resize-none font-medium"
                            />
                            <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded-b-lg border-t border-white/5">
                                <span className="text-[10px] text-slate-500 font-bold uppercase pl-2">Gemini 3.0 Flash</span>
                                <button 
                                    onClick={() => handleAI()}
                                    disabled={isGenerating}
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isGenerating ? "Analyzing..." : "Generate Specs"}
                                    {!isGenerating && <span className="material-icons-round text-[12px]">auto_awesome</span>}
                                </button>
                            </div>
                        </div>

                        {/* Quick Prompts */}
                        <div className="flex flex-wrap gap-2">
                            {(isSnowboard 
                                ? ["All-Mountain Cruiser", "Deep Powder Surfer", "Street Rail Specialist"] 
                                : ["Big Mountain Powder", "Carving Machine", "Backcountry Touring"]
                            ).map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => handleAI(tag)}
                                    className="px-2 py-1 border border-white/10 rounded-md text-[10px] text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {aiReasoning && (
                            <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2 text-blue-400">
                                    <span className="material-icons-round text-sm">info</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Engineer's Note</span>
                                </div>
                                <p className="text-xs text-blue-100 leading-relaxed opacity-90 font-light">
                                    "{aiReasoning}"
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SECTION: DIMENSIONS --- */}
                <SectionHeader id="dims" icon="straighten" />
                {activeSection === 'dims' && (
                    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <RangeControl label="Total Length" prop="length" min={isSnowboard ? 135 : 145} max={isSnowboard ? 170 : 195} unit="cm" />
                        <RangeControl label="Tip Width" prop="tipWidth" min={isSnowboard ? 270 : 90} max={isSnowboard ? 340 : 160} unit="mm" />
                        <RangeControl label="Waist Width" prop="waistWidth" min={isSnowboard ? 230 : 65} max={isSnowboard ? 290 : 130} unit="mm" />
                        <RangeControl label="Tail Width" prop="tailWidth" min={isSnowboard ? 270 : 80} max={isSnowboard ? 340 : 150} unit="mm" />

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tip Shape</label>
                                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                                    {['rounded', 'blunt', 'pointed'].map((s) => (
                                        <button 
                                            key={s}
                                            onClick={() => update('tipShape', s)}
                                            className={`flex-1 h-8 rounded flex items-center justify-center transition-all ${config.tipShape === s ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                            title={s}
                                        >
                                           <span className="material-icons-round text-sm">
                                               {s === 'rounded' ? 'radio_button_unchecked' : s === 'blunt' ? 'crop_square' : 'change_history'}
                                           </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Tail Shape</label>
                                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                                    {['flat', 'partial', 'twin'].map((s) => (
                                        <button 
                                            key={s}
                                            onClick={() => update('tailShape', s)}
                                            className={`flex-1 h-8 rounded flex items-center justify-center transition-all ${config.tailShape === s ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                            title={s}
                                        >
                                           <span className="material-icons-round text-sm">
                                               {s === 'flat' ? 'horizontal_rule' : s === 'partial' ? 'moving' : 'code'}
                                           </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECTION: PROFILE --- */}
                <SectionHeader id="profile" icon="waves" />
                {activeSection === 'profile' && (
                    <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                         <div className="grid grid-cols-3 gap-3">
                            {['camber', 'hybrid', 'rocker'].map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => update('camberProfile', p)}
                                    className={`py-4 px-2 border rounded-xl flex flex-col items-center gap-2 transition-all ${config.camberProfile === p ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-600'}`}
                                >
                                    <span className="material-icons-round text-xl">
                                        {p === 'camber' ? 'landscape' : p === 'rocker' ? 'water' : 'all_inclusive'}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase">{p}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                            {config.camberProfile === 'camber' && "Maximum pop and edge hold on hard snow."}
                            {config.camberProfile === 'rocker' && "Ultimate float in powder and playful turn initiation."}
                            {config.camberProfile === 'hybrid' && "The perfect balance of grip and forgiveness."}
                        </p>
                    </div>
                )}

                {/* --- SECTION: STYLE --- */}
                <SectionHeader id="style" icon="palette" />
                {activeSection === 'style' && (
                    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                         <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Model Designation</label>
                            <input 
                                type="text" 
                                value={config.text}
                                onChange={(e) => update('text', e.target.value.toUpperCase())}
                                className="w-full bg-slate-900 border border-slate-700 p-3 text-sm text-white rounded focus:border-blue-500 outline-none uppercase font-mono tracking-widest placeholder-slate-600"
                                placeholder="ENTER NAME"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <ColorSwatch label="Topsheet Base" prop="topColor" />
                            <ColorSwatch label="Graphics / Logo" prop="logoColor" />
                            <ColorSwatch label="Sidewall" prop="sidewallColor" />
                            <ColorSwatch label="Bindings" prop="bindingColor" />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Finish & Texture</label>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <select 
                                    value={config.topFinish}
                                    onChange={(e) => update('topFinish', e.target.value)}
                                    className="bg-slate-800 border-none text-xs text-white p-2 rounded outline-none cursor-pointer"
                                >
                                    <option value="glossy">Glossy Coat</option>
                                    <option value="matte">Matte Finish</option>
                                    <option value="satin">Satin</option>
                                    <option value="metal">Brushed Metal</option>
                                </select>
                                 <select 
                                    value={config.topPattern}
                                    onChange={(e) => update('topPattern', e.target.value)}
                                    className="bg-slate-800 border-none text-xs text-white p-2 rounded outline-none cursor-pointer"
                                >
                                    <option value="solid">Solid</option>
                                    <option value="carbon">Exposed Carbon</option>
                                    <option value="wood">Wood Veneer</option>
                                    <option value="topo-map">Topo Map</option>
                                    <option value="linear-fade">Linear Gradient</option>
                                    <option value="geometric">Geometric</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                 {/* --- SECTION: MATERIALS --- */}
                 <SectionHeader id="mats" icon="handyman" />
                 {activeSection === 'mats' && (
                    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Core Material</label>
                             <div className="space-y-2">
                                {['maple', 'paulownia', 'poplar'].map((wood) => (
                                    <button 
                                        key={wood}
                                        onClick={() => update('woodCore', wood)}
                                        className={`w-full p-3 text-left border rounded-lg flex justify-between items-center transition-all ${config.woodCore === wood ? 'bg-blue-900/20 border-blue-500 text-white' : 'border-slate-800 text-slate-500 hover:bg-slate-900'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase">{wood}</span>
                                            <span className="text-[9px] opacity-60">
                                                {wood === 'maple' ? 'Dense, durable, damp.' : wood === 'paulownia' ? 'Ultra-lightweight touring.' : 'Snappy and balanced.'}
                                            </span>
                                        </div>
                                        {config.woodCore === wood && <span className="material-icons-round text-sm text-blue-400">check_circle</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Edge Material</label>
                                <select 
                                    value={config.edgeMaterial}
                                    onChange={(e) => update('edgeMaterial', e.target.value)}
                                    className="w-full bg-slate-800 text-xs text-white p-2 rounded outline-none"
                                >
                                    <option value="steel">Stainless Steel</option>
                                    <option value="black">Carbon Steel (Black)</option>
                                    <option value="gold">Titanium Nitride (Gold)</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Binding Mat.</label>
                                <select 
                                    value={config.bindingMaterial}
                                    onChange={(e) => update('bindingMaterial', e.target.value)}
                                    className="w-full bg-slate-800 text-xs text-white p-2 rounded outline-none"
                                >
                                    <option value="plastic">Reinforced Nylon</option>
                                    <option value="aluminum">Aluminum Alloy</option>
                                    <option value="carbon">Forged Carbon</option>
                                </select>
                            </div>
                         </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-[#0f172a]">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Estimated Total</span>
                        <span className="text-2xl font-mono font-bold text-white tracking-tight">
                            ${config.type === 'ski' ? '1,249' : '899'}.00
                        </span>
                    </div>
                    <div className="text-right">
                         <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 block">Lead Time</span>
                         <span className="text-xs font-bold text-green-400">3-4 Weeks</span>
                    </div>
                </div>
                <button className="w-full py-4 bg-white text-black text-sm font-black uppercase tracking-[0.2em] hover:bg-blue-400 transition-colors">
                    Begin Production
                </button>
            </div>
        </div>
    );
};