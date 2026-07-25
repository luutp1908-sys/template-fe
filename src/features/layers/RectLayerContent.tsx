import { RectBlock } from '../canvas/Canvas.styles'
import type { RectLayer } from '../../shared/types/editor'

type RectLayerContentProps = {
  object: RectLayer
}

export const RectLayerContent = ({ object }: RectLayerContentProps) => {
  return <RectBlock style={{ background: object.color || '#000000' }} />
}

export default RectLayerContent
