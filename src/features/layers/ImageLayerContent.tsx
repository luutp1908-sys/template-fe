import type { ImageLayer } from '../../shared/types/editor'
import type { ImageLifecycleHandlers } from './LayerRenderer.types'
import { ImageElement, ImagePlaceholder } from '../canvas/Canvas.styles'

type ImageLayerContentProps = {
  object: ImageLayer
} & ImageLifecycleHandlers

export const ImageLayerContent = ({ object, imageLoadStates, imageRetryTokens, onImageLoad, onImageError, onImageRetry }: ImageLayerContentProps) => {
  const id = object.id
  const isLoading = imageLoadStates[id] === 'loading'
  const url = object.imageConfig?.url || ''

  return (
    <>
      {isLoading && <ImagePlaceholder>Loading…</ImagePlaceholder>}
      <ImageElement src={url} alt="" onLoad={() => onImageLoad(id)} onError={() => onImageError(id)} data-retry-token={imageRetryTokens[id] ?? 0} />
    </>
  )
}

export default ImageLayerContent
