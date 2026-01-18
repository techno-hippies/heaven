import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { Icon } from '@/components/icons'
import {
  RELATIONSHIP_STATUS_LABELS,
  REGION_BUCKET_LABELS,
  GENDER_IDENTITY_LABELS,
  LOOKING_FOR_LABELS,
  RELATIONSHIP_STRUCTURE_LABELS,
  KIDS_LABELS,
  RELIGION_LABELS,
  GROUP_PLAY_MODE_LABELS,
} from '@/components/profile/ProfileBadge'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const ProfilePreviewStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Preview"
    title="Here's your profile"
    subtitle="Review before creating your account."
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={true}
    onBack={props.onBack}
    onContinue={props.onCreateProfile}
    continueText="Create profile"
  >
    <div class="space-y-6">
      {/* Avatar + Name row */}
      <div class="flex items-center gap-4">
        {/* Avatar */}
        <div class="w-20 h-20 rounded-2xl bg-secondary overflow-hidden flex-shrink-0">
          <Show
            when={props.photoUrl}
            fallback={
              <div class="w-full h-full flex items-center justify-center">
                <Icon name="user" class="text-3xl text-muted-foreground" />
              </div>
            }
          >
            <img
              src={props.photoUrl}
              class="w-full h-full object-cover"
            />
          </Show>
        </div>

        {/* Name & Username */}
        <div>
          <h2 class="text-xl font-bold text-foreground">{props.data().name || 'Your Name'}</h2>
          <p class="text-base text-muted-foreground">
            {props.data().name ? `${props.data().name}.neodate` : 'yourname.neodate'}
          </p>
        </div>
      </div>

      {/* Public section */}
      <Show
        when={
          props.data().region ||
          (props.data().gender && props.data().genderVisibility === 'public') ||
          (props.data().lookingFor && props.data().lookingForVisibility === 'public')
        }
      >
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Public
          </p>
          <div class="grid grid-cols-2 gap-x-6 gap-y-3">
            <Show when={props.data().region}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Region</span>
                <span class="text-base font-medium text-foreground">
                  {REGION_BUCKET_LABELS[Number(props.data().region) as keyof typeof REGION_BUCKET_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().gender && props.data().genderVisibility === 'public'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Gender</span>
                <span class="text-base font-medium text-foreground">
                  {GENDER_IDENTITY_LABELS[Number(props.data().gender) as keyof typeof GENDER_IDENTITY_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().lookingFor && props.data().lookingForVisibility === 'public'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Seeking</span>
                <span class="text-base font-medium text-foreground">
                  {LOOKING_FOR_LABELS[Number(props.data().lookingFor) as keyof typeof LOOKING_FOR_LABELS]}
                </span>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Shared with matches section */}
      <Show
        when={
          (props.data().relationshipStatus && props.data().relationshipStatusVisibility === 'match') ||
          (props.data().gender && props.data().genderVisibility === 'match') ||
          (props.data().lookingFor && props.data().lookingForVisibility === 'match') ||
          (props.data().relationshipStructure && props.data().relationshipStructureVisibility === 'match') ||
          (props.data().kids && props.data().kidsVisibility === 'match') ||
          (props.data().religion && props.data().religionVisibility === 'match') ||
          (props.data().groupPlay && props.data().groupPlayVisibility === 'match')
        }
      >
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Shared with matches
          </p>
          <div class="grid grid-cols-2 gap-x-6 gap-y-3">
            <Show when={props.data().relationshipStatus && props.data().relationshipStatusVisibility === 'match'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Status</span>
                <span class="text-base font-medium text-foreground">
                  {RELATIONSHIP_STATUS_LABELS[Number(props.data().relationshipStatus) as keyof typeof RELATIONSHIP_STATUS_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().gender && props.data().genderVisibility === 'match'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Gender</span>
                <span class="text-base font-medium text-foreground">
                  {GENDER_IDENTITY_LABELS[Number(props.data().gender) as keyof typeof GENDER_IDENTITY_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().lookingFor && props.data().lookingForVisibility === 'match'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Seeking</span>
                <span class="text-base font-medium text-foreground">
                  {LOOKING_FOR_LABELS[Number(props.data().lookingFor) as keyof typeof LOOKING_FOR_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().relationshipStructure && props.data().relationshipStructureVisibility === 'match'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Structure</span>
                <span class="text-base font-medium text-foreground">
                  {RELATIONSHIP_STRUCTURE_LABELS[Number(props.data().relationshipStructure) as keyof typeof RELATIONSHIP_STRUCTURE_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().kids && props.data().kidsVisibility === 'match'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Kids</span>
                <span class="text-base font-medium text-foreground">
                  {KIDS_LABELS[Number(props.data().kids) as keyof typeof KIDS_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().religion && props.data().religionVisibility === 'match'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Religion</span>
                <span class="text-base font-medium text-foreground">
                  {RELIGION_LABELS[Number(props.data().religion) as keyof typeof RELIGION_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().groupPlay && props.data().groupPlayVisibility === 'match'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Group play</span>
                <span class="text-base font-medium text-foreground">
                  {GROUP_PLAY_MODE_LABELS[Number(props.data().groupPlay) as keyof typeof GROUP_PLAY_MODE_LABELS]}
                </span>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Private section */}
      <Show
        when={
          (props.data().relationshipStatus && props.data().relationshipStatusVisibility === 'private') ||
          (props.data().gender && props.data().genderVisibility === 'private') ||
          (props.data().lookingFor && props.data().lookingForVisibility === 'private') ||
          (props.data().relationshipStructure && props.data().relationshipStructureVisibility === 'private') ||
          (props.data().kids && props.data().kidsVisibility === 'private') ||
          (props.data().religion && props.data().religionVisibility === 'private') ||
          (props.data().groupPlay && props.data().groupPlayVisibility === 'private')
        }
      >
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Private
          </p>
          <div class="grid grid-cols-2 gap-x-6 gap-y-3">
            <Show when={props.data().relationshipStatus && props.data().relationshipStatusVisibility === 'private'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Status</span>
                <span class="text-base font-medium text-foreground">
                  {RELATIONSHIP_STATUS_LABELS[Number(props.data().relationshipStatus) as keyof typeof RELATIONSHIP_STATUS_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().gender && props.data().genderVisibility === 'private'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Gender</span>
                <span class="text-base font-medium text-foreground">
                  {GENDER_IDENTITY_LABELS[Number(props.data().gender) as keyof typeof GENDER_IDENTITY_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().lookingFor && props.data().lookingForVisibility === 'private'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Seeking</span>
                <span class="text-base font-medium text-foreground">
                  {LOOKING_FOR_LABELS[Number(props.data().lookingFor) as keyof typeof LOOKING_FOR_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().relationshipStructure && props.data().relationshipStructureVisibility === 'private'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Structure</span>
                <span class="text-base font-medium text-foreground">
                  {RELATIONSHIP_STRUCTURE_LABELS[Number(props.data().relationshipStructure) as keyof typeof RELATIONSHIP_STRUCTURE_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().kids && props.data().kidsVisibility === 'private'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Kids</span>
                <span class="text-base font-medium text-foreground">
                  {KIDS_LABELS[Number(props.data().kids) as keyof typeof KIDS_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().religion && props.data().religionVisibility === 'private'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Religion</span>
                <span class="text-base font-medium text-foreground">
                  {RELIGION_LABELS[Number(props.data().religion) as keyof typeof RELIGION_LABELS]}
                </span>
              </div>
            </Show>
            <Show when={props.data().groupPlay && props.data().groupPlayVisibility === 'private'}>
              <div class="flex flex-col">
                <span class="text-sm text-muted-foreground">Group play</span>
                <span class="text-base font-medium text-foreground">
                  {GROUP_PLAY_MODE_LABELS[Number(props.data().groupPlay) as keyof typeof GROUP_PLAY_MODE_LABELS]}
                </span>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  </OnboardingStep>
)
