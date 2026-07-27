import styled from 'styled-components'
import { useState } from 'react'
import FrameBrowser from '../components/FrameBrowser'
import { MENU_BAR_WIDTH } from '../shared/constants/layout'
import type { ActiveTool } from '../shared/types/editor'

type MenuBarProps = {
  activeTool: ActiveTool
  isBackgroundPanelOpen?: boolean
  onToolSelect: (tool: Exclude<ActiveTool, null>) => void
  onAddShape: () => void
  onAddText: () => void
  onOpenImageStock: () => void
  onOpenBackgroundPanel: () => void
  onOpenAuth?: () => void
  user?: { email?: string; displayName?: string } | null
  onLogout?: () => void | Promise<void>
  onAddFrame?: (presetId: string) => void
}

const StyledMenuBar = styled.div`
  width: ${MENU_BAR_WIDTH}px;
  height: 100%;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  overflow-y: auto;
`

const MenuItem = styled.button<{ $active?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  background: #f5f8fc;
  color: #666;

  &:hover {
    background: #e3f0ff;
    color: #0066cc;
  }

  ${({ $active }) => $active && `
    background: #0066cc;
    color: white;
  `}
`

const MenuDivider = styled.div`
  width: 40px;
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
`

export const MenuBar = ({
  activeTool,
  isBackgroundPanelOpen = false,
  onToolSelect,
  onAddShape,
  onAddText,
  onOpenImageStock,
  onOpenBackgroundPanel,
  onOpenAuth,
  user,
  onLogout,
  onAddFrame,
}: MenuBarProps) => {
  const [frameBrowserOpen, setFrameBrowserOpen] = useState(false)

  const handleSelectFrame = (presetId: string) => {
    setFrameBrowserOpen(false)
    if (onAddFrame) onAddFrame(presetId)
  }
  return (
    <>
    <StyledMenuBar>
      <MenuItem
        $active={activeTool === 'element'}
        onClick={() => onToolSelect('element')}
        title="Elements"
      >
        ⬜
      </MenuItem>
      <MenuItem
        $active={activeTool === 'text'}
        onClick={() => onToolSelect('text')}
        title="Text"
      >
        T
      </MenuItem>
      <MenuItem
        $active={activeTool === 'image'}
        onClick={() => onToolSelect('image')}
        title="Image"
      >
        🖼️
      </MenuItem>
      <MenuItem
        $active={activeTool === 'frame'}
        onClick={() => {
          onToolSelect('frame')
          setFrameBrowserOpen(true)
        }}
        title="Frames"
      >
        ❐
      </MenuItem>
      <MenuItem
        $active={isBackgroundPanelOpen}
        onClick={onOpenBackgroundPanel}
        title="Background"
      >
        🎨
      </MenuItem>
      <MenuDivider />
      <MenuItem onClick={onAddShape} title="Add Shape">
        ➕
      </MenuItem>
      <MenuItem onClick={onAddText} title="Add Text">
        📝
      </MenuItem>
      <MenuItem onClick={onOpenImageStock} title="Add Image">
        📤
      </MenuItem>
      <MenuDivider />
      {user ? (
        <>
          <div style={{ padding: '8px 12px', color: '#1a1a1a' }}>{user.displayName || user.email}</div>
          <MenuItem onClick={onLogout} title="Logout">⎋</MenuItem>
        </>
      ) : (
        <MenuItem onClick={onOpenAuth} title="Sign In">🔐</MenuItem>
      )}
    </StyledMenuBar>
    <FrameBrowser visible={frameBrowserOpen} onClose={() => setFrameBrowserOpen(false)} onSelect={handleSelectFrame} />
    </>
  )
}
