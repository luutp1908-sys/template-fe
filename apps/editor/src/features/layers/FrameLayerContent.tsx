import type { FrameLayer } from '../../shared/types/editor'
import { FrameBox } from '../canvas/Canvas.styles'

type FrameLayerContentProps = {
  object: FrameLayer & { shape?: string }
}

export const FrameLayerContent = ({ object }: FrameLayerContentProps) => {
  const shape = (object as any).shape || 'rect'

  const renderShape = () => {
    if (shape === 'circle') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="50" cy="50" r="48" fill="#f3f4f6" strokeWidth="0" />
        </svg>
      )
    }
    if (shape === 'heart') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M50 86s-34-20-34-44c0-12 10-22 22-22 8 0 12 6 12 6s4-6 12-6c12 0 22 10 22 22 0 24-34 44-34 44z" fill="#fef2f2" stroke="none" />
        </svg>
      )
    }
    if (shape === 'phone') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="20" y="6" width="60" height="88" rx="8" fill="#f3f4f6" stroke="none" />
          <circle cx="50" cy="86" r="2" fill="#e5e7eb" />
        </svg>
      )
    }
    return <div style={{ width: '100%', height: '100%', background: '#f3f4f6' }} />
  }

  return (
    <FrameBox style={{ borderColor: object.borderColor || '#e5e7eb', borderWidth: object.borderWidth ?? 1 }}>
      {renderShape()}
    </FrameBox>
  )
}

export default FrameLayerContent
