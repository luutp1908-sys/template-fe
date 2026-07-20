import {
  CanvasImage,
  CanvasImageContainer,
  ImageErrorPlaceholder,
  ImagePlaceholder,
  RetryButton,
} from './Canvas.styles'
import type { ImageLayer } from '../../shared/types/editor'
import type { ImageLifecycleHandlers } from './LayerRenderer.types'
import {
  DEFAULT_IMAGE_CORNER_RADIUS,
  DEFAULT_IMAGE_FIT_MODE,
  DEFAULT_IMAGE_OPACITY,
} from '../../shared/constants/editorGeometry'

type ImageLayerContentProps = {
  object: ImageLayer
} & ImageLifecycleHandlers

export const ImageLayerContent = ({
  object,
  imageLoadStates,
  imageRetryTokens,
  onImageLoad,
  onImageError,
  onImageRetry,
}: ImageLayerContentProps) => (
  <CanvasImageContainer
    data-testid={`canvas-image-container-${object.id}`}
    $opacity={object.opacity ?? DEFAULT_IMAGE_OPACITY}
    $cornerRadius={object.cornerRadius ?? DEFAULT_IMAGE_CORNER_RADIUS}
  >
    {!object.src ? (
      <ImagePlaceholder>No image selected</ImagePlaceholder>
    ) : (
      <>
        <CanvasImage
          key={`${object.id}-${imageRetryTokens[object.id] ?? 0}-${object.src}`}
          data-testid={`canvas-image-${object.id}`}
          src={object.src}
          alt="Canvas image"
          draggable={false}
          $fitMode={object.fitMode ?? DEFAULT_IMAGE_FIT_MODE}
          style={{ display: imageLoadStates[object.id] === 'loaded' ? 'block' : 'none' }}
          onLoad={() => onImageLoad(object.id)}
          onError={() => onImageError(object.id)}
        />

        {imageLoadStates[object.id] === 'error' ? (
          <ImageErrorPlaceholder>
            Failed to load image
            <RetryButton
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onImageRetry(object.id)
              }}
            >
              Retry
            </RetryButton>
          </ImageErrorPlaceholder>
        ) : imageLoadStates[object.id] !== 'loaded' ? (
          <ImagePlaceholder>Loading image...</ImagePlaceholder>
        ) : null}
      </>
    )}
  </CanvasImageContainer>
)