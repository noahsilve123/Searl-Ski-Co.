import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Text, useTexture } from '@react-three/drei';
import { SkiConfig } from '../types';

interface SkiModelProps {
    config: SkiConfig;
}

// --- Modular Snowboard Binding Components ---

const BindingBaseplate: React.FC<{ materialProps: any; heelcupProps: any }> = ({ materialProps, heelcupProps }) => (
    <group position={[0, 0.1, 0]}>
        {/* Main Floor Chassis */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[1.6, 0.08, 2.2]} />
            <meshPhysicalMaterial {...materialProps} />
        </mesh>
        
        {/* Side Rails/Chassis Walls */}
        <mesh castShadow receiveShadow position={[0.75, 0.15, 0]}>
            <boxGeometry args={[0.12, 0.3, 1.8]} />
            <meshPhysicalMaterial {...materialProps} />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.75, 0.15, 0]}>
            <boxGeometry args={[0.12, 0.3, 1.8]} />
            <meshPhysicalMaterial {...materialProps} />
        </mesh>

        {/* Heel Loop - Uses distinct material (often Aluminum) */}
        <group position={[0, 0.2, 0.9]}>
            <mesh castShadow position={[0, 0, 0]}>
                <boxGeometry args={[1.7, 0.4, 0.15]} />
                <meshStandardMaterial {...heelcupProps} />
            </mesh>
            {/* Heel Loop Connectors */}
            <mesh castShadow position={[0.8, 0, -0.4]}>
                <boxGeometry args={[0.1, 0.4, 0.8]} />
                <meshStandardMaterial {...heelcupProps} />
            </mesh>
            <mesh castShadow position={[-0.8, 0, -0.4]}>
                <boxGeometry args={[0.1, 0.4, 0.8]} />
                <meshStandardMaterial {...heelcupProps} />
            </mesh>
        </group>

        {/* Mounting Disc */}
        <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.02, 32]} />
            <meshStandardMaterial color="#222" metalness={0.6} roughness={0.7} />
        </mesh>
        
        {/* EVA Footbed & Gas Pedal */}
        <group position={[0, 0.1, 0]}>
            <mesh receiveShadow position={[0, 0.05, 0]}>
                    <boxGeometry args={[1.5, 0.1, 2.3]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.07, -1.0]} rotation={[0.15, 0, 0]}>
                    <boxGeometry args={[1.5, 0.12, 0.6]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
        </group>
    </group>
);

const BindingHighback: React.FC<{ materialProps: any; paddingProps: any }> = ({ materialProps, paddingProps }) => (
    <group position={[0, 0.5, 0.9]} rotation={[0.15, 0, 0]}> 
        {/* Outer Shell - Engineered Polygon */}
        <mesh castShadow position={[0, 0.7, 0]} rotation={[0, Math.PI, 0]}>
                <cylinderGeometry args={[0.7, 0.6, 1.4, 32, 1, true, -Math.PI/3, 2*Math.PI/3]} /> 
                <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Structural Spine */}
        <mesh position={[0, 0.5, 0.6]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.3, 1.0, 0.15]} />
                <meshPhysicalMaterial {...materialProps} />
        </mesh>

        {/* Inner Comfort Padding */}
        <mesh position={[0, 0.7, -0.02]} rotation={[0, Math.PI, 0]}>
                <cylinderGeometry args={[0.68, 0.58, 1.35, 32, 1, true, -Math.PI/3, 2*Math.PI/3]} /> 
                <meshStandardMaterial {...paddingProps} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Forward Lean Adjuster Block */}
        <mesh position={[0, 0.1, 0.65]}>
            <boxGeometry args={[0.2, 0.2, 0.1]} />
            <meshStandardMaterial color="#333" roughness={0.8} />
        </mesh>
    </group>
);

