import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal, createEffect } from 'solid-js'
import { ChooseName } from './ChooseName'
import { type InputState } from '@/components/ui/input'
import { DEFAULT_TLDS } from '@/components/ui/tld-select'

const meta: Meta<typeof ChooseName> = {
  title: 'Onboarding/ChooseName',
  component: ChooseName,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ChooseName>

// Simulated taken names per TLD
const TAKEN_NAMES: Record<string, string[]> = {
  neodate: ['alice', 'bob', 'admin', 'test', 'genesis'],
  star: ['alice', 'admin'],
  spiral: ['bob'],
}

/**
 * Default state - user picks a name and TLD
 */
export const Default: Story = {
  name: 'Default',
  render: () => {
    const [name, setName] = createSignal('')
    const [tld, setTld] = createSignal('neodate')
    const [status, setStatus] = createSignal<InputState>('idle')

    // Check availability when name or TLD changes
    createEffect(() => {
      const currentName = name()
      const currentTld = tld()

      if (currentName.length < 3) {
        setStatus('idle')
        return
      }

      setStatus('checking')

      // Simulate API call
      setTimeout(() => {
        const taken = TAKEN_NAMES[currentTld] ?? []
        setStatus(taken.includes(currentName) ? 'invalid' : 'valid')
      }, 500)
    })

    return (
      <ChooseName
        name={name()}
        onNameChange={setName}
        selectedTld={tld()}
        onTldChange={setTld}
        status={status()}
        step={3}
        totalSteps={10}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Registered: ${name()}.${tld()}`)}
      />
    )
  },
}

/**
 * Name available on free TLD
 */
export const AvailableFree: Story = {
  name: 'Available (Free TLD)',
  render: () => {
    const [name, setName] = createSignal('myname')
    const [tld, setTld] = createSignal('neodate')
    const [status, setStatus] = createSignal<InputState>('valid')

    createEffect(() => {
      const currentName = name()
      const currentTld = tld()

      if (currentName.length < 3) {
        setStatus('idle')
        return
      }

      setStatus('checking')
      setTimeout(() => {
        const taken = TAKEN_NAMES[currentTld] ?? []
        setStatus(taken.includes(currentName) ? 'invalid' : 'valid')
      }, 500)
    })

    return (
      <ChooseName
        name={name()}
        onNameChange={setName}
        selectedTld={tld()}
        onTldChange={setTld}
        status={status()}
        step={3}
        totalSteps={10}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Registered: ${name()}.${tld()}`)}
      />
    )
  },
}

/**
 * Name taken - shows invalid state
 */
export const NameTaken: Story = {
  name: 'Name Taken',
  render: () => {
    const [name, setName] = createSignal('alice')
    const [tld, setTld] = createSignal('neodate')
    const [status, setStatus] = createSignal<InputState>('invalid')

    createEffect(() => {
      const currentName = name()
      const currentTld = tld()

      if (currentName.length < 3) {
        setStatus('idle')
        return
      }

      setStatus('checking')
      setTimeout(() => {
        const taken = TAKEN_NAMES[currentTld] ?? []
        setStatus(taken.includes(currentName) ? 'invalid' : 'valid')
      }, 500)
    })

    return (
      <ChooseName
        name={name()}
        onNameChange={setName}
        selectedTld={tld()}
        onTldChange={setTld}
        status={status()}
        step={3}
        totalSteps={10}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Registered: ${name()}.${tld()}`)}
      />
    )
  },
}

/**
 * Checking availability - loading state
 */
export const Checking: Story = {
  name: 'Checking Availability',
  render: () => {
    return (
      <ChooseName
        name="myname"
        onNameChange={() => {}}
        selectedTld="star"
        onTldChange={() => {}}
        status="checking"
        step={3}
        totalSteps={10}
        onBack={() => alert('Back!')}
        onContinue={() => {}}
      />
    )
  },
}

/**
 * Premium TLD selected (star emoji)
 */
export const PremiumTldSelected: Story = {
  name: 'Premium TLD (Star)',
  render: () => {
    const [name, setName] = createSignal('genesis')
    const [tld, setTld] = createSignal('star')
    const [status, setStatus] = createSignal<InputState>('valid')

    createEffect(() => {
      const currentName = name()
      const currentTld = tld()

      if (currentName.length < 3) {
        setStatus('idle')
        return
      }

      setStatus('checking')
      setTimeout(() => {
        const taken = TAKEN_NAMES[currentTld] ?? []
        setStatus(taken.includes(currentName) ? 'invalid' : 'valid')
      }, 500)
    })

    return (
      <ChooseName
        name={name()}
        onNameChange={setName}
        selectedTld={tld()}
        onTldChange={setTld}
        status={status()}
        step={3}
        totalSteps={10}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Registered: ${name()}.${tld()} - Premium!`)}
      />
    )
  },
}

/**
 * Spiral TLD selected
 */
export const SpiralTld: Story = {
  name: 'Spiral TLD',
  render: () => {
    const [name, setName] = createSignal('cosmic')
    const [tld, setTld] = createSignal('spiral')
    const [status, setStatus] = createSignal<InputState>('valid')

    createEffect(() => {
      const currentName = name()
      const currentTld = tld()

      if (currentName.length < 3) {
        setStatus('idle')
        return
      }

      setStatus('checking')
      setTimeout(() => {
        const taken = TAKEN_NAMES[currentTld] ?? []
        setStatus(taken.includes(currentName) ? 'invalid' : 'valid')
      }, 500)
    })

    return (
      <ChooseName
        name={name()}
        onNameChange={setName}
        selectedTld={tld()}
        onTldChange={setTld}
        status={status()}
        step={3}
        totalSteps={10}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Registered: ${name()}.${tld()}`)}
      />
    )
  },
}

/**
 * Empty state - no name entered yet
 */
export const Empty: Story = {
  name: 'Empty State',
  render: () => {
    const [name, setName] = createSignal('')
    const [tld, setTld] = createSignal('neodate')

    return (
      <ChooseName
        name={name()}
        onNameChange={setName}
        selectedTld={tld()}
        onTldChange={setTld}
        status="idle"
        step={3}
        totalSteps={10}
        onBack={() => alert('Back!')}
        onContinue={() => {}}
      />
    )
  },
}
