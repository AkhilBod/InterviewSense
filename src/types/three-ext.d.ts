/* eslint-disable @typescript-eslint/no-empty-interface */

import type { Object3DNode } from '@react-three/fiber'
import type { MeshLineGeometry, MeshLineMaterial } from 'meshline'

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>
    meshLineMaterial: Object3DNode<MeshLineMaterial, typeof MeshLineMaterial>
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any
      meshLineMaterial: any
    }
  }
}

declare module '*.glb' {
  const src: string
  export default src
}

declare module 'meshline' {
  export const MeshLineGeometry: any
  export const MeshLineMaterial: any
}
