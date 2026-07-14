import styled from 'styled-components'

const StyledMenuBar = styled.div`
  width: 80px;
  height: 100vh;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  overflow-y: auto;
`

const MenuItem = styled.button`
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

  ${(props) => props.active && `
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

export const MenuBar = ({ activeTool, onToolSelect, onAddShape, onAddText, onAddImage }) => {
  return (
    <StyledMenuBar>
      <MenuItem
        active={activeTool === 'element'}
        onClick={() => onToolSelect('element')}
        title="Elements"
      >
        ⬜
      </MenuItem>
      <MenuItem
        active={activeTool === 'text'}
        onClick={() => onToolSelect('text')}
        title="Text"
      >
        T
      </MenuItem>
      <MenuItem
        active={activeTool === 'image'}
        onClick={() => onToolSelect('image')}
        title="Image"
      >
        🖼️
      </MenuItem>
      <MenuDivider />
      <MenuItem onClick={onAddShape} title="Add Shape">
        ➕
      </MenuItem>
      <MenuItem onClick={onAddText} title="Add Text">
        📝
      </MenuItem>
      <MenuItem onClick={onAddImage} title="Add Image">
        📤
      </MenuItem>
    </StyledMenuBar>
  )
}
