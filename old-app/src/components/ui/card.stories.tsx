import type { Meta, StoryObj } from 'storybook-solidjs'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card class="w-80">
      <CardHeader>
        <CardTitle>Welcome to Neodate</CardTitle>
        <CardDescription>Connect through your digital footprint</CardDescription>
      </CardHeader>
      <CardContent>
        <p class="text-foreground">Start discovering people who share your browsing patterns and interests.</p>
      </CardContent>
      <CardFooter>
        <Button class="w-full" variant="default">Get Started</Button>
      </CardFooter>
    </Card>
  ),
}