const BindingStrap: React.FC<{ type: 'ankle' | 'toe'; materialProps: any }> = ({ type, materialProps }) => {
    const isToe = type === 'toe';
    // Positioning adjustments based on type
    const groupPos = isToe ? [0, 0.4, -1.0] as any : [0, 0.9, 0.1] as any;
    const groupRot = isToe ? [1.3, 0, 0] as any : [0.4, 0, 0] as any;
    
    return (
        <group position={groupPos} rotation={groupRot}>
             <mesh castShadow>
                 {isToe 
                    // Toe cap shape
                    ? <cylinderGeometry args={[0.7, 0.7, 0.35, 24, 1, true, 0, Math.PI]} />
                    // Ankle strap shape
                    : <cylinderGeometry args={[0.85, 0.85, 0.5, 24, 1, true, 0, Math.PI]} />
                 }
                 <meshStandardMaterial {...materialProps} side={THREE.DoubleSide} />
            </mesh>
            
            {/* 3D Detail/Stitching Overlay for realism */}
            {!isToe && (
                <mesh position={[0, 0, 0.015]} scale={[1.01, 0.8, 1.01]}>
                    <cylinderGeometry args={[0.85, 0.85, 0.5, 24, 1, true, 0, Math.PI]} />
                    <meshStandardMaterial color={materialProps.color} roughness={1} wireframe opacity={0.3} transparent />
                </mesh>
            )}

            {/* Ratchet Buckle */}
            <mesh position={[isToe ? 0.7 : 0.8, isToe ? 0 : -0.1, 0]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.3, 0.15, 0.2]} />
                <meshStandardMaterial color="#888" metalness={0.9} roughness={0.3} />
            </mesh>
        </group>
    );
};

const SnowboardBinding: React.FC<{ 
    materialProps: any; 
    heelcupProps: any;
    strapMaterialProps: any; 
    rotation: [number, number, number];
    position: [number, number, number];
    scale: [number, number, number];
}> = ({ materialProps, heelcupProps, strapMaterialProps, rotation, position, scale }) => {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            <BindingBaseplate materialProps={materialProps} heelcupProps={heelcupProps} />
            <BindingHighback materialProps={materialProps} paddingProps={strapMaterialProps} />
            <BindingStrap type="ankle" materialProps={strapMaterialProps} />
            <BindingStrap type="toe" materialProps={strapMaterialProps} />
        </group>
    );
};

// --- Main Bindings Container & Ski Logic ---

