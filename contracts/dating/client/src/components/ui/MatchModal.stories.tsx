import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { MatchModal, MatchNotification } from './MatchModal'
import { Button } from './Button'

const meta = {
  title: 'Dating/MatchModal',
  component: MatchModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MatchModal>

export default meta
type Story = StoryObj<typeof meta>

const sampleOverlaps = [
  { category: 'Intent', label: 'Both looking for serious', icon: '🎯' },
  { category: 'Structure', label: 'Both monogamous', icon: '💍' },
  { category: 'Intimacy', label: 'Both kink-friendly', icon: '🔥' },
  { category: 'Lifestyle', label: 'Both non-smokers', icon: '🚭' },
]

export const Default: Story = {
  args: {
    isOpen: true,
    myAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    theirAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    theirName: 'Jordan',
    overlaps: sampleOverlaps,
    onClose: () => {},
    onSendMessage: () => console.log('Send message'),
    onKeepSwiping: () => console.log('Keep swiping'),
  },
}

export const WithoutOverlaps: Story = {
  args: {
    isOpen: true,
    myAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    theirAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
    theirName: 'Sam',
    onClose: () => {},
    onSendMessage: () => {},
    onKeepSwiping: () => {},
  },
}

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = createSignal(false)

    return (
      <div class="min-h-screen bg-background p-8 flex items-center justify-center">
        <Button onClick={() => setIsOpen(true)} variant="gradient" size="lg">
          Simulate Match
        </Button>

        <MatchModal
          isOpen={isOpen()}
          onClose={() => setIsOpen(false)}
          onSendMessage={() => {
            setIsOpen(false)
            alert('Opening chat...')
          }}
          onKeepSwiping={() => setIsOpen(false)}
          myAvatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
          theirAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
          theirName="Jordan"
          overlaps={sampleOverlaps}
        />
      </div>
    )
  },
}

export const Notification: StoryObj<typeof MatchNotification> = {
  render: () => (
    <div class="w-80">
      <MatchNotification
        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
        name="Jordan"
        onClick={() => alert('Open match')}
      />
    </div>
  ),
}

export const NotificationList: StoryObj<typeof MatchNotification> = {
  render: () => (
    <div class="w-80 space-y-2">
      <MatchNotification
        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
        name="Jordan"
      />
      <MatchNotification
        avatar="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop"
        name="Sam"
      />
      <MatchNotification
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
        name="Alex"
      />
    </div>
  ),
}
