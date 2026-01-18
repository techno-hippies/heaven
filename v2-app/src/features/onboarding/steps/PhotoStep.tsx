import type { Component } from 'solid-js'
import { createSignal, Show, For } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { Icon } from '@/icons'
import { IconButton } from '@/ui/icon-button'
import { Spinner } from '@/ui/spinner'
import { cn } from '@/lib/utils'
import { processImageWithFalAI, type ArtistStyle } from '../hooks/useFalAI'

export interface PhotoStepData {
  originalPhotoUrl?: string
  processedPhotoUrl?: string
  selectedStyle?: ArtistStyle
}

const ARTIST_STYLES = [
  { id: 'michelangelo' as const, name: 'Michelangelo' },
  { id: 'rubens' as const, name: 'Rubens' },
  { id: 'davinci' as const, name: 'Da Vinci' },
]

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error'

export const PhotoStep: Component<StepComponentProps<PhotoStepData>> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false)
  const [processingState, setProcessingState] = createSignal<ProcessingState>('idle')
  const [showOriginal, setShowOriginal] = createSignal(false)

  const handleFileSelect = async (file: File) => {
    setProcessingState('uploading')

    // Create object URL for immediate preview
    const url = URL.createObjectURL(file)
    props.onChange({
      originalPhotoUrl: url,
      processedPhotoUrl: undefined,
      selectedStyle: undefined,
    })

    setProcessingState('idle')
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }

  const applyArtistStyle = async (style: ArtistStyle) => {
    if (!props.data.originalPhotoUrl) return

    setProcessingState('processing')

    try {
      const result = await processImageWithFalAI({
        imageUrl: props.data.originalPhotoUrl,
        style,
      })

      props.onChange({
        ...props.data,
        processedPhotoUrl: result.url,
        selectedStyle: style,
      })

      setProcessingState('complete')
    } catch (error) {
      console.error('Failed to process image:', error)
      setProcessingState('error')
    }
  }

  const resetPhoto = () => {
    props.onChange({})
    setProcessingState('idle')
    setShowOriginal(false)
  }

  const hasPhoto = () => !!props.data.originalPhotoUrl
  const hasProcessed = () => !!props.data.processedPhotoUrl
  const isProcessing = () => processingState() === 'processing'

  const currentPhotoUrl = () => {
    if (showOriginal() || !hasProcessed()) {
      return props.data.originalPhotoUrl
    }
    return props.data.processedPhotoUrl
  }

  return (
    <div class="space-y-8">
      {/* Photo upload/display area */}
      <div class="space-y-6">
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
                  Drag and drop a photo<br />or click to upload
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
            {/* Photo display */}
            <img
              src={currentPhotoUrl()}
              alt="Avatar"
              class="w-full h-full object-cover"
            />

            {/* Processing overlay */}
            <Show when={isProcessing()}>
              <div class="absolute inset-0 bg-background/80 backdrop-blur flex flex-col items-center justify-center gap-3">
                <Spinner size="xl" />
                <p class="text-sm font-medium text-foreground">
                  Processing...
                </p>
              </div>
            </Show>

            {/* Remove button */}
            <IconButton
              icon="x"
              label="Remove photo"
              size="sm"
              onClick={resetPhoto}
              class="absolute top-4 right-4 bg-background/80 backdrop-blur hover:bg-background"
            />

            {/* Original/Processed toggle */}
            <Show when={hasProcessed()}>
              <button
                type="button"
                onClick={() => setShowOriginal(!showOriginal())}
                class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 backdrop-blur text-sm font-medium hover:bg-background transition-colors cursor-pointer"
              >
                {showOriginal() ? 'Show Styled' : 'Show Original'}
              </button>
            </Show>
          </Show>
        </div>

        {/* Artist style selector - always visible */}
        <div class="space-y-3">
          <div class="flex flex-col gap-2">
            <For each={ARTIST_STYLES}>
              {(style) => {
                const isSelected = () => props.data.selectedStyle === style.id
                const isDisabled = () => !hasPhoto() || isProcessing()

                return (
                  <button
                    type="button"
                    onClick={() => !isDisabled() && applyArtistStyle(style.id)}
                    disabled={isDisabled()}
                    class={cn(
                      'flex items-center gap-3 p-4 rounded-2xl text-left cursor-pointer',
                      'border transition-colors',
                      isDisabled() && 'opacity-50 cursor-not-allowed',
                      isSelected()
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    {/* Radio dot */}
                    <div
                      class={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        isSelected()
                          ? 'border-primary'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      <Show when={isSelected()}>
                        <div class="w-2.5 h-2.5 rounded-full bg-primary" />
                      </Show>
                    </div>

                    {/* Style name */}
                    <span class="flex-1 font-medium text-foreground">{style.name}</span>
                  </button>
                )
              }}
            </For>
          </div>
        </div>

        {/* Error message */}
        <Show when={processingState() === 'error'}>
          <p class="text-sm text-destructive text-center">
            Failed to process image. Please try again.
          </p>
        </Show>
      </div>
    </div>
  )
}

export const photoStepMeta: StepMetadata = {
  id: 'photo',
  title: 'Create avatar',
  subtitle: 'Your image will be restyled to protect you against deepfakes and AI. You can upload more photos later that are only shared with matches.',
  required: true,
  validate: (data) => {
    const stepData = data as unknown as PhotoStepData
    // Only stylized photos allowed for privacy
    return !!stepData?.processedPhotoUrl
  },
}
