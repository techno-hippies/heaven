import { Show, type Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/icons'
import { IconButton } from './button'
import { Spinner } from './input'

export type PhotoUploadState = 'empty' | 'uploading' | 'checking' | 'success' | 'error'

export interface PhotoUploadProps {
  /** Current state */
  state?: PhotoUploadState
  /** Preview URL when uploaded */
  previewUrl?: string
  /** Error message (for face detected, etc.) */
  error?: string
  /** Called when file selected */
  onFileSelect?: (file: File) => void
  /** Called to remove photo */
  onRemove?: () => void
  /** Whether this is the main avatar (square, required) */
  isAvatar?: boolean
  /** Additional class names */
  class?: string
}

export const PhotoUpload: Component<PhotoUploadProps> = (props) => {
  const state = () => props.state ?? 'empty'
  const isAvatar = () => props.isAvatar ?? false

  let inputRef: HTMLInputElement | undefined

  const handleClick = () => {
    if (state() === 'success') return // Don't reopen if already uploaded
    inputRef?.click()
  }

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      props.onFileSelect?.(file)
    }
  }

  return (
    <div class={cn('space-y-3', props.class)}>
      {/* Upload area */}
      <div
        onClick={handleClick}
        class={cn(
          'relative overflow-hidden cursor-pointer',
          'border-2 border-dashed border-border rounded-2xl',
          'hover:border-primary/50',
          'flex items-center justify-center',
          isAvatar() ? 'aspect-square' : 'aspect-[4/5]',
          state() === 'success' && 'border-solid border-transparent',
          state() === 'error' && 'border-destructive'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          class="hidden"
        />

        {/* Empty state */}
        <Show when={state() === 'empty'}>
          <div class="flex flex-col items-center gap-2 p-6 text-center">
            <Icon name="camera" class="text-3xl text-muted-foreground" />
            <span class="text-sm text-muted-foreground">
              {isAvatar() ? 'Add avatar' : 'Add photo'}
            </span>
          </div>
        </Show>

        {/* Uploading state */}
        <Show when={state() === 'uploading'}>
          <div class="flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span class="text-sm text-muted-foreground">Uploading...</span>
          </div>
        </Show>

        {/* Checking state (face detection) */}
        <Show when={state() === 'checking'}>
          <div class="flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span class="text-sm text-muted-foreground">Checking...</span>
          </div>
        </Show>

        {/* Success state with preview */}
        <Show when={state() === 'success' && props.previewUrl}>
          <img
            src={props.previewUrl}
            alt="Uploaded photo"
            class="w-full h-full object-cover"
          />
          <IconButton
            icon="x"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              props.onRemove?.()
            }}
            class="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
          />
        </Show>

        {/* Error state */}
        <Show when={state() === 'error'}>
          <div class="flex flex-col items-center gap-2 p-6 text-center">
            <Icon name="warning" class="text-3xl text-destructive" />
            <span class="text-sm text-destructive">{props.error || 'Upload failed'}</span>
            <span class="text-xs text-muted-foreground">Tap to try again</span>
          </div>
        </Show>
      </div>

    </div>
  )
}

export default PhotoUpload
