import type { Meta, StoryObj } from 'storybook-solidjs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'

const meta: Meta<typeof Accordion> = {
  title: 'UI/Accordion',
  component: Accordion,
}

export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  render: () => (
    <div class="w-96">
      <Accordion collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>What is Neodate?</AccordionTrigger>
          <AccordionContent>
            Neodate is a privacy-first dating app that matches you based on interests rather than appearances.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How does matching work?</AccordionTrigger>
          <AccordionContent>
            We analyze your browsing patterns through our DNS VPN to find people with similar interests and digital footprints.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is my data secure?</AccordionTrigger>
          <AccordionContent>
            Your data is stored on-chain using ENS and smart contracts. You own your data and can port it to other apps.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const Multiple: Story = {
  render: () => (
    <div class="w-96">
      <Accordion multiple defaultValue={['item-1']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>First item (expanded by default)</AccordionTrigger>
          <AccordionContent>
            This accordion allows multiple items to be expanded at once.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second item</AccordionTrigger>
          <AccordionContent>
            You can open this without closing the first one.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Third item</AccordionTrigger>
          <AccordionContent>
            All three can be open simultaneously.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const QuestionAnswer: Story = {
  render: () => (
    <div class="w-[480px]">
      <h1 class="text-2xl font-bold text-foreground mb-6">Questions</h1>
      <Accordion collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Can I use a real photo?</AccordionTrigger>
          <AccordionContent>
            We intentionally don't support this. Photos make dating superficial—your likelihood of considering someone is too heavily influenced by appearance.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Who owns my data?</AccordionTrigger>
          <AccordionContent>
            Unlike most dating apps, you own your data. This includes your username (an ENS name) and data stored in the contracts.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is this open source?</AccordionTrigger>
          <AccordionContent>
            Yes. Our contracts are open source. You can review our code on GitHub.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}
