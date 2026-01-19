import type { Component } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { PhotoUpload } from '@/components/ui/photo-upload'
import type { ProfileStepProps } from '@/pages/onboarding/step-types'

export const PhotoStep: Component<ProfileStepProps> = (props) => (
  <OnboardingStep
    sectionLabel="Profile"
    title="Photo"
    subtitle="Your main avatar is public and portable on Ethereum. You can use this identity across many apps."
    step={props.stepNumber}
    totalSteps={props.totalSteps}
    canContinue={!!props.photoUrl}
    onBack={props.onBack}
    onContinue={props.onContinue}
  >
    <PhotoUpload
      state={props.photoState ?? 'empty'}
      previewUrl={props.photoUrl}
      onFileSelect={props.onPhotoSelect}
      onRemove={props.onPhotoRemove}
      isAvatar
    />
  </OnboardingStep>
)
