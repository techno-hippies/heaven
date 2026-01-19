import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './dialog'
import { Button } from './button'
import { Input } from './input'

const meta: Meta = {
  title: 'UI/Dialog',
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger as={Button}>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a description of what this dialog is about.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <p>Dialog content goes here.</p>
        </div>
      </DialogContent>
    </Dialog>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger as={Button}>Edit Profile</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div>
            <label class="text-sm font-medium mb-2 block">Name</label>
            <Input placeholder="Your name" />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">Email</label>
            <Input type="email" placeholder="you@example.com" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const WithBackButton: Story = {
  render: () => {
    const [step, setStep] = createSignal(1)

    return (
      <Dialog>
        <DialogTrigger as={Button}>Multi-step Dialog</DialogTrigger>
        <DialogContent onBack={step() > 1 ? () => setStep(s => s - 1) : undefined}>
          <DialogHeader>
            <DialogTitle>Step {step()} of 3</DialogTitle>
            <DialogDescription>
              {step() === 1 && 'Welcome! Let\'s get started.'}
              {step() === 2 && 'Great progress! One more step.'}
              {step() === 3 && 'Almost done!'}
            </DialogDescription>
          </DialogHeader>
          <div class="py-4">
            <p>Content for step {step()}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => step() < 3 ? setStep(s => s + 1) : null}>
              {step() < 3 ? 'Next' : 'Finish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
}

export const Confirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger as={Button} variant="destructive">Delete Account</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)

    return (
      <div class="flex flex-col gap-4 items-center">
        <p class="text-sm text-muted-foreground">
          Dialog is: {open() ? 'Open' : 'Closed'}
        </p>
        <Button onClick={() => setOpen(true)}>Open Controlled Dialog</Button>
        <Dialog open={open()} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled Dialog</DialogTitle>
              <DialogDescription>
                This dialog's state is controlled externally.
              </DialogDescription>
            </DialogHeader>
            <div class="py-4">
              <p>You can close this with the X button or by clicking outside.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
}
