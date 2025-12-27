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
            className={`w-full flex items-center justify-between p-5 border-b border-[#222] bg-[#0a0a0a] hover:bg-[#111] transition-colors group ${activeSection === id ? 'text-[#D4AF37]' : 'text-[#666]'}`}
        >
            <div className="flex items-center gap-4">
                <span className="material-icons-round text-lg group-hover:text-[#D4AF37] transition-colors">{icon}</span>
                <span className="text-xs font-bold uppercase tracking-[0.15em]">{SECTION_titles[id]}</span>
            </div>
            <span className={`material-icons-round text-sm transition-transform duration-300 ${activeSection === id ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
    );

    const RangeControl = ({ label, prop, min, max, unit }: { label: string, prop: keyof SkiConfig, min: number, max: number, unit: string }) => (
        <div className="mb-6">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#666] mb-3">
                <span>{label}</span>
                <span className="text-[#D4AF37] font-mono">{config[prop]} {unit}</span>
            </div>
            <input 
                type="range" 
                min={min} 
                max={max} 
                value={config[prop] as number} 
                onChange={(e) => update(prop, parseInt(e.target.value))} 
                className="w-full h-[1px] bg-[#333] appearance-none cursor-pointer accent-[#D4AF37]" 
            />
        </div>
    );

    const ColorSwatch = ({ prop, label }: { prop: keyof SkiConfig, label: string }) => (
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest">{label}</span>
            <div className="relative w-full h-10 border border-[#333] group cursor-pointer hover:border-[#D4AF37] transition-colors">
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
        <div className="w-full md:w-[450px] bg-[#0a0a0a] border-l border-[#222] flex flex-col h-full z-20 text-[#eee] shadow-2xl">
            
            {/* Header */}
            <div className="p-8 border-b border-[#222] bg-[#0a0a0a]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-serif font-bold tracking-wide text-white">SEARL<span className="text-[#D4AF37]">.</span>config</h2>
                    <div className="flex items-center gap-1 bg-[#111] p-1 border border-[#222]">
                        <button 
                            onClick={() => handleTypeChange('ski')}
                            className={`px-4 py-2 text-[10px] font-bold uppercase transition-all ${isSnowboard ? 'text-[#666] hover:text-white' : 'bg-[#D4AF37] text-black'}`}
                        >
                            Ski
                        </button>
                        <button 
                            onClick={() => handleTypeChange('snowboard')}
                            className={`px-4 py-2 text-[10px] font-bold uppercase transition-all ${!isSnowboard ? 'text-[#666] hover:text-white' : 'bg-[#D4AF37] text-black'}`}
                        >
                            Board
                        </button>
                    </div>
                </div>
                
                {/* Build Summary */}
                <div className="flex gap-6 text-[10px] font-mono text-[#666] border-t border-[#222] pt-6">
                    <div>TYPE: <span className="text-[#D4AF37]">{config.type.toUpperCase()}</span></div>
                    <div>LEN: <span className="text-[#D4AF37]">{config.length}cm</span></div>
                    <div>PROFILE: <span className="text-[#D4AF37]">{config.camberProfile.toUpperCase()}</span></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll">

                {/* --- SECTION: AI ARCHITECT --- */}
                <SectionHeader id="ai" icon="psychology" />
                {activeSection === 'ai' && (
                    <div className="p-8 bg-[#0d0d0d] space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-[#111] border border-[#222] p-1 shadow-inner">
                            <textarea 
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder={isSnowboard ? "Describe your riding style..." : "Describe your skiing style..."}
                                className="w-full bg-transparent p-4 text-xs text-white placeholder-[#444] h-28 outline-none resize-none font-medium leading-relaxed"
                            />
                            <div className="flex justify-between items-center p-3 bg-[#0a0a0a] border-t border-[#222]">
                                <span className="text-[10px] text-[#444] font-bold uppercase pl-2">Gemini 3.0 Pro</span>
                                <button 
                                    onClick={() => handleAI()}
                                    disabled={isGenerating}
                                    className="px-5 py-2 bg-[#D4AF37] hover:bg-[#b5952f] text-black text-[10px] font-bold uppercase transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isGenerating ? "Consulting..." : "Generate Specs"}
                                    {!isGenerating && <span className="material-icons-round text-[12px]">auto_awesome</span>}
                                </button>
                            </div>
                        </div>

                        {/* Quick Prompts */}
                        <div className="flex flex-wrap gap-2">
                            {(isSnowboard 
                                ? ["All-Mountain", "Powder Surfer", "Park & Pipe"] 
                                : ["Big Mountain", "Piste Carver", "Backcountry"]
                            ).map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => handleAI(tag)}
                                    className="px-3 py-1 border border-[#333] text-[10px] text-[#666] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors uppercase tracking-wider"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {aiReasoning && (
                            <div className="bg-[#111] border-l-2 border-[#D4AF37] p-5">
                                <div className="flex items-center gap-2 mb-3 text-[#D4AF37]">
                                    <span className="material-icons-round text-sm">info</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Design Philosophy</span>
                                </div>
                                <p className="text-xs text-[#aaa] leading-relaxed font-light italic">
                                    "{aiReasoning}"
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SECTION: DIMENSIONS --- */}
                <SectionHeader id="dims" icon="straighten" />
                {activeSection === 'dims' && (
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300 bg-[#0d0d0d]">
                        <RangeControl label="Total Length" prop="length" min={isSnowboard ? 135 : 145} max={isSnowboard ? 170 : 195} unit="cm" />
                        <RangeControl label="Tip Width" prop="tipWidth" min={isSnowboard ? 270 : 90} max={isSnowboard ? 340 : 160} unit="mm" />
                        <RangeControl label="Waist Width" prop="waistWidth" min={isSnowboard ? 230 : 65} max={isSnowboard ? 290 : 130} unit="mm" />
                        <RangeControl label="Tail Width" prop="tailWidth" min={isSnowboard ? 270 : 80} max={isSnowboard ? 340 : 150} unit="mm" />

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#222]">
                            <div>
                                <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 block">Tip Shape</label>
                                <div className="flex gap-1 bg-[#111] p-1 border border-[#222]">
                                    {['rounded', 'blunt', 'pointed'].map((s) => (
                                        <button 
                                            key={s}
                                            onClick={() => update('tipShape', s)}
                                            className={`flex-1 h-8 flex items-center justify-center transition-all ${config.tipShape === s ? 'bg-[#D4AF37] text-black' : 'text-[#444] hover:text-[#888]'}`}
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
                                <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 block">Tail Shape</label>
                                <div className="flex gap-1 bg-[#111] p-1 border border-[#222]">
                                    {['flat', 'partial', 'twin'].map((s) => (
                                        <button 
                                            key={s}
                                            onClick={() => update('tailShape', s)}
                                            className={`flex-1 h-8 flex items-center justify-center transition-all ${config.tailShape === s ? 'bg-[#D4AF37] text-black' : 'text-[#444] hover:text-[#888]'}`}
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
                    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-[#0d0d0d]">
                         <div className="grid grid-cols-3 gap-4">
                            {['camber', 'hybrid', 'rocker'].map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => update('camberProfile', p)}
                                    className={`py-5 px-2 border flex flex-col items-center gap-3 transition-all ${config.camberProfile === p ? 'bg-[#111] border-[#D4AF37] text-[#D4AF37]' : 'border-[#222] bg-[#0a0a0a] text-[#666] hover:border-[#444]'}`}
                                >
                                    <span className="material-icons-round text-2xl">
                                        {p === 'camber' ? 'landscape' : p === 'rocker' ? 'water' : 'all_inclusive'}
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{p}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-[#666] text-center leading-relaxed italic border-t border-[#222] pt-4">
                            {config.camberProfile === 'camber' && "Maximum precision and energy return."}
                            {config.camberProfile === 'rocker' && "Effortless float and fluid maneuverability."}
                            {config.camberProfile === 'hybrid' && "Versatile performance across all conditions."}
                        </p>
                    </div>
                )}

                {/* --- SECTION: STYLE --- */}
                <SectionHeader id="style" icon="palette" />
                {activeSection === 'style' && (
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300 bg-[#0d0d0d]">
                         <div>
                            <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 block">Model Designation</label>
                            <input 
                                type="text" 
                                value={config.text}
                                onChange={(e) => update('text', e.target.value.toUpperCase())}
                                className="w-full bg-[#111] border border-[#333] p-4 text-sm text-white focus:border-[#D4AF37] outline-none uppercase font-serif tracking-widest placeholder-[#444]"
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
                            <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 block">Finish & Texture</label>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <select 
                                    value={config.topFinish}
                                    onChange={(e) => update('topFinish', e.target.value)}
                                    className="bg-[#111] border border-[#333] text-xs text-[#ccc] p-3 outline-none cursor-pointer hover:border-[#666]"
                                >
                                    <option value="glossy">Glossy Coat</option>
                                    <option value="matte">Matte Finish</option>
                                    <option value="satin">Satin</option>
                                    <option value="metal">Brushed Metal</option>
                                </select>
                                 <select 
                                    value={config.topPattern}
                                    onChange={(e) => update('topPattern', e.target.value)}
                                    className="bg-[#111] border border-[#333] text-xs text-[#ccc] p-3 outline-none cursor-pointer hover:border-[#666]"
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
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300 bg-[#0d0d0d]">
                        <div>
                            <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 block">Core Material</label>
                             <div className="space-y-3">
                                {['maple', 'paulownia', 'poplar'].map((wood) => (
                                    <button 
                                        key={wood}
                                        onClick={() => update('woodCore', wood)}
                                        className={`w-full p-4 text-left border flex justify-between items-center transition-all ${config.woodCore === wood ? 'bg-[#111] border-[#D4AF37] text-white' : 'border-[#222] text-[#666] hover:bg-[#111]'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase tracking-wider">{wood}</span>
                                            <span className="text-[9px] opacity-60 mt-1">
                                                {wood === 'maple' ? 'Dense, durable, damp.' : wood === 'paulownia' ? 'Ultra-lightweight touring.' : 'Snappy and balanced.'}
                                            </span>
                                        </div>
                                        {config.woodCore === wood && <span className="material-icons-round text-sm text-[#D4AF37]">check_circle</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 block">Edge Material</label>
                                <select 
                                    value={config.edgeMaterial}
                                    onChange={(e) => update('edgeMaterial', e.target.value)}
                                    className="w-full bg-[#111] border border-[#333] text-xs text-[#ccc] p-3 outline-none"
                                >
                                    <option value="steel">Stainless Steel</option>
                                    <option value="black">Carbon Steel (Black)</option>
                                    <option value="gold">Titanium Nitride (Gold)</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 block">Binding Mat.</label>
                                <select 
                                    value={config.bindingMaterial}
                                    onChange={(e) => update('bindingMaterial', e.target.value)}
                                    className="w-full bg-[#111] border border-[#333] text-xs text-[#ccc] p-3 outline-none"
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
            <div className="p-8 border-t border-[#222] bg-[#0a0a0a]">
                <div className="flex justify-between items-end mb-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-[#666] uppercase tracking-widest mb-2">Estimated Total</span>
                        <span className="text-3xl font-serif font-medium text-white tracking-tight">
                            ${config.type === 'ski' ? '1,249' : '899'}.00
                        </span>
                    </div>
                    <div className="text-right">
                         <span className="text-[9px] text-[#666] uppercase tracking-widest mb-2 block">Lead Time</span>
                         <span className="text-xs font-bold text-[#D4AF37]">3-4 Weeks</span>
                    </div>
                </div>
                <button className="w-full py-5 bg-white text-black text-xs font-bold uppercase tracking-[0.25em] hover:bg-[#D4AF37] transition-colors">
                    Begin Production
                </button>
            </div>
        </div>
    );
};