import React from 'react';

export interface SkiConfig {
    type: 'ski' | 'snowboard';
    length: number; // cm
    tipWidth: number; // mm
    waistWidth: number; // mm
    tailWidth: number; // mm
    camberProfile: 'camber' | 'rocker' | 'hybrid';
    
    // Geometry Details
    tailShape: 'flat' | 'twin' | 'partial';
    tipShape: 'rounded' | 'blunt' | 'pointed';
    
    // Aesthetics
    topColor: string;
    sidewallColor: string;
    logoColor: string;
    bindingColor: string;
    bindingMaterial: 'plastic' | 'aluminum' | 'carbon';
    strapColor: string;
    strapTexture: 'rubber' | 'fabric' | 'leather';
    text: string;
    textPosition: 'tip' | 'waist' | 'tail';
    fontStyle: 'bold' | 'outline' | 'stencil' | 'handwritten' | 'retro';
    
    // Construction
    woodCore: 'paulownia' | 'maple' | 'poplar';
    edgeMaterial: 'steel' | 'black' | 'gold';
    
    // New Material System
    topFinish: 'glossy' | 'matte' | 'satin' | 'metal';
    topPattern: 'solid' | 'carbon' | 'wood' | 'geometric' | 'camo' | 'splatter' | 'linear-fade' | 'topo-map';
}

export const INITIAL_CONFIG: SkiConfig = {
    type: 'ski',
    length: 184,
    tipWidth: 138,
    waistWidth: 108,
    tailWidth: 128,
    camberProfile: 'hybrid',
    tailShape: 'partial',
    tipShape: 'rounded',
    topColor: '#ffffff',
    sidewallColor: '#3b82f6', // Classic Electric Blue
    logoColor: '#0f172a',
    bindingColor: '#1e293b',
    bindingMaterial: 'plastic',
    strapColor: '#0f172a',
    strapTexture: 'fabric',
    text: 'SEARL ONE',
    textPosition: 'tail',
    fontStyle: 'bold',
    woodCore: 'maple',
    edgeMaterial: 'steel',
    topFinish: 'glossy',
    topPattern: 'solid'
};

// Global type augmentation for React Three Fiber intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      mesh: any;
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      planeGeometry: any;
      boxGeometry: any;
      cylinderGeometry: any;
      canvasTexture: any;
      primitive: any;
      // Catch-all for other elements
      [elemName: string]: any;
    }
  }
}

// Augmentation for React module to ensure JSX types are picked up correctly in all environments
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            ambientLight: any;
            pointLight: any;
            spotLight: any;
            group: any;
            mesh: any;
            meshStandardMaterial: any;
            meshPhysicalMaterial: any;
            planeGeometry: any;
            boxGeometry: any;
            cylinderGeometry: any;
            canvasTexture: any;
            primitive: any;
            [elemName: string]: any;
        }
    }
}