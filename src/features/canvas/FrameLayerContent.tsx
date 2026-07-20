import { ShapeBox } from './Canvas.styles'
import type { FrameLayer } from '../../shared/types/editor'

type FrameLayerContentProps = {
  object: FrameLayer
}

export const FrameLayerContent = ({ object }: FrameLayerContentProps) => (
  <ShapeBox
    style={{
      background: 'transparent',
      borderStyle: 'solid',
      borderWidth: `${object.borderWidth ?? 1}px`,
      borderColor: object.borderColor ?? '#e5e7eb',
    }}
  />
)