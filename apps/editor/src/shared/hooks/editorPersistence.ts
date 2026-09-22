import type { EditorObject, ImageLayer, Page } from '../types/editor'

export type PersistedEditorContent = {
  pages: Page[]
}

const toPersistedLayer = (layer: EditorObject): EditorObject => {
  if (layer.type !== 'image' || !layer.imageConfig) {
    return layer
  }

  const persistedImageLayer: ImageLayer = {
    ...layer,
    imageConfig: {
      ...layer.imageConfig,
      // Runtime-only loading state should not be persisted.
      isLoading: false,
    },
  }

  return persistedImageLayer
}

export const toPersistedEditorContent = (pages: Page[]): PersistedEditorContent => ({
  pages: pages.map((page) => ({
    ...page,
    layers: page.layers.map((layer) => toPersistedLayer(layer)),
  })),
})
