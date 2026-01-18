import type { Component } from 'solid-js'
import { createSignal, Show } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { Icon } from '@/icons'
import { IconButton } from '@/ui/icon-button'

export interface PhotoStepData {
  avatarUrl?: string
}

export const PhotoStep: Component<StepComponentProps<PhotoStepData>> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false)

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file)
    props.onChange({ avatarUrl: url })
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }

  const resetPhoto = () => {
    props.onChange({})
  }

  const hasPhoto = () => !!props.data.avatarUrl

  return (
    <div class="space-y-6">
      {/* Avatar upload area */}
      <div
        class="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-border bg-muted/30 transition-colors"
        classList={{
          'border-primary bg-primary/5': isDragging(),
          'border-solid': hasPhoto(),
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Show
          when={hasPhoto()}
          fallback={
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
              <Icon name="camera" class="text-6xl text-muted-foreground" />
              <p class="text-center text-muted-foreground">
                Drag and drop an image<br />or click to upload
              </p>
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>
          }
        >
          <img
            src={props.data.avatarUrl}
            alt="Avatar"
            class="w-full h-full object-cover"
          />

          <IconButton
            icon="x"
            label="Remove photo"
            size="sm"
            onClick={resetPhoto}
            class="absolute top-4 right-4 bg-background/80 backdrop-blur hover:bg-background"
          />
        </Show>
      </div>

    </div>
  )
}

export const photoStepMeta: StepMetadata = {
  id: 'photo',
  title: 'Upload avatar',
  subtitle: [
    'Avatars are public, so realistic photos aren\'t allowed',
    'Upload a stylized, anime, or AI-generated image',
    'You can add realistic photos next which are only revealed on match',
  ],
  required: true,
  validate: (data) => {
    const stepData = data as unknown as PhotoStepData
    return !!stepData?.avatarUrl
  },
}
