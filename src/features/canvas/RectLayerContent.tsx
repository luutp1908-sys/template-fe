import { ShapeBox } from './Canvas.styles'
import type { RectLayer } from '../../shared/types/editor'

type RectLayerContentProps = {
  object: RectLayer
}

export const RectLayerContent = ({ object }: RectLayerContentProps) => (
  <ShapeBox style={{ background: object.color ?? '#0066cc' }} />
)