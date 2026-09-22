import type { Block, BlockConfig, EditorObject, Page, PageBackground, TemplateContent } from '../types/editor'

const DEFAULT_PAGE_ID = 'page_1'
const DEFAULT_PAGE_WIDTH = 1024
const DEFAULT_PAGE_HEIGHT = 768

type TemplateDimension = string | number | null | undefined

type BlockConfigInput = Partial<BlockConfig> & {
  width?: TemplateDimension
  height?: TemplateDimension
  backgroundImg?: string | null
}

export type BlockInput = Omit<Block, 'uuid' | 'config' | 'layers'> & {
  uuid?: string
  config?: BlockConfigInput
  layers?: Page['layers']
}

const parseDimension = (value: TemplateDimension, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/px$/, ''), 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return fallback
}

export const createDefaultPage = (overrides: Partial<Page> = {}): Page => ({
  id: overrides.id || DEFAULT_PAGE_ID,
  width: overrides.width || DEFAULT_PAGE_WIDTH,
  height: overrides.height || DEFAULT_PAGE_HEIGHT,
  background: overrides.background || { color: '#ffffff' },
  layers: overrides.layers || [],
})

export const createTemplateContentFromObjects = (objects: EditorObject[]): TemplateContent => ({
  pages: [createDefaultPage({ layers: objects })],
})

export const blockToPage = (block: BlockInput, fallbackId: string): Page => {
  const background: PageBackground = block.config?.backgroundImg
    ? { image: { src: block.config.backgroundImg } }
    : { color: '#ffffff' }

  return {
    id: block.uuid || fallbackId,
    width: parseDimension(block.config?.width, DEFAULT_PAGE_WIDTH),
    height: parseDimension(block.config?.height, DEFAULT_PAGE_HEIGHT),
    background,
    layers: block.layers || [],
  }
}

export const resolvePagesFromTemplateContent = (content: TemplateContent | null): Page[] => {
  if (content?.blocks?.length) {
    return content.blocks.map((block, index) => blockToPage(block, `page_${index + 1}`))
  }

  if (content?.pages?.length) {
    return content.pages
  }

  return [createDefaultPage()]
}
