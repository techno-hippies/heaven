import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { PhotoStep, type PhotoStepData, photoStepMeta } from './PhotoStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/PhotoStep',
  component: PhotoStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PhotoStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<PhotoStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={photoStepMeta.title} subtitle={photoStepMeta.subtitle} />
          <PhotoStep
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

export const WithAvatar: Story = {
  render: () => {
    const [data, setData] = createSignal<PhotoStepData>({
      avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=alice&backgroundColor=ffdfbf',
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={photoStepMeta.title} subtitle={photoStepMeta.subtitle} />
          <PhotoStep
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
