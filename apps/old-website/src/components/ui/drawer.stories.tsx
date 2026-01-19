import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
} from './drawer'
import { Button } from './button'
import { Input } from './input'

const meta: Meta = {
  title: 'UI/Drawer',
  parameters: {
    layout: 'centered',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger as={Button}>Open Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>
            This is a mobile-friendly bottom sheet. Drag down to dismiss.
          </DrawerDescription>
        </DrawerHeader>
        <div class="py-4">
          <p>Drawer content goes here.</p>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger as={Button}>Edit Profile</DrawerTrigger>
      <DrawerContent
        footer={
          <Button class="w-full">Save changes</Button>
        }
      >
        <DrawerHeader>
          <DrawerTitle>Edit Profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here.
          </DrawerDescription>
        </DrawerHeader>
        <div class="space-y-4 py-4">
          <div>
            <label class="text-sm font-medium mb-2 block">Name</label>
            <Input placeholder="Your name" />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">Bio</label>
            <Input placeholder="Tell us about yourself" />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

export const WithBackButton: Story = {
  render: () => {
    const [step, setStep] = createSignal(1)

    return (
      <Drawer>
        <DrawerTrigger as={Button}>Multi-step Drawer</DrawerTrigger>
        <DrawerContent onBack={step() > 1 ? () => setStep(s => s - 1) : undefined}>
          <DrawerHeader>
            <DrawerTitle>Step {step()} of 3</DrawerTitle>
            <DrawerDescription>
              {step() === 1 && 'Welcome! Swipe up to see more.'}
              {step() === 2 && 'Great progress! One more step.'}
              {step() === 3 && 'Almost done!'}
            </DrawerDescription>
          </DrawerHeader>
          <div class="py-4">
            <p>Content for step {step()}</p>
          </div>
          <DrawerFooter>
            <Button
              class="w-full"
              onClick={() => step() < 3 ? setStep(s => s + 1) : null}
            >
              {step() < 3 ? 'Next' : 'Finish'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  },
}

export const NoHandle: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger as={Button}>Open (No Handle)</DrawerTrigger>
      <DrawerContent showHandle={false}>
        <DrawerHeader>
          <DrawerTitle>No Drag Handle</DrawerTitle>
          <DrawerDescription>
            This drawer doesn't show the drag handle at the top.
          </DrawerDescription>
        </DrawerHeader>
        <div class="py-4">
          <p>Use the X button to close.</p>
        </div>
      </DrawerContent>
    </Drawer>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false)

    return (
      <div class="flex flex-col gap-4 items-center">
        <p class="text-sm text-muted-foreground">
          Drawer is: {open() ? 'Open' : 'Closed'}
        </p>
        <Button onClick={() => setOpen(true)}>Open Controlled Drawer</Button>
        <Drawer open={open()} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Controlled Drawer</DrawerTitle>
              <DrawerDescription>
                This drawer's state is controlled externally.
              </DrawerDescription>
            </DrawerHeader>
            <div class="py-4">
              <p>You can close this by dragging down or tapping the X.</p>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    )
  },
}

export const WithActions: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger as={Button} variant="destructive">Delete Item</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Delete this item?</DrawerTitle>
          <DrawerDescription>
            This action cannot be undone.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button variant="destructive" class="w-full">Delete</Button>
          <DrawerClose as={Button} variant="outline" class="w-full">
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}
