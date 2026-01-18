import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { KidsAboutMeStep, type KidsAboutMeStepData, kidsAboutMeStepMeta } from './KidsAboutMeStep'
import { KidsPrefStep, type KidsPrefStepData, kidsPrefStepMeta } from './KidsPrefStep'
import { StepHeader } from '../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Steps/KidsStep',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Step 1: About Me - "Do you have children?" + Visibility */
export const Step1_AboutMe: Story = {
  name: '1. About Me',
  render: () => {
    const [data, setData] = createSignal<KidsAboutMeStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={kidsAboutMeStepMeta.title} />
          <KidsAboutMeStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  },
}

/** Step 2: Preferences - "Do you want children?" + Strict filter */
export const Step2_Preferences: Story = {
  name: '2. Preferences',
  render: () => {
    const [data, setData] = createSignal<KidsPrefStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={kidsPrefStepMeta.title} subtitle={kidsPrefStepMeta.subtitle} />
          <KidsPrefStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  },
}

/** Step 1 with selection */
export const Step1_AboutMe_Selected: Story = {
  name: '1. About Me (Selected)',
  render: () => {
    const [data, setData] = createSignal<KidsAboutMeStepData>({
      kidsStatus: '1',
      kidsVisibility: 'match',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={kidsAboutMeStepMeta.title} />
          <KidsAboutMeStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  },
}

/** Step 2 with strict filter enabled */
export const Step2_Preferences_Strict: Story = {
  name: '2. Preferences (Strict)',
  render: () => {
    const [data, setData] = createSignal<KidsPrefStepData>({
      kidsPreferences: ['2'],
      kidsStrict: true,
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={kidsPrefStepMeta.title} subtitle={kidsPrefStepMeta.subtitle} />
          <KidsPrefStep
            data={data()}
            onChange={(updates) => setData({ ...data(), ...updates })}
          />
          <div class="mt-8 p-4 bg-muted rounded-lg">
            <p class="text-xs text-muted-foreground">State:</p>
            <pre class="text-xs">{JSON.stringify(data(), null, 2)}</pre>
          </div>
        </div>
      </div>
    )
  },
}
