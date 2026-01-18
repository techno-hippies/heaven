import type { Component } from 'solid-js'
import { createSignal, For } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../../types'
import { Icon } from '@/icons'
import { IconButton } from '@/ui/icon-button'
import { cn } from '@/lib/utils'

export interface PrivatePhotosStepData {
  privatePhotos?: (string | null)[]
}

const MIN_PHOTOS = 3
const MAX_PHOTOS = 6

export const PrivatePhotosStep: Component<StepComponentProps<PrivatePhotosStepData>> = (props) => {
  const [draggingIndex, setDraggingIndex] = createSignal<number | null>(null)

  // Always show at least MIN_PHOTOS slots, or more if photos exceed that
  const slots = () => {
    const currentPhotos = props.data.privatePhotos || []
    const filledCount = currentPhotos.filter(Boolean).length
    const slotCount = Math.max(MIN_PHOTOS, Math.min(filledCount + 1, MAX_PHOTOS))

    // Pad array to slot count
    const padded = [...currentPhotos]
    while (padded.length < slotCount) {
      padded.push(null)
    }
    return padded.slice(0, slotCount)
  }

  const handleFileSelect = (file: File, slotIndex: number) => {
    const url = URL.createObjectURL(file)
    const currentPhotos = [...(props.data.privatePhotos || [])]

    // Ensure array is long enough
    while (currentPhotos.length <= slotIndex) {
      currentPhotos.push(null)
    }
    currentPhotos[slotIndex] = url
    props.onChange({ privatePhotos: currentPhotos })
  }

  const handleDrop = (e: DragEvent, slotIndex: number) => {
    e.preventDefault()
    setDraggingIndex(null)
    const file = e.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file, slotIndex)
    }
  }

  const removePhoto = (index: number) => {
    const currentPhotos = [...(props.data.privatePhotos || [])]
    currentPhotos[index] = null
    // Compact: remove trailing nulls but keep at least MIN_PHOTOS worth
    const compacted = currentPhotos.filter(Boolean) as string[]
    props.onChange({ privatePhotos: compacted })
  }

  const filledCount = () => (props.data.privatePhotos || []).filter(Boolean).length

  return (
    <div class="space-y-6">
      {/* Photo grid - always show slots */}
      <div class="grid grid-cols-3 gap-3">
        <For each={slots()}>
          {(photo, index) => (
            <div
              class={cn(
                'relative aspect-square rounded-xl overflow-hidden',
                photo ? 'bg-muted' : 'border-2 border-dashed border-border bg-muted/30 cursor-pointer transition-colors',
                draggingIndex() === index() && 'border-primary bg-primary/5'
              )}
              onDragOver={(e) => { e.preventDefault(); if (!photo) setDraggingIndex(index()) }}
              onDragLeave={() => setDraggingIndex(null)}
              onDrop={(e) => !photo && handleDrop(e, index())}
            >
              {photo ? (
                <>
                  <img
                    src={photo}
                    alt={`Photo ${index() + 1}`}
                    class="w-full h-full object-cover"
                  />
                  <IconButton
                    icon="x"
                    label="Remove photo"
                    size="sm"
                    onClick={() => removePhoto(index())}
                    class="absolute top-2 right-2 bg-background/80 backdrop-blur hover:bg-background h-7 w-7"
                  />
                </>
              ) : (
                <>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <Icon name="plus" class="text-2xl text-muted-foreground" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0]
                      if (file) handleFileSelect(file, index())
                    }}
                  />
                </>
              )}
            </div>
          )}
        </For>
      </div>

      {/* Counter */}
      <p class="text-base text-muted-foreground text-center">
        {filledCount()} of {MIN_PHOTOS} required
      </p>
    </div>
  )
}

export const privatePhotosStepMeta: StepMetadata = {
  id: 'private-photos',
  title: 'Add your photos',
  subtitle: 'These photos are encrypted and only shared when you match with someone.',
  required: true,
  validate: (data) => {
    const stepData = data as unknown as PrivatePhotosStepData
    const filledCount = (stepData?.privatePhotos || []).filter(Boolean).length
    return filledCount >= MIN_PHOTOS
  },
}
