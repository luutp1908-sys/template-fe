import type { FrameShape } from '../shared/types/editor'

export type FramePreset = {
  id: string
  name: string
  width: number
  height: number
  shape: FrameShape
}

export const FRAME_PRESETS: FramePreset[] = [
  { id: 'rect_small', name: 'Rectangle', width: 200, height: 150, shape: 'rect' },
  { id: 'circle', name: 'Circle', width: 180, height: 180, shape: 'circle' },
  { id: 'heart', name: 'Heart', width: 220, height: 200, shape: 'heart' },
  { id: 'phone', name: 'Phone Mock', width: 160, height: 320, shape: 'phone' },
]

export default FRAME_PRESETS
