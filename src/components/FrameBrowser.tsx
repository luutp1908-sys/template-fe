import React from 'react'
import styled from 'styled-components'
import FRAME_PRESETS from '../data/framePresets'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  width: 480px;
  max-width: calc(100% - 32px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
`

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`

const PresetItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
`

type Props = {
  visible: boolean
  onClose: () => void
  onSelect: (presetId: string) => void
}

export const FrameBrowser = ({ visible, onClose, onSelect }: Props) => {
  if (!visible) return null

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <h3>Select a Frame</h3>
        <PresetGrid>
          {FRAME_PRESETS.map((p) => (
            <PresetItem key={p.id} onClick={() => onSelect(p.id)} title={p.name}>
              <div style={{ width: 60, height: 60, background: '#f3f4f6', borderRadius: p.shape === 'circle' ? '50%' : 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.shape === 'phone' ? '📱' : p.shape === 'heart' ? '♥' : '▭'}
              </div>
              <div style={{ fontSize: 12 }}>{p.name}</div>
            </PresetItem>
          ))}
        </PresetGrid>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}>Close</button>
        </div>
      </Modal>
    </Backdrop>
  )
}

export default FrameBrowser
