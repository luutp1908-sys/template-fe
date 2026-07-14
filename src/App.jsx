import styled from 'styled-components'
import { useEditor } from './shared/hooks/useEditor'
import { MenuBar } from './widgets/MenuBar'
import { Sidebar } from './widgets/Sidebar'
import { Canvas } from './features/canvas/Canvas'

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f5f8fc;
`

const initialObjects = [
  {
    id: 1,
    type: 'rect',
    x: 200,
    y: 150,
    width: 180,
    height: 120,
    rotate: 0,
    color: '#0066cc',
  },
  {
    id: 2,
    type: 'text',
    x: 450,
    y: 200,
    width: 220,
    height: 60,
    rotate: 0,
    text: 'Your design',
    color: '#1a1a1a',
  },
]

function App() {
  const editor = useEditor(initialObjects)

  const handleAddShape = () => {
    editor.addObject('rect', {
      color: '#0066cc',
    })
  }

  const handleAddText = () => {
    editor.addObject('text', {
      text: 'New text',
      color: '#1a1a1a',
    })
  }

  const handleAddImage = () => {
    editor.addObject('image', {
      src: '',
    })
  }

  return (
    <AppContainer>
      <MenuBar
        activeTool={editor.activeTool}
        onToolSelect={editor.setActiveTool}
        onAddShape={handleAddShape}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
      />

      <Sidebar
        selectedObject={editor.selectedObject}
        objects={editor.objects}
        onSelectObject={editor.setSelectedId}
        onDeleteObject={editor.deleteObject}
      />

      <Canvas
        objects={editor.objects}
        selectedId={editor.selectedId}
        onSelectObject={editor.setSelectedId}
        onUpdateObject={editor.updateObject}
      />
    </AppContainer>
  )
}

export default App
