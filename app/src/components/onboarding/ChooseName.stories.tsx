import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { ChooseName } from './ChooseName'
import type { InputState } from '@/components/ui/input'

const meta: Meta<typeof ChooseName> = {
  title: 'Onboarding/ChooseName',
  component: ChooseName,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ChooseName>

/** Empty state */
export const Empty: Story = {
  args: {
    name: '',
    nameStatus: 'idle',
    starName: '',
    starStatus: 'idle',
  },
}

/** Both names available */
export const BothAvailable: Story = {
  args: {
    name: 'aurora',
    nameStatus: 'valid',
    starName: 'aurora',
    starStatus: 'valid',
  },
}

/** Free name taken */
export const NameTaken: Story = {
  args: {
    name: 'alice',
    nameStatus: 'invalid',
    starName: '',
    starStatus: 'idle',
  },
}

/** Checking availability */
export const Checking: Story = {
  args: {
    name: 'aurora',
    nameStatus: 'checking',
    starName: 'aurora',
    starStatus: 'checking',
  },
}

/** Only free name filled */
export const FreeOnly: Story = {
  args: {
    name: 'aurora',
    nameStatus: 'valid',
    starName: '',
    starStatus: 'idle',
  },
}

/** Interactive demo */
export const Interactive: Story = {
  render: () => {
    const [name, setName] = createSignal('')
    const [nameStatus, setNameStatus] = createSignal<InputState>('idle')
    const [starName, setStarName] = createSignal('')
    const [starStatus, setStarStatus] = createSignal<InputState>('idle')

    const takenNames = ['alice', 'bob', 'admin', 'test']

    const checkName = (value: string, setStatus: (s: InputState) => void) => {
      if (value.length < 3) {
        setStatus('idle')
        return
      }
      setStatus('checking')
      setTimeout(() => {
        setStatus(takenNames.includes(value) ? 'invalid' : 'valid')
      }, 600)
    }

    return (
      <ChooseName
        name={name()}
        onNameChange={(v) => { setName(v); checkName(v, setNameStatus) }}
        nameStatus={nameStatus()}
        starName={starName()}
        onStarNameChange={(v) => { setStarName(v); checkName(v, setStarStatus) }}
        starStatus={starStatus()}
        starPrice="$12 USDC per year"
        onContinue={() => alert(`Free: ${name()}.neodate\nPremium: ${starName() || 'none'}.⭐`)}
      />
    )
  },
}

/** Mobile viewport */
export const Mobile: Story = {
  args: {
    name: 'aurora',
    nameStatus: 'valid',
    starName: 'aurora',
    starStatus: 'valid',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
