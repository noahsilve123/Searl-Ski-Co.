import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, ContactShadows } from '@react-three/drei';
import { SkiConfig, INITIAL_CONFIG } from './types';
import { SkiModel } from './components/SkiModel';
import { Controls } from './components/Controls';

export default function App() {
  const [config, setConfig] = useState<SkiConfig>(INITIAL_CONFIG);

  const accentText = "text-[#D4AF37]"; // Gold
  const accentTextDark = "text-[#F7E7CE]"; // Champagne

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#050505]">
      
      {/* Sidebar Navigation (Visual Only) */}
      <nav className="w-20 bg-[#0a0a0a] border-r border-[#222] flex flex-col items-center py-8 z-30 shrink-0 hidden md:flex">
        <div className="text-2xl font-serif font-bold text-white mb-12 tracking-widest cursor-pointer">S<span className={accentText}>.</span></div>
        <div className="space-y-10 flex flex-col w-full items-center">
            <button className={`${accentText} flex justify-center w-full relative group`}>
                <span className="material-icons-round text-2xl">build</span>
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-[#D4AF37]`}></div>
            </button>
            <button className="text-[#666] hover:text-white transition duration-300 flex justify-center">
                <span className="material-icons-round text-2xl">person</span>
            </button>
            <button className="text-[#666] hover:text-white transition duration-300 flex justify-center">
                <span className="material-icons-round text-2xl">shopping_bag</span>
            </button>
        </div>
      </nav>

      {/* 3D Viewport */}
      <div className="flex-1 relative bg-gradient-to-b from-[#111] to-[#050505]">
        
        {/* HUD Overlay */}
        <div className="absolute top-8 left-8 pointer-events-none z-10">
             <div className={`text-[10px] font-medium ${accentTextDark} uppercase tracking-[0.3em] mb-2`}>Bespoke Configuration</div>
             <h1 className="text-6xl font-serif font-medium tracking-tight text-white">SEARL<span className={accentText}>.</span></h1>
        </div>

        <Canvas shadows camera={{ position: [0, 4, 20], fov: 35 }}>
           <Suspense fallback={null}>
              
              {/* High Contrast Studio Lighting */}
              <ambientLight intensity={0.3} />
              <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={1.5} shadow-mapSize={2048} castShadow color="#ffffff" />
              <pointLight position={[-10, 5, -5]} intensity={0.8} color="#D4AF37" /> {/* Gold rim light */}
              <pointLight position={[0, -5, 10]} intensity={0.3} color="#ffffff" />
              <Environment preset="studio" />
              
              <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[0.1, 0.3]}>
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

              {/* Elegant Floor Reflection/Shadow */}
              <ContactShadows 
                position={[0, -4, 0]} 
                opacity={0.4} 
                scale={40} 
                blur={2.5} 
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
             dampingFactor={0.05}
           />
        </Canvas>

        {/* Mobile Toggle Warning (hidden on desktop) */}
        <div className="absolute bottom-6 left-6 md:hidden text-[#666] text-[10px] tracking-widest uppercase">
            Desktop Experience Recommended
        </div>
      </div>

      {/* Controls Sidebar */}
      <Controls config={config} setConfig={setConfig} />
      
    </div>
  );
}