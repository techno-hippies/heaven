import { type Component } from 'solid-js'
import { OnboardingStep } from './OnboardingStep'
import { InputWithSuffix, InputStatus, type InputState } from '@/components/ui/input'

export interface ChooseNameProps {
  /** Free .neodate name */
  name: string
  onNameChange?: (name: string) => void
  nameStatus?: InputState

  /** Premium .⭐ name (optional) */
  starName?: string
  onStarNameChange?: (name: string) => void
  starStatus?: InputState
  starPrice?: string

  /** Continue action */
  onContinue?: () => void

  class?: string
}

export const ChooseName: Component<ChooseNameProps> = (props) => {
  const nameStatus = () => props.nameStatus ?? 'idle'
  const starStatus = () => props.starStatus ?? 'idle'
  const starPrice = () => props.starPrice ?? '$12 USDC per year'

  const canContinue = () => props.name.length >= 3 && nameStatus() === 'valid'

  const sanitize = (value: string) => value.toLowerCase().replace(/[^a-z0-9-]/g, '')

  return (
    <OnboardingStep
      title="Choose a domain"
      subtitle="Works across apps, as a URL, and as email"
      canContinue={canContinue()}
      onContinue={props.onContinue}
      class={props.class}
    >
      {/* Free name */}
      <div>
        <InputWithSuffix
          value={props.name}
          onInput={(e) => props.onNameChange?.(sanitize(e.currentTarget.value))}
          placeholder="yourname"
          suffix=".neodate"
          state={nameStatus() === 'valid' ? 'valid' : nameStatus() === 'invalid' ? 'invalid' : 'default'}
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
        />
        <InputStatus state={nameStatus()} class="mt-2" />
      </div>

      {/* Premium name */}
      <div>
        <p class="text-sm text-muted-foreground mb-2">
          Premium — {starPrice()}
        </p>
        <InputWithSuffix
          value={props.starName ?? ''}
          onInput={(e) => props.onStarNameChange?.(sanitize(e.currentTarget.value))}
          placeholder="yourname"
          suffix=".⭐"
          state={starStatus() === 'valid' ? 'valid' : starStatus() === 'invalid' ? 'invalid' : 'default'}
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
        />
        <InputStatus state={starStatus()} class="mt-2" />
      </div>
    </OnboardingStep>
  )
}

export default ChooseName
