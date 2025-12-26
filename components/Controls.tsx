import React, { useState, useEffect } from 'react';
import { SkiConfig } from '../types';
import { generateSkiSpecs } from '../services/ai';

interface ControlsProps {
    config: SkiConfig;
    setConfig: React.Dispatch<React.SetStateAction<SkiConfig>>;
}

const SECTION_titles: Record<string, string> = {
    ai: "Artisan Concierge",
    dims: "Geometry & Shape",
    profile: "Camber Profile",
    style: "Aesthetics",
    mats: "Construction"
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
            className={`w-full flex items-center justify-between p-5 border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors group ${activeSection === id ? 'text-blue-600' : 'text-slate-500'}`}
        >
            <div className="flex items-center gap-4">
                <span className="material-icons-round text-xl group-hover:text-blue-600 transition-colors">{icon}</span>
                <span className="text-xs font-serif font-bold uppercase tracking-[0.15em]">{SECTION_titles[id]}</span>
            </div>
            <span className={`material-icons-round text-sm transition-transform duration-300 ${activeSection === id ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
    );

    const RangeControl = ({ label, prop, min, max, unit }: { label: string, prop: keyof SkiConfig, min: number, max: number, unit: string }) => (
        <div className="mb-6">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                <span>{label}</span>
                <span className="text-blue-600 font-mono">{config[prop]} {unit}</span>
            </div>
            <input 
                type="range" 
                min={min} 
                max={max} 
                value={config[prop] as number} 
                onChange={(e) => update(prop, parseInt(e.target.value))} 
                className="w-full h-px bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600" 
            />
        </div>
    );

    const ColorSwatch = ({ prop, label }: { prop: keyof SkiConfig, label: string }) => (
        <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            <div className="relative w-full h-12 rounded-sm overflow-hidden border border-slate-300 group cursor-pointer hover:border-blue-600/50 transition-colors">
                <input 
                    type="color" 
                    value={config[prop] as string} 
                    onChange={(e) => update(prop, e.target.value)} 
                    className="absolute -top-4 -left-4 w-32 h-32 p-0 border-0 cursor-pointer" 
                />
            </div>
        </div>
    );

    return (
        <div className="w-full md:w-[480px] bg-white/95 backdrop-blur-2xl border-l border-slate-200 flex flex-col h-full z-20 text-slate-800 shadow-2xl">
            
            {/* Header */}
            <div className="p-8 border-b border-slate-200 bg-white">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-serif font-black tracking-tighter text-slate-900">FRONTIER<span className="text-blue-600">.</span>config</h2>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 border border-slate-200">
                        <button 
                            onClick={() => handleTypeChange('ski')}
                            className={`px-4 py-2 text-[10px] font-bold uppercase rounded-full transition-all ${isSnowboard ? 'text-slate-500 hover:text-slate-900' : 'bg-white text-blue-600 shadow-sm'}`}
                        >
                            Ski
                        </button>
                        <button 
                            onClick={() => handleTypeChange('snowboard')}
                            className={`px-4 py-2 text-[10px] font-bold uppercase rounded-full transition-all ${!isSnowboard ? 'text-slate-500 hover:text-slate-900' : 'bg-white text-blue-600 shadow-sm'}`}
                        >
                            Board
                        </button>
                    </div>
                </div>
                
                {/* Build Summary */}
                <div className="flex gap-6 text-[10px] font-mono text-slate-500 border-t border-slate-200 pt-6">
                    <div>TYPE: <span className="text-blue-600">{config.type.toUpperCase()}</span></div>
                    <div>LEN: <span className="text-blue-600">{config.length}cm</span></div>
                    <div>PROFILE: <span className="text-blue-600">{config.camberProfile.toUpperCase()}</span></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll">

                {/* --- SECTION: AI ARCHITECT --- */}
                <SectionHeader id="ai" icon="diamond" />
                {activeSection === 'ai' && (
                    <div className="p-8 bg-slate-50 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="bg-white border border-slate-200 rounded-sm p-1 shadow-sm focus-within:border-blue-600/50 transition-colors">
                            <textarea 
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder={isSnowboard ? "Describe your riding style (e.g., 'Deep powder in Niseko, surfy feel')..." : "Describe your skiing style (e.g., 'Aggressive carving on Swiss groomers')..."}
                                className="w-full bg-transparent p-4 text-sm text-slate-800 placeholder-slate-400 h-32 outline-none resize-none font-serif leading-relaxed"
                            />
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-b-sm border-t border-slate-200">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Powered by Gemini</span>
                                <button 
                                    onClick={() => handleAI()}
                                    disabled={isGenerating}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isGenerating ? "Consulting Artisan..." : "Commission Design"}
                                    {!isGenerating && <span className="material-icons-round text-[14px]">arrow_forward</span>}
                                </button>
                            </div>
                        </div>

                        {/* Quick Prompts */}
                        <div className="flex flex-wrap gap-2">
                            {(isSnowboard 
                                ? ["Hokkaido Powder", "Urban Rail Specialist", "Alaskan Spine Wall"] 
                                : ["Chamonix Steep & Deep", "Aspen Groomer Carver", "Whistler Backcountry"]
                            ).map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => handleAI(tag)}
                                    className="px-3 py-1.5 border border-slate-200 rounded-full text-[10px] text-slate-500 hover:border-blue-600/50 hover:text-blue-600 transition-colors uppercase tracking-wide bg-white"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {aiReasoning && (
                            <div className="bg-white border-l-2 border-blue-600 p-6 rounded-r-sm shadow-sm">
                                <div className="flex items-center gap-3 mb-3 text-blue-600">
                                    <span className="material-icons-round text-base">verified</span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Master Artisan's Note</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-loose font-serif italic">
                                    "{aiReasoning}"
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SECTION: DIMENSIONS --- */}
                <SectionHeader id="dims" icon="straighten" />
                {activeSection === 'dims' && (
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
                        <RangeControl label="Total Length" prop="length" min={isSnowboard ? 135 : 145} max={isSnowboard ? 170 : 195} unit="cm" />
                        <RangeControl label="Tip Width" prop="tipWidth" min={isSnowboard ? 270 : 90} max={isSnowboard ? 340 : 160} unit="mm" />
                        <RangeControl label="Waist Width" prop="waistWidth" min={isSnowboard ? 230 : 65} max={isSnowboard ? 290 : 130} unit="mm" />
                        <RangeControl label="Tail Width" prop="tailWidth" min={isSnowboard ? 270 : 80} max={isSnowboard ? 340 : 150} unit="mm" />

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Tip Shape</label>
                                <div className="flex gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200">
                                    {['rounded', 'blunt', 'pointed'].map((s) => (
                                        <button 
                                            key={s}
                                            onClick={() => update('tipShape', s)}
                                            className={`flex-1 h-10 rounded-sm flex items-center justify-center transition-all ${config.tipShape === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            title={s}
                                        >
                                           <span className="material-icons-round text-lg">
                                               {s === 'rounded' ? 'radio_button_unchecked' : s === 'blunt' ? 'crop_square' : 'change_history'}
                                           </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Tail Shape</label>
                                <div className="flex gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200">
                                    {['flat', 'partial', 'twin'].map((s) => (
                                        <button 
                                            key={s}
                                            onClick={() => update('tailShape', s)}
                                            className={`flex-1 h-10 rounded-sm flex items-center justify-center transition-all ${config.tailShape === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            title={s}
                                        >
                                           <span className="material-icons-round text-lg">
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
                    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                         <div className="grid grid-cols-3 gap-4">
                            {['camber', 'hybrid', 'rocker'].map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => update('camberProfile', p)}
                                    className={`py-6 px-2 border rounded-sm flex flex-col items-center gap-3 transition-all ${config.camberProfile === p ? 'bg-slate-50 border-blue-600/50 text-blue-600' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                                >
                                    <span className="material-icons-round text-2xl">
                                        {p === 'camber' ? 'landscape' : p === 'rocker' ? 'water' : 'all_inclusive'}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{p}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 text-center leading-relaxed font-serif italic">
                            {config.camberProfile === 'camber' && "Maximum energy return and edge hold on firm snow."}
                            {config.camberProfile === 'rocker' && "Effortless float in deep powder and surf-like maneuverability."}
                            {config.camberProfile === 'hybrid' && "The versatile balance of precision grip and forgiving release."}
                        </p>
                    </div>
                )}

                {/* --- SECTION: STYLE --- */}
                <SectionHeader id="style" icon="palette" />
                {activeSection === 'style' && (
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
                         <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Model Designation</label>
                            <input 
                                type="text" 
                                value={config.text}
                                onChange={(e) => update('text', e.target.value.toUpperCase())}
                                className="w-full bg-slate-50 border border-slate-200 p-4 text-sm text-slate-900 rounded-sm focus:border-blue-600 outline-none uppercase font-serif tracking-[0.2em] placeholder-slate-400 text-center"
                                placeholder="ENTER NAME"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <ColorSwatch label="Topsheet Base" prop="topColor" />
                            <ColorSwatch label="Graphics / Logo" prop="logoColor" />
                            <ColorSwatch label="Sidewall" prop="sidewallColor" />
                            <ColorSwatch label="Bindings" prop="bindingColor" />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Finish & Texture</label>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <select 
                                    value={config.topFinish}
                                    onChange={(e) => update('topFinish', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-xs text-slate-700 p-3 rounded-sm outline-none cursor-pointer hover:border-slate-300"
                                >
                                    <option value="glossy">High Gloss Polish</option>
                                    <option value="matte">Stealth Matte</option>
                                    <option value="satin">Satin Sheen</option>
                                    <option value="metal">Brushed Metal</option>
                                </select>
                                 <select 
                                    value={config.topPattern}
                                    onChange={(e) => update('topPattern', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-xs text-slate-700 p-3 rounded-sm outline-none cursor-pointer hover:border-slate-300"
                                >
                                    <option value="solid">Solid Color</option>
                                    <option value="carbon">Exposed Carbon</option>
                                    <option value="wood">Wood Veneer</option>
                                    <option value="topo-map">Topographic Map</option>
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
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Core Material</label>
                             <div className="space-y-3">
                                {['maple', 'paulownia', 'poplar'].map((wood) => (
                                    <button 
                                        key={wood}
                                        onClick={() => update('woodCore', wood)}
                                        className={`w-full p-4 text-left border rounded-sm flex justify-between items-center transition-all ${config.woodCore === wood ? 'bg-slate-50 border-blue-600 text-slate-900' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold uppercase tracking-wider">{wood}</span>
                                            <span className="text-[10px] opacity-60 font-serif italic">
                                                {wood === 'maple' ? 'Dense, durable, damp.' : wood === 'paulownia' ? 'Ultra-lightweight touring.' : 'Snappy and balanced.'}
                                            </span>
                                        </div>
                                        {config.woodCore === wood && <span className="material-icons-round text-sm text-blue-600">check_circle</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Edge Material</label>
                                <select 
                                    value={config.edgeMaterial}
                                    onChange={(e) => update('edgeMaterial', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-3 rounded-sm outline-none"
                                >
                                    <option value="steel">Stainless Steel</option>
                                    <option value="black">Carbon Steel (Black)</option>
                                    <option value="gold">Titanium Nitride (Gold)</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Binding Mat.</label>
                                <select 
                                    value={config.bindingMaterial}
                                    onChange={(e) => update('bindingMaterial', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 p-3 rounded-sm outline-none"
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
            <div className="p-8 border-t border-slate-200 bg-white">
                <div className="flex justify-between items-end mb-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Estimated Total</span>
                        <span className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                            ${config.type === 'ski' ? '1,249' : '899'}.00
                        </span>
                    </div>
                    <div className="text-right">
                         <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 block">Lead Time</span>
                         <span className="text-xs font-bold text-blue-600">3-4 Weeks</span>
                    </div>
                </div>
                <button className="w-full py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all duration-300">
                    Begin Production
                </button>
            </div>
        </div>
    );
};