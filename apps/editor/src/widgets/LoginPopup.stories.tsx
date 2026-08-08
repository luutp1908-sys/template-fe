import type { Meta, StoryObj } from '@storybook/react-vite'
import LoginPopup from './LoginPopup'

const meta = {
  title: 'Editor/Auth/LoginPopup',
  component: LoginPopup,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    visible: true,
    onClose: () => {},
    onSignIn: async () => {},
    onSignUp: async () => {},
    loading: false,
    error: null,
  },
} satisfies Meta<typeof LoginPopup>

export default meta

type Story = StoryObj<typeof meta>

export const SignInOpen: Story = {}

export const SignUpOpen: Story = {
  args: {
    visible: true,
  },
}

export const ErrorState: Story = {
  args: {
    error: 'Login failed. Please check your credentials.',
  },
}

export const LoadingState: Story = {
  args: {
    loading: true,
  },
}