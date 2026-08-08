import { useState } from 'react'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`

const Modal = styled.div`
  width: 480px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`

const Tab = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border: none;
  background: ${({ $active }) => ($active ? '#0066cc' : '#f5f8fc')};
  color: ${({ $active }) => ($active ? 'white' : '#1a1a1a')};
  border-radius: 6px;
  cursor: pointer;
`

const Field = styled.div`
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
`

const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
`

export type LoginPopupProps = {
  visible: boolean
  onClose: () => void
  onSignIn: (payload: { email: string; password: string }) => Promise<void>
  onSignUp: (payload: { email: string; password: string; displayName?: string }) => Promise<void>
  loading?: boolean
  error?: string | null
}

export const LoginPopup = ({ visible, onClose, onSignIn, onSignUp, loading, error }: LoginPopupProps) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  if (!visible) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (tab === 'signin') {
      await onSignIn({ email, password })
      onClose()
      return
    }

    await onSignUp({ email, password, displayName })
    onClose()
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(event) => event.stopPropagation()}>
        <Tabs>
          <Tab type="button" $active={tab === 'signin'} onClick={() => setTab('signin')}>
            Sign In
          </Tab>
          <Tab type="button" $active={tab === 'signup'} onClick={() => setTab('signup')}>
            Sign Up
          </Tab>
        </Tabs>

        <form onSubmit={handleSubmit}>
          <Field>
            <label>Email</label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </Field>

          <Field>
            <label>Password</label>
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </Field>

          {tab === 'signup' ? (
            <Field>
              <label>Display name</label>
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </Field>
          ) : null}

          {error ? <div style={{ color: 'red', marginTop: 6 }}>{error}</div> : null}

          <Actions>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={!!loading}>
              {tab === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </Actions>
        </form>
      </Modal>
    </Overlay>
  )
}

export default LoginPopup