import type { FrameLayer } from '../../shared/types/editor'
import { FrameBox } from '../canvas/Canvas.styles'

type FrameLayerContentProps = {
  object: FrameLayer
}

export const FrameLayerContent = ({ object }: FrameLayerContentProps) => {
  return <FrameBox style={{ borderColor: object.borderColor || '#e5e7eb', borderWidth: object.borderWidth ?? 1 }} />
}

export default FrameLayerContent
