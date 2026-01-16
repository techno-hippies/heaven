import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { PhotoUpload, type PhotoUploadState } from './photo-upload'

const meta: Meta<typeof PhotoUpload> = {
  title: 'UI/PhotoUpload',
  component: PhotoUpload,
  decorators: [
    (Story) => (
      <div class="max-w-xs p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PhotoUpload>

/** Empty - avatar (square) */
export const EmptyAvatar: Story = {
  args: {
    state: 'empty',
    isAvatar: true,
  },
}

/** Empty - gallery photo */
export const EmptyGallery: Story = {
  args: {
    state: 'empty',
    isAvatar: false,
  },
}

/** Uploading */
export const Uploading: Story = {
  args: {
    state: 'uploading',
    isAvatar: true,
  },
}

/** Checking (face detection) */
export const Checking: Story = {
  args: {
    state: 'checking',
    isAvatar: true,
  },
}

/** Success with preview */
export const Success: Story = {
  args: {
    state: 'success',
    isAvatar: true,
    previewUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=aurora',
  },
}

/** Success - gallery photo */
export const SuccessGallery: Story = {
  args: {
    state: 'success',
    isAvatar: false,
    previewUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
  },
}

/** Error - face detected */
export const ErrorFaceDetected: Story = {
  args: {
    state: 'error',
    isAvatar: true,
    error: 'Face detected. Please use a faceless photo.',
  },
}

/** Error - generic */
export const ErrorGeneric: Story = {
  args: {
    state: 'error',
    isAvatar: false,
    error: 'Upload failed. Please try again.',
  },
}

/** Interactive demo */
export const Interactive: Story = {
  render: () => {
    const [state, setState] = createSignal<PhotoUploadState>('empty')
    const [previewUrl, setPreviewUrl] = createSignal<string>('')
    const [error, setError] = createSignal<string>('')

    const handleFileSelect = (file: File) => {
      // Simulate upload flow
      setState('uploading')

      setTimeout(() => {
        setState('checking')

        setTimeout(() => {
          // Simulate random success/failure
          if (Math.random() > 0.3) {
            setPreviewUrl(URL.createObjectURL(file))
            setState('success')
          } else {
            setError('Face detected. Please use a faceless photo.')
            setState('error')
          }
        }, 1000)
      }, 800)
    }

    const handleRemove = () => {
      setState('empty')
      setPreviewUrl('')
      setError('')
    }

    return (
      <PhotoUpload
        state={state()}
        previewUrl={previewUrl()}
        error={error()}
        onFileSelect={handleFileSelect}
        onRemove={handleRemove}
        isAvatar
      />
    )
  },
}

/** Multiple photos grid */
export const PhotoGrid: Story = {
  render: () => {
    return (
      <div class="grid grid-cols-3 gap-2">
        <PhotoUpload
          state="success"
          isAvatar
          previewUrl="https://api.dicebear.com/9.x/avataaars/svg?seed=main"
        />
        <PhotoUpload
          state="success"
          previewUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=250&fit=crop"
        />
        <PhotoUpload state="empty" />
        <PhotoUpload state="empty" />
        <PhotoUpload state="empty" />
        <PhotoUpload state="empty" />
      </div>
    )
  },
}