const Bindings: React.FC<{ config: SkiConfig }> = ({ config }) => {
    const isSnowboard = config.type === 'snowboard';
    
    // Main Chassis Material
    const materialProps = useMemo(() => {
        const color = config.bindingColor || '#1e293b';
        switch (config.bindingMaterial) {
            case 'aluminum':
                return { color, metalness: 0.8, roughness: 0.3, clearcoat: 0.1 };
            case 'carbon':
                return { 
                    color: '#1a1a1a', 
                    emissive: color, emissiveIntensity: 0.05, 
                    metalness: 0.4, roughness: 0.4, 
                    clearcoat: 0.5 
                };
            case 'plastic':
            default:
                return { color, metalness: 0.0, roughness: 0.6, clearcoat: 0.0 };
        }
    }, [config.bindingColor, config.bindingMaterial]);

    // Heelcup specific material (often different from chassis)
    const heelcupProps = useMemo(() => {
        if (config.bindingMaterial === 'carbon') {
             // Carbon bindings usually have a matching forged carbon or anodized aluminum heelcup
             return { color: '#222', metalness: 0.7, roughness: 0.4 };
        }
        if (config.bindingMaterial === 'aluminum') {
             // Monolithic look or slight contrast
             return { color: config.bindingColor, metalness: 0.85, roughness: 0.25 };
        }
        // Plastic bindings often use Aluminum heelcups for strength
        return { color: '#0f172a', metalness: 0.8, roughness: 0.3 };
    }, [config.bindingMaterial, config.bindingColor]);

    // Strap Materials
    const strapMaterialProps = useMemo(() => {
        const color = config.strapColor || '#0f172a';
        switch (config.strapTexture) {
            case 'leather':
                return { color, roughness: 0.4, metalness: 0.0, clearcoat: 0.2, bumpScale: 0.02 };
            case 'fabric':
                return { color, roughness: 0.9, metalness: 0.0, flatShading: false };
            case 'rubber':
            default:
                return { color, roughness: 0.6, metalness: 0.0 };
        }
    }, [config.strapColor, config.strapTexture]);

    if (isSnowboard) {
        const halfStance = (config.length / 10) * 0.175; 
        const bindingScale = 1.25;

        return (
            <group>
                <SnowboardBinding 
                    position={[0, 0.25, -halfStance]} 
                    rotation={[0, Math.PI / 12, 0]} 
                    scale={[bindingScale, bindingScale, bindingScale]}
                    materialProps={materialProps}
                    heelcupProps={heelcupProps}
                    strapMaterialProps={strapMaterialProps}
                />
                <SnowboardBinding 
                    position={[0, 0.25, halfStance]} 
                    rotation={[0, -Math.PI / 12, 0]} 
                    scale={[bindingScale, bindingScale, bindingScale]}
                    materialProps={materialProps}
                    heelcupProps={heelcupProps}
                    strapMaterialProps={strapMaterialProps}
                />
            </group>
        );
    }

    // Render Ski Bindings (Alpine Style)
    return (
        <group position={[0, 0.3, 0]}>
            {/* --- TOE PIECE --- */}
            <group position={[0, 0, -1.2]}>
                <mesh castShadow position={[0, 0.1, 0]}>
                    <boxGeometry args={[0.7, 0.3, 0.9]} />
                    <meshPhysicalMaterial {...materialProps} />
                </mesh>
                <mesh position={[0.3, 0.15, 0.3]} rotation={[0, -0.5, 0]}>
                     <boxGeometry args={[0.2, 0.25, 0.6]} />
                     <meshStandardMaterial color={config.strapColor} metalness={0.5} roughness={0.5} />
                </mesh>
                <mesh position={[-0.3, 0.15, 0.3]} rotation={[0, 0.5, 0]}>
                     <boxGeometry args={[0.2, 0.25, 0.6]} />
                     <meshStandardMaterial color={config.strapColor} metalness={0.5} roughness={0.5} />
                </mesh>
                <mesh position={[0, 0.26, -0.2]}>
                    <boxGeometry args={[0.3, 0.02, 0.4]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
            </group>

            {/* --- HEEL PIECE --- */}
            <group position={[0, 0, 1.2]}>
                <mesh castShadow position={[0, 0.25, 0]}>
                    <boxGeometry args={[0.7, 0.6, 0.8]} />
                    <meshPhysicalMaterial {...materialProps} />
                </mesh>
                 <mesh position={[0, 0.4, -0.3]} rotation={[0.2, 0, 0]}>
                    <boxGeometry args={[0.6, 0.1, 0.4]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                 <mesh position={[0, 0.5, 0.3]} rotation={[-0.2, 0, 0]}>
                    <boxGeometry args={[0.5, 0.1, 0.6]} />
                    <meshStandardMaterial color="#333" metalness={0.5} />
                </mesh>
                <group position={[0, -0.1, 0]}>
                    <mesh position={[0.45, 0, 0.1]} rotation={[0, 0, 0.5]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.8]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh position={[-0.45, 0, 0.1]} rotation={[0, 0, -0.5]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.8]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh position={[0, 0.1, 0.1]} rotation={[0.3, 0, 0]}>
                         <boxGeometry args={[0.6, 0.05, 0.4]} />
                         <meshStandardMaterial color={config.strapColor} />
                    </mesh>
                </group>
            </group>

            <mesh position={[0, -0.1, 0]}>
                <boxGeometry args={[0.6, 0.08, 2.8]} />
                <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
};

export const SkiModel: React.FC<SkiModelProps> = ({ config }) => {
    const meshRef = useRef<THREE.Group>(null);
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    const textureRef = useRef<THREE.CanvasTexture | null>(null);

    // --- Procedural Texture Generation Engine ---
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 1024;
        canvas.height = 4096;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            const width = 1024;
            const height = 4096;
            
            // 1. Base Background
            ctx.fillStyle = config.topColor;
            ctx.fillRect(0, 0, width, height);

            // 2. Pattern Generation
            ctx.save();
            const patternColor = config.logoColor;
            
            // ... (Existing Pattern Logic) ...
            if (config.topPattern === 'carbon') {
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                const size = 16;
                for(let y=0; y<height; y+=size) {
                    for(let x=0; x<width; x+=size) {
                        if ((Math.floor(x/size) + Math.floor(y/size)) % 2 === 0) {
                            ctx.fillRect(x, y, size, size);
                        }
                    }
                }
            } else if (config.topPattern === 'wood') {
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 400; i++) {
                    const x = Math.random() * width;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.bezierCurveTo(x + (Math.random() - 0.5) * 50, height * 0.33, x + (Math.random() - 0.5) * 50, height * 0.66, x + (Math.random() - 0.5) * 100, height);
                    ctx.stroke();
                }
            } else if (config.topPattern === 'geometric') {
                ctx.globalAlpha = 0.3;
                for(let i=0; i<50; i++) {
                    ctx.fillStyle = i % 2 === 0 ? patternColor : '#ffffff';
                    ctx.beginPath();
                    ctx.moveTo(Math.random() * width, Math.random() * height);
                    ctx.lineTo(Math.random() * width, Math.random() * height);
                    ctx.lineTo(Math.random() * width, Math.random() * height);
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
            } else if (config.topPattern === 'camo') {
                 const drawBlob = (x: number, y: number, s: number, color: string) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    for(let i=0; i<7; i++) {
                        const angle = (i / 6) * Math.PI * 2;
                        const rad = s * (0.5 + Math.random() * 0.8);
                        ctx.lineTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
                    }
                    ctx.fill();
                };
                for(let i=0; i<40; i++) {
                    drawBlob(Math.random() * width, Math.random() * height, 150, patternColor + '40');
                }
            } else if (config.topPattern === 'splatter') {
                for(let i=0; i<300; i++) {
                    const r = Math.random() * 15;
                    ctx.fillStyle = Math.random() > 0.5 ? patternColor : '#ffffff';
                    ctx.globalAlpha = Math.random() * 0.8;
                    ctx.beginPath();
                    ctx.arc(Math.random() * width, Math.random() * height, r, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
            } else if (config.topPattern === 'linear-fade') {
                 const gradient = ctx.createLinearGradient(0, 0, 0, height);
                 gradient.addColorStop(0, config.topColor);
                 gradient.addColorStop(0.5, config.topColor); 
                 gradient.addColorStop(1, config.logoColor);
                 ctx.fillStyle = gradient;
                 ctx.fillRect(0,0, width, height);
            } else if (config.topPattern === 'topo-map') {
                ctx.strokeStyle = patternColor;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.3;
                const steps = 30;
                for(let i=0; i<steps; i++) {
                    ctx.beginPath();
                    let x = 0; let y = (height/steps) * i;
                    ctx.moveTo(x, y);
                    while(x < width) { x += 20; const noise = Math.sin(x * 0.01 + i) * 50 + Math.cos(y * 0.01) * 30; ctx.lineTo(x, y + noise); }
                    ctx.stroke();
                }
                ctx.globalAlpha = 1.0;
            }

            if (config.topFinish !== 'metal') {
                ctx.fillStyle = 'rgba(0,0,0,0.02)';
                for(let i=0; i<5000; i++) { ctx.fillRect(Math.random()*width, Math.random()*height, 2, 2); }
            }
            ctx.restore();

            // 3. Branding
            ctx.save();
            let textY = 2048; // Waist
            if (config.textPosition === 'tip') textY = 600;
            if (config.textPosition === 'tail') textY = 3500;

            ctx.translate(512, textY);
            ctx.rotate(-Math.PI / 2); 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = config.logoColor;
            
            const fontSize = config.text.length > 10 ? 120 : 180;
            let fontName = "Arial";
            if (config.fontStyle === 'stencil') fontName = "Courier New";
            if (config.fontStyle === 'handwritten') fontName = "Brush Script MT";
            if (config.fontStyle === 'retro') fontName = "Impact";
            if (config.fontStyle === 'outline') {
                ctx.strokeStyle = config.logoColor;
                ctx.lineWidth = 4;
                ctx.fillStyle = "transparent";
                fontName = "Arial Black";
            }
            ctx.font = `900 ${fontSize}px "${fontName}"`;
            
            if (config.fontStyle !== 'outline') {
                ctx.shadowColor = "rgba(0,0,0,0.1)";
                ctx.shadowBlur = 10;
                ctx.fillText(config.text, 0, 0);
            } else {
                 ctx.strokeText(config.text, 0, 0);
            }
            
            if (config.textPosition !== 'waist') {
                ctx.shadowBlur = 0;
                ctx.font = '400 40px "Courier New"';
                ctx.fillStyle = config.logoColor;
                ctx.rotate(Math.PI/2);
                ctx.translate(0, 2000 - textY);
                ctx.rotate(-Math.PI/2);
                ctx.fillText(`SEARL MFG // ${config.length}cm // ${config.type.toUpperCase()}`, 0, 140);
            }
            ctx.restore();
        }
        if (textureRef.current) textureRef.current.needsUpdate = true;
    }, [config]);


    // --- Geometry Generation ---
    const createEquipmentGeometry = (widthOffset: number, thickness: number) => {
        const shape = new THREE.Shape();
        const len = config.length / 10; 
        const tipW = (config.tipWidth + widthOffset) / 70; 
        const waistW = (config.waistWidth + widthOffset) / 70;
        const tailW = (config.tailWidth + widthOffset) / 70;
        const halfLen = len / 2;
        
        const yTip = -halfLen;
        const yTipStart = -halfLen + (len * 0.1); 
        const yWaist = 0;
        const yTailStart = halfLen - (len * 0.1);
        const yTail = halfLen;

        // 1. TIP GEOMETRY
        if (config.tipShape === 'blunt') {
            const bluntWidth = tipW * 0.7; 
            shape.moveTo(-bluntWidth / 2, yTip); 
            shape.lineTo(bluntWidth / 2, yTip); 
            shape.bezierCurveTo(tipW / 2, yTip, tipW / 2, yTip + (len * 0.03), tipW / 2, yTipStart);
        } else if (config.tipShape === 'pointed') {
            const pointExtension = len * 0.02; 
            shape.moveTo(0, yTip - pointExtension); 
            shape.bezierCurveTo(tipW * 0.25, yTip - (pointExtension * 0.5), tipW * 0.5, yTip, tipW / 2, yTipStart);
        } else {
            shape.moveTo(0, yTip);
            shape.bezierCurveTo(tipW / 1.8, yTip, tipW / 2, yTip + (len * 0.03), tipW / 2, yTipStart);
        }

        // 2. RIGHT SIDE
        shape.bezierCurveTo(tipW / 2, yWaist - (len * 0.15), waistW / 2, yWaist - (len * 0.15), waistW / 2, yWaist);
        shape.bezierCurveTo(waistW / 2, yWaist + (len * 0.15), tailW / 2, yTailStart - (len * 0.15), tailW / 2, yTailStart);

        // 3. TAIL GEOMETRY
        if (config.tailShape === 'twin') {
            shape.bezierCurveTo(tailW / 2, yTail - (len * 0.03), tailW / 1.8, yTail, 0, yTail);
            shape.bezierCurveTo(-tailW / 1.8, yTail, -tailW / 2, yTail - (len * 0.03), -tailW / 2, yTailStart);
        } else if (config.tailShape === 'flat') {
            shape.lineTo(tailW / 2, yTail);
            shape.lineTo(-tailW / 2, yTail);
            shape.lineTo(-tailW / 2, yTailStart);
        } else {
            shape.bezierCurveTo(tailW / 2, yTail, 0, yTail + 0.2, -tailW / 2, yTailStart);
        }

        // 4. LEFT SIDE
        shape.bezierCurveTo(-tailW / 2, yTailStart - (len * 0.15), -waistW / 2, yWaist + (len * 0.15), -waistW / 2, yWaist);
        shape.bezierCurveTo(-waistW / 2, yWaist - (len * 0.15), -tipW / 2, yTipStart + (len * 0.15), -tipW / 2, yTipStart);

        // 5. CLOSE TIP
         if (config.tipShape === 'blunt') {
            const bluntWidth = tipW * 0.7;
            shape.bezierCurveTo(-tipW / 2, yTip + (len * 0.03), -tipW / 2, yTip, -bluntWidth / 2, yTip);
        } else if (config.tipShape === 'pointed') {
            const pointExtension = len * 0.02;
            shape.bezierCurveTo(-tipW * 0.5, yTip, -tipW * 0.25, yTip - (pointExtension * 0.5), 0, yTip - pointExtension);
        } else {
             shape.bezierCurveTo(-tipW / 2, yTip + (len * 0.03), -tipW / 1.8, yTip, 0, yTip);
        }

        const extrudeSettings = {
            steps: 80, 
            depth: thickness, 
            bevelEnabled: true,
            bevelThickness: 0.02, 
            bevelSize: 0.02, 
            bevelSegments: 2 
        };

        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.rotateX(Math.PI / 2); 

        const positions = geo.attributes.position;
        const v = new THREE.Vector3();

        for (let i = 0; i < positions.count; i++) {
            v.fromBufferAttribute(positions, i);
            const normalizedPos = v.z / halfLen; 
            let yOffset = 0;

            // --- CAMBER PROFILE ---
            if (config.camberProfile === 'camber') {
                if (Math.abs(normalizedPos) < 0.7) yOffset = Math.cos(normalizedPos * Math.PI / 1.4) * 0.5;
            } else if (config.camberProfile === 'rocker') {
                yOffset = Math.pow(Math.abs(normalizedPos), 2.5) * 1.5;
            } else {
                if (Math.abs(normalizedPos) < 0.4) yOffset = Math.cos(normalizedPos * Math.PI * 1.2) * 0.2; 
                else { const d = Math.abs(normalizedPos) - 0.4; yOffset = (d * d) * 3; }
            }

            // --- KICK ---
            if (normalizedPos < -0.75) {
                const kick = Math.abs(normalizedPos) - 0.75;
                yOffset += kick * kick * 15; 
            }
            if (normalizedPos > 0.75) {
                const kick = normalizedPos - 0.75;
                if (config.tailShape === 'twin') yOffset += kick * kick * 15;
                else if (config.tailShape === 'partial') yOffset += kick * kick * 8;
                else yOffset += kick * kick * 2;
            }
            
            const thicknessMultiplier = 1 - Math.pow(Math.abs(normalizedPos), 3) * 0.6;
            v.y += yOffset;
            if (v.y > yOffset + (thickness * 0.5)) {
                v.y -= (thickness * (1-thicknessMultiplier));
            }
            positions.setXYZ(i, v.x, v.y, v.z);
        }
        geo.computeVertexNormals();
        return geo;
    };

    const edgeGeometry = useMemo(() => createEquipmentGeometry(0, 0.02), [config]);
    const coreGeometry = useMemo(() => {
        const geo = createEquipmentGeometry(-2, 0.15); 
        geo.translate(0, 0.02, 0); 
        return geo;
    }, [config]);

    const materialProps = useMemo(() => {
        const base = { color: '#ffffff', envMapIntensity: 1.5 };
        switch(config.topFinish) {
            case 'metal': return { ...base, metalness: 1.0, roughness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.1 };
            case 'matte': return { ...base, metalness: 0.1, roughness: 0.9, clearcoat: 0.0 };
            case 'satin': return { ...base, metalness: 0.4, roughness: 0.3, clearcoat: 0.4 };
            case 'glossy': default: return { ...base, metalness: 0.1, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.02 };
        }
    }, [config.topFinish]);

    const edgeMaterialProps = useMemo(() => {
        switch(config.edgeMaterial) {
            case 'gold': return { color: '#FFD700', metalness: 1.0, roughness: 0.1 };
            case 'black': return { color: '#111111', metalness: 0.5, roughness: 0.4 };
            case 'steel': default: return { color: '#E5E7EB', metalness: 0.9, roughness: 0.1 };
        }
    }, [config.edgeMaterial]);

    // --- Texture Components (Split to avoid Hook errors) ---
    const SnowTexture = () => {
         const [colorMap, normalMap, roughnessMap] = useTexture([
            '/textures/snow_color.jpg',
            '/textures/snow_normal.jpg',
            '/textures/snow_rough.jpg'
         ]);
         
         useMemo(() => {
             [colorMap, normalMap, roughnessMap].forEach(t => {
                 t.wrapS = t.wrapT = THREE.RepeatWrapping;
                 t.repeat.set(4, 16); 
             });
         }, [colorMap, normalMap, roughnessMap]);

         return (
            <>
                <primitive attach="map" object={colorMap} />
                <primitive attach="normalMap" object={normalMap} />
                <primitive attach="roughnessMap" object={roughnessMap} />
            </>
         );
    };

    const ImageTexture = ({ id }: { id: string }) => {
        const tex = useTexture(`/textures/${id}`);
        useMemo(() => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(4, 16);
        }, [tex]);
        return <primitive attach="map" object={tex} />;
    };

    const CanvasTexture = () => (
        <canvasTexture ref={textureRef} attach="map" args={[canvasRef.current]} anisotropy={16} />
    );

    return (
        <group ref={meshRef}>
            <mesh geometry={edgeGeometry} castShadow receiveShadow>
                <meshStandardMaterial {...edgeMaterialProps} />
            </mesh>
            <mesh geometry={coreGeometry} castShadow receiveShadow>
                <meshStandardMaterial attach="material-1" color={config.sidewallColor} roughness={0.5} />
                <meshPhysicalMaterial attach="material-0" {...materialProps}>
                    {!config.textureId ? (
                        <CanvasTexture />
                    ) : config.textureId.includes('snow') ? (
                        <SnowTexture />
                    ) : (
                        <ImageTexture id={config.textureId} />
                    )}
                </meshPhysicalMaterial>
            </mesh>
            
            {/* Luxury Branding - Gold Foil Effect */}
            <Text
                position={[0, 0.16, 0.6]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.12}
                color={config.logoColor}
                font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2"
                anchorX="center"
                anchorY="middle"
                material-toneMapped={false}
            >
                FRONTIER PEAKS
            </Text>

            {/* Model Name */}
            {config.modelName && (
                <Text
                    position={[0, 0.16, -0.6]}
                    rotation={[-Math.PI / 2, 0, Math.PI]}
                    fontSize={0.06}
                    color={config.logoColor}
                    font="https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff2"
                    anchorX="center"
                    anchorY="middle"
                    letterSpacing={0.2}
                >
                    {config.modelName.toUpperCase()}
                </Text>
            )}

            <Bindings config={config} />
        </group>
    );
};