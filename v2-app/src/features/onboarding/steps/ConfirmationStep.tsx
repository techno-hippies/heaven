import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import type { StepComponentProps, StepMetadata } from '../types'
import { Icon } from '@/icons'

export interface ConfirmationStepData {
  // Aggregate data from previous steps (flat structure)
  originalPhotoUrl?: string
  processedPhotoUrl?: string
  selectedStyle?: string
  name?: string
  tld?: string
  age?: string
  gender?: string
}

// Match contract: G_MAN=1, G_WOMAN=2, G_TRANS_MAN=3, G_TRANS_WOMAN=4, G_NON_BINARY=5
const GENDER_LABELS: Record<string, string> = {
  '1': 'Man',
  '2': 'Woman',
  '3': 'Trans man',
  '4': 'Trans woman',
  '5': 'Non-binary',
}

export const ConfirmationStep: Component<StepComponentProps<ConfirmationStepData>> = (props) => {
  const photoUrl = () => props.data.processedPhotoUrl
  const name = () => props.data.name
  const tld = () => props.data.tld || 'heaven'
  const age = () => props.data.age
  const gender = () => props.data.gender

  return (
    <div class="space-y-6">
      {/* Profile header - Instagram style */}
      <div class="flex items-center gap-4">
        <div class="w-28 h-28 rounded-2xl bg-secondary overflow-hidden flex-shrink-0">
          <Show
            when={photoUrl()}
            fallback={
              <div class="w-full h-full flex items-center justify-center">
                <Icon name="user" class="text-3xl text-muted-foreground" />
              </div>
            }
          >
            <img
              src={photoUrl()}
              alt="Avatar"
              class="w-full h-full object-cover"
            />
          </Show>
        </div>

        <div class="min-w-0">
          <h2 class="text-xl font-bold text-foreground truncate">
            {name() || 'Your Name'}
          </h2>
          <p class="text-base text-muted-foreground truncate">
            {name() ? `${name()}.${tld()}` : `yourname.${tld()}`}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div class="border-t border-border" />

      {/* Details grid */}
      <div class="grid grid-cols-2 gap-4">
        <Show when={age()}>
          <div>
            <p class="text-sm text-muted-foreground">Age</p>
            <p class="text-lg font-medium text-foreground">{age()}</p>
          </div>
        </Show>

        <Show when={gender()}>
          <div>
            <p class="text-sm text-muted-foreground">Gender</p>
            <p class="text-lg font-medium text-foreground">
              {GENDER_LABELS[gender()!] || gender()}
            </p>
          </div>
        </Show>
      </div>
    </div>
  )
}

export const confirmationStepMeta: StepMetadata = {
  id: 'confirmation',
  title: 'Confirm',
  required: true,
  validate: (data) => {
    const stepData = data as unknown as ConfirmationStepData
    return !!(
      stepData?.processedPhotoUrl &&
      stepData?.name &&
      stepData?.age &&
      stepData?.gender
    )
  },
}
