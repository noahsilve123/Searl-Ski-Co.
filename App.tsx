import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, ContactShadows, Grid } from '@react-three/drei';
import { SkiConfig, INITIAL_CONFIG } from './types';
import { SkiModel } from './components/SkiModel';
import { Controls } from './components/Controls';

export default function App() {
  const [config, setConfig] = useState<SkiConfig>(INITIAL_CONFIG);

  const accentText = "text-[#3b82f6]";
  const accentTextDark = "text-[#60a5fa]"; // Lighter blue for dark bg

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#0f172a]">
      
      {/* Sidebar Navigation (Visual Only) */}
      <nav className="w-16 bg-[#0f172a] border-r border-slate-800 flex flex-col items-center py-6 z-30 shrink-0 hidden md:flex shadow-sm">
        <div className="text-xl font-black text-white mb-10 tracking-tighter cursor-pointer">S<span className={accentText}>.</span></div>
        <div className="space-y-8 flex flex-col w-full">
            <button className={`${accentText} flex justify-center w-full relative`}>
                <span className="material-icons-round">build</span>
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#3b82f6] rounded-l-full`}></div>
            </button>
            <button className="text-slate-500 hover:text-white transition flex justify-center">
                <span className="material-icons-round">person</span>
            </button>
            <button className="text-slate-500 hover:text-white transition flex justify-center">
                <span className="material-icons-round">shopping_bag</span>
            </button>
        </div>
      </nav>

      {/* 3D Viewport */}
      <div className="flex-1 relative bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
        
        {/* HUD Overlay */}
        <div className="absolute top-6 left-6 pointer-events-none z-10">
             <div className={`text-[10px] font-bold ${accentTextDark} uppercase tracking-[0.2em] mb-1`}>Interactive Configuration</div>
             <h1 className="text-5xl font-black tracking-tighter text-white opacity-90">SEARL<span className={accentText}>_</span>LABS</h1>
        </div>

        <Canvas shadows camera={{ position: [0, 4, 20], fov: 35 }}>
           <Suspense fallback={null}>
              
              {/* High Contrast Studio Lighting */}
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2} shadow-mapSize={2048} castShadow color="#ffffff" />
              <pointLight position={[-10, 5, -5]} intensity={1} color="#3b82f6" /> {/* Blue rim light */}
              <pointLight position={[0, -5, 10]} intensity={0.5} />
              <Environment preset="city" />
              
              <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2} floatingRange={[0.2, 0.5]}>
                    <group rotation={[Math.PI / 12, 0, 0]}> {/* Slight tilt forward */}
                        
                        {config.type === 'snowboard' ? (
                             <group position={[0, 0, 0]}>
                                 <SkiModel config={config} />
                             </group>
                        ) : (
                            <>
                                {/* Left Ski */}
                                 <group position={[-2.5, 0, 0]}>
                                     <SkiModel config={config} />
                                 </group>
                                 {/* Right Ski */}
                                 <group position={[2.5, 0, 0]}>
                                     <SkiModel config={config} />
                                 </group>
                            </>
                        )}

                    </group>
              </Float>

              {/* Grid & Shadows for Context */}
              <Grid 
                position={[0, -4, 0]} 
                args={[40, 40]} 
                cellSize={1} 
                cellThickness={1} 
                cellColor="#334155" 
                sectionSize={5} 
                sectionThickness={1.5} 
                sectionColor="#475569" 
                fadeDistance={25} 
                fadeStrength={1}
              />
              
              <ContactShadows 
                position={[0, -4, 0]} 
                opacity={0.6} 
                scale={30} 
                blur={2} 
                far={10} 
                resolution={512} 
                color="#000000" 
              />

           </Suspense>
           <OrbitControls 
             makeDefault 
             minPolarAngle={0} 
             maxPolarAngle={Math.PI / 2}
             enablePan={false}
           />
        </Canvas>

        {/* Mobile Toggle Warning (hidden on desktop) */}
        <div className="absolute bottom-4 left-4 md:hidden text-slate-500 text-[10px]">
            Best viewed on desktop
        </div>
      </div>

      {/* Controls Sidebar */}
      <Controls config={config} setConfig={setConfig} />
      
    </div>
  );
}