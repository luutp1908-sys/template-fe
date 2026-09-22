import type { Page } from '../types/editor'

const PAGE_ID_PATTERN = /^page_(\d+)$/

export const getNextObjectIdSeed = (pages: Page[]): number => {
  const maxObjectId = pages.reduce((currentMax, page) => {
    const pageMax = page.layers.reduce((layerMax, layer) => Math.max(layerMax, layer.id), 0)
    return Math.max(currentMax, pageMax)
  }, 0)

  return maxObjectId + 1
}

export const getNextPageIdSeed = (pages: Page[]): number => {
  const maxPageSequence = pages.reduce((currentMax, page) => {
    const match = page.id.match(PAGE_ID_PATTERN)
    if (!match) return currentMax

    const parsedSequence = Number.parseInt(match[1], 10)
    return Number.isFinite(parsedSequence) ? Math.max(currentMax, parsedSequence) : currentMax
  }, 0)

  return maxPageSequence + 1
}

export const createObjectIdGenerator = (initialSeed: number) => {
  let nextObjectId = initialSeed

  return () => {
    const id = nextObjectId
    nextObjectId += 1
    return id
  }
}

export const createPageIdGenerator = (initialSeed: number) => {
  let nextPageSequence = initialSeed

  return () => {
    const pageId = `page_${nextPageSequence}`
    nextPageSequence += 1
    return pageId
  }
}