import type { Accessor } from 'solid-js'
import type { OnboardingData } from '@/lib/onboarding/store'

export type UpdateOnboardingData = <K extends keyof OnboardingData>(
  key: K,
  value: OnboardingData[K]
) => void

export interface ProfileStepProps {
  data: Accessor<OnboardingData>
  updateData: UpdateOnboardingData
  stepNumber: number
  totalSteps: number
  onBack?: () => void
  onContinue?: () => void
  onCreateProfile?: () => void
  photoState?: 'empty' | 'uploading' | 'success'
  photoUrl?: string
  onPhotoSelect?: (file: File) => void
  onPhotoRemove?: () => void
}

export interface DealbreakerStepProps {
  data: Accessor<OnboardingData>
  updateData: UpdateOnboardingData
  stepNumber: number
  totalSteps: number
  onBack?: () => void
  onContinue?: () => void
}
