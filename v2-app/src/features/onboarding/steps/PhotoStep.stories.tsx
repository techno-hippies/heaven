import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { PhotoStep, type PhotoStepData, photoStepMeta } from './PhotoStep'
import { StepHeader } from '../components/StepHeader'

const meta = {
  title: 'Features/Onboarding/Steps/PhotoStep',
  component: PhotoStep,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof PhotoStep>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
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

export const WithPhoto: Story = {
  render: () => {
    const [data, setData] = createSignal<PhotoStepData>({
      originalPhotoUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=alice&backgroundColor=ffdfbf',
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

export const WithMichelangeloStyle: Story = {
  render: () => {
    const [data, setData] = createSignal<PhotoStepData>({
      originalPhotoUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=alice&backgroundColor=ffdfbf',
      processedPhotoUrl: 'https://api.dicebear.com/9.x/bottts/svg?seed=michelangelo&backgroundColor=gray',
      selectedStyle: 'michelangelo',
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

export const WithRubensStyle: Story = {
  render: () => {
    const [data, setData] = createSignal<PhotoStepData>({
      originalPhotoUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=alice&backgroundColor=ffdfbf',
      processedPhotoUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=rubens&backgroundColor=red',
      selectedStyle: 'rubens',
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

export const WithDaVinciStyle: Story = {
  render: () => {
    const [data, setData] = createSignal<PhotoStepData>({
      originalPhotoUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=alice&backgroundColor=ffdfbf',
      processedPhotoUrl: 'https://api.dicebear.com/9.x/lorelei/svg?seed=davinci&backgroundColor=brown',
      selectedStyle: 'davinci',
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
