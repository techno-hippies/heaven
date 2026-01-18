import { For, type Component } from 'solid-js'
import { RadioCardSelect, type RadioCardOption } from '@/components/ui/radio-card-select'

export type ChatIdentity = 'pkp' | 'eoa'

export interface ChatIdentitySelectProps {
  /** Current selected identity */
  value: ChatIdentity
  /** Called when selection changes */
  onChange?: (value: ChatIdentity) => void
  /** Additional class names */
  class?: string
  /** Disable selection */
  disabled?: boolean
}

const OPTIONS: RadioCardOption<ChatIdentity>[] = [
  {
    value: 'eoa',
    label: 'All Ethereum Apps',
    description:
      'Messages appear in any XMTP app. Matches can reach you on Coinbase Wallet, Converse, and others.',
  },
  {
    value: 'pkp',
    label: 'Only Neodate',
    description:
      'Messages stay in Neodate. Others can\'t reach you on Coinbase Wallet or other XMTP apps.',
  },
]

const HELPER_POINTS = [
  'End-to-end encrypted either way',
  'Switching creates a new inbox',
]

export const ChatIdentitySelect: Component<ChatIdentitySelectProps> = (props) => {
  return (
    <RadioCardSelect
      options={OPTIONS}
      value={props.value}
      onChange={props.onChange}
      label="Chat Identity"
      helperText={
        <ul class="list-disc list-inside space-y-0.5">
          <For each={HELPER_POINTS}>{(point) => <li>{point}</li>}</For>
        </ul>
      }
      disabled={props.disabled}
      class={props.class}
    />
  )
}

export default ChatIdentitySelect
