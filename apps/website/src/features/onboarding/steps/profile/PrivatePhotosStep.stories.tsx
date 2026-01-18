import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { PrivatePhotosStep, type PrivatePhotosStepData, privatePhotosStepMeta } from './PrivatePhotosStep'
import { StepHeader } from '../../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Profile/PrivatePhotosStep',
  component: PrivatePhotosStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PrivatePhotosStep>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [data, setData] = createSignal<PrivatePhotosStepData>({})
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={privatePhotosStepMeta.title} subtitle={privatePhotosStepMeta.subtitle} />
          <PrivatePhotosStep
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

export const WithPhotos: Story = {
  render: () => {
    const [data, setData] = createSignal<PrivatePhotosStepData>({
      privatePhotos: [
        'https://api.dicebear.com/9.x/avataaars/svg?seed=photo1',
        'https://api.dicebear.com/9.x/avataaars/svg?seed=photo2',
        'https://api.dicebear.com/9.x/avataaars/svg?seed=photo3',
      ],
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={privatePhotosStepMeta.title} subtitle={privatePhotosStepMeta.subtitle} />
          <PrivatePhotosStep
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

export const MaxPhotos: Story = {
  render: () => {
    const [data, setData] = createSignal<PrivatePhotosStepData>({
      privatePhotos: [
        'https://api.dicebear.com/9.x/avataaars/svg?seed=photo1',
        'https://api.dicebear.com/9.x/avataaars/svg?seed=photo2',
        'https://api.dicebear.com/9.x/avataaars/svg?seed=photo3',
        'https://api.dicebear.com/9.x/avataaars/svg?seed=photo4',
        'https://api.dicebear.com/9.x/avataaars/svg?seed=photo5',
        'https://api.dicebear.com/9.x/avataaars/svg?seed=photo6',
      ],
    })
    return (
      <div class="w-full px-6 py-6">
        <div class="max-w-2xl mx-auto space-y-6">
          <StepHeader title={privatePhotosStepMeta.title} subtitle={privatePhotosStepMeta.subtitle} />
          <PrivatePhotosStep
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
