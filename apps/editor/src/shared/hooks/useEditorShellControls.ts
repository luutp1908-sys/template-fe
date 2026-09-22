import { useState } from 'react'
import FRAME_PRESETS from '../../data/framePresets'
import {
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_FONT_SIZE,
  DEFAULT_TEXT_HEIGHT,
  DEFAULT_TEXT_WIDTH,
} from '../constants/editorGeometry'
import type { EditorObject, PageBackground } from '../types/editor'

export type SidebarPanel = 'none' | 'image' | 'background' | 'layers' | 'frames'

type EditorShellState = {
  activeTool: 'element' | 'text' | 'image' | 'frame' | null
  currentPageBackground?: PageBackground
  setActiveTool: (tool: 'element' | 'text' | 'image' | 'frame' | null) => void
  setPageBackground: (bg: PageBackground) => void
  addObject: (type: 'rect' | 'text' | 'image' | 'frame', defaults?: Partial<EditorObject>) => EditorObject
  addFrameLayer?: (opts: { width?: number; height?: number; shape?: string; x?: number; y?: number }) => EditorObject
}

export const useEditorShellControls = (editor: EditorShellState) => {
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>('none')

  const handleAddShape = () => {
    editor.addObject('rect', {
      color: '#0066cc',
    })
  }

  const handleAddText = () => {
    editor.addObject('text', {
      text: 'New text',
      textColor: DEFAULT_TEXT_COLOR,
      textConfig: {
        value: 'New text',
        type: 'text-box',
        width: `${DEFAULT_TEXT_WIDTH}px`,
        height: `${DEFAULT_TEXT_HEIGHT}px`,
        translate: [0, 0],
        rotate: 0,
        fontFamily: 'Arial, sans-serif',
        fontSize: `${DEFAULT_TEXT_FONT_SIZE}px`,
        fontColor: DEFAULT_TEXT_COLOR,
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: '0px',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isCapital: false,
        presentationType: 'body',
        colorPaletteType: null,
        externalFontUrl: null,
        isLogoQrCode: false,
      },
    })
    setSidebarPanel('none')
  }

  const handleAddImageFromStock = (src: string) => {
    editor.addObject('image', {
      imageConfig: {
        size: { width: DEFAULT_IMAGE_WIDTH, height: DEFAULT_IMAGE_HEIGHT },
        width: DEFAULT_IMAGE_WIDTH,
        height: DEFAULT_IMAGE_HEIGHT,
        translate: [0, 0],
        rotate: 0,
        url: src,
        tagNames: [],
        colorConfig: {},
        cropImage: { width: DEFAULT_IMAGE_WIDTH, height: DEFAULT_IMAGE_HEIGHT, translate: [0, 0] },
        scaleX: 1,
        scaleY: 1,
        replaced: false,
        isPro: false,
        isLoading: false,
        isLocked: false,
      },
    })
    setSidebarPanel('none')
  }

  const handleSetBackgroundColor = (color: string) => {
    editor.setPageBackground({ color })
  }

  const handleSetBackgroundImage = (src: string) => {
    editor.setPageBackground({ image: { src, fit: 'cover' } })
  }

  const handleToolSelect = (tool: 'element' | 'text' | 'image' | 'frame') => {
    editor.setActiveTool(tool)
    if (tool === 'image') {
      setSidebarPanel('image')
      return
    }
    if (tool === 'frame') {
      setSidebarPanel('frames')
      return
    }
    setSidebarPanel('none')
  }

  const handleAddFrame = (presetId: string) => {
    const preset = FRAME_PRESETS.find((item) => item.id === presetId)
    if (!preset) return

    if (typeof editor.addFrameLayer === 'function') {
      editor.addFrameLayer({ width: preset.width, height: preset.height, shape: preset.shape })
    } else {
      editor.addObject('frame', {
        width: preset.width,
        height: preset.height,
        shape: preset.shape,
      } as Partial<EditorObject>)
    }
    setSidebarPanel('none')
  }

  const handleOpenImageStock = () => {
    editor.setActiveTool('image')
    setSidebarPanel('image')
  }

  const handleOpenBackgroundPanel = () => {
    setSidebarPanel('background')
  }

  return {
    handleAddFrame,
    handleAddImageFromStock,
    handleAddShape,
    handleAddText,
    handleOpenBackgroundPanel,
    handleOpenImageStock,
    handleSetBackgroundColor,
    handleSetBackgroundImage,
    handleToolSelect,
    sidebarPanel,
  }
}

export default useEditorShellControls