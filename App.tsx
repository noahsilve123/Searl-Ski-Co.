import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { SkiConfig, INITIAL_CONFIG } from './types';
import { SkiModel } from './components/SkiModel';
import { Controls } from './components/Controls';

export default function App() {
  const [config, setConfig] = useState<SkiConfig>(INITIAL_CONFIG);
  const [activePage, setActivePage] = useState<'collection' | 'bespoke' | 'about'>('bespoke');

  // Modern Light Palette
  const accentText = "text-blue-600";
  const accentTextDark = "text-blue-800"; 

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      
      {/* Top Navigation Header */}
      <header className="w-full bg-white border-b border-slate-200 flex items-center justify-between px-8 py-4 z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-8">
            <div className="text-2xl font-serif font-black text-slate-900 tracking-tighter cursor-pointer" onClick={() => setActivePage('bespoke')}>F<span className={accentText}>.</span></div>
            <nav className="hidden md:flex gap-6">
                <button onClick={() => setActivePage('collection')} className={`${activePage === 'collection' ? 'text-slate-900' : 'text-slate-500'} hover:text-slate-900 font-medium transition`}>Collection</button>
                <button onClick={() => setActivePage('bespoke')} className={`${activePage === 'bespoke' ? 'text-slate-900' : 'text-slate-500'} hover:text-slate-900 font-medium transition`}>Bespoke</button>
                <button onClick={() => setActivePage('about')} className={`${activePage === 'about' ? 'text-slate-900' : 'text-slate-500'} hover:text-slate-900 font-medium transition`}>About</button>
            </nav>
        </div>
        <div className="flex items-center gap-6">
            <button className="text-slate-600 hover:text-slate-900 transition flex justify-center">
                <span className="material-icons-round text-2xl">search</span>
            </button>
            <button className="text-slate-600 hover:text-slate-900 transition flex justify-center">
                <span className="material-icons-round text-2xl">person</span>
            </button>
            <button className="text-slate-600 hover:text-slate-900 transition flex justify-center">
                <span className="material-icons-round text-2xl">shopping_bag</span>
            </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

      {activePage === 'bespoke' ? (
        <>
          {/* 3D Viewport */}
          <div className="flex-1 relative bg-slate-50">
            
            {/* HUD Overlay */}
            <div className="absolute top-8 left-8 pointer-events-none z-10">
                <div className={`text-[10px] font-bold ${accentTextDark} uppercase tracking-[0.3em] mb-2`}>Bespoke Alpine Equipment</div>
                <h1 className="text-6xl font-serif font-black tracking-tighter text-slate-900 opacity-95">
                    FRONTIER<br/>
                    <span className="text-4xl font-light tracking-widest">PEAKS</span>
                </h1>
            </div>

            <Canvas shadows camera={{ position: [0, 2, 14], fov: 45 }}>
              <Suspense fallback={null}>
                  
                  {/* Cinematic Studio Lighting - Adjusted for Light Theme */}
                  <Environment preset="warehouse" blur={0.6} background={false} />
                  <ambientLight intensity={0.5} />
                  
                  {/* Key Light */}
                  <spotLight 
                    position={[10, 10, 10]} 
                    angle={0.15} 
                    penumbra={1} 
                    intensity={1.0} 
                    castShadow 
                    shadow-bias={-0.0001}
                  />
                  {/* Rim Light for Edge Definition */}
                  <spotLight position={[-10, 5, -10]} intensity={1.5} color="#3b82f6" /> 

                  <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[0, 0.2]}>
                        <group rotation={[Math.PI / 12, 0, 0]}> {/* Slight tilt forward */}
                            
                            {config.type === 'snowboard' ? (
                                <group position={[0, 0, 0]}>
                                    <SkiModel config={config} />
                                </group>
                            ) : (
                                <>
                                    {/* Left Ski */}
                                    <group position={[-1.5, 0, 0]}>
                                        <SkiModel config={config} />
                                    </group>
                                    {/* Right Ski */}
                                    <group position={[1.5, 0, 0]}>
                                        <SkiModel config={config} />
                                    </group>
                                </>
                            )}

                        </group>
                  </Float>

                  <ContactShadows 
                    position={[0, -2, 0]} 
                    opacity={0.4} 
                    scale={40} 
                    blur={2.5} 
                    far={4} 
                    color="#000000" 
                  />

                  {/* Post Processing for Luxury Feel - Toned down for Light Theme */}
                  <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.3} radius={0.4} />
                    <Noise opacity={0.02} />
                    <Vignette eskil={false} offset={0.1} darkness={0.5} />
                  </EffectComposer>

              </Suspense>
              <OrbitControls 
                makeDefault 
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 2}
                enablePan={false}
                maxDistance={20}
                minDistance={5}
              />
            </Canvas>

            {/* Mobile Toggle Warning (hidden on desktop) */}
            <div className="absolute bottom-4 left-4 md:hidden text-slate-500 text-[10px]">
                Best viewed on desktop
            </div>
          </div>

          {/* Controls Sidebar */}
          <Controls config={config} setConfig={setConfig} />
        </>
      ) : activePage === 'collection' ? (
        <div className="flex-1 bg-slate-50 p-12 overflow-y-auto">
            <h2 className="text-4xl font-serif font-black text-slate-900 mb-8">The Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-sm shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="aspect-[2/3] bg-slate-100 mb-4 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-serif text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                                {i}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Alpine Series {i}</h3>
                        <p className="text-sm text-slate-500 mb-4">All-Mountain Precision</p>
                        <div className="flex justify-between items-center">
                            <span className="text-blue-600 font-mono font-bold">$899.00</span>
                            <button className="text-xs font-bold uppercase tracking-widest text-slate-900 hover:text-blue-600">View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      ) : (
        <div className="flex-1 bg-slate-50 p-12 flex items-center justify-center">
            <div className="max-w-2xl text-center">
                <h2 className="text-4xl font-serif font-black text-slate-900 mb-6">About Frontier Peaks</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Born in the heart of the Alps, Frontier Peaks represents the intersection of traditional craftsmanship and modern technology. 
                    We believe that every skier deserves equipment that is as unique as their riding style.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                    Our bespoke configurator allows you to tailor every aspect of your equipment, from the core materials to the aesthetic finish, 
                    ensuring a ride that is truly yours.
                </p>
            </div>
        </div>
      )}
      
      </div>
    </div>
  );
}