import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { OnboardingStep } from './OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { type Visibility } from '@/components/ui/visibility-select'
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
  KINK_LEVEL_LABELS,
} from '@/components/profile/ProfileBadge'

const meta: Meta<typeof OnboardingStep> = {
  title: 'Onboarding/OnboardingStep',
  component: OnboardingStep,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof OnboardingStep>

const toOptions = (labels: Record<number, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

// Total steps varies based on path, using 9 as baseline
const TOTAL_STEPS = 9

// =============================================================================
// 1) RELATIONSHIP CONTEXT (branch early, private)
// =============================================================================

/** Step 1: Relationship Status */
export const Step1_RelationshipStatus: Story = {
  name: '1. Relationship Status',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <OnboardingStep
        title="What's your relationship status?"
        step={1}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onContinue={() => alert('Next!')}
      >
        <ChoiceSelect
          options={toOptions(RELATIONSHIP_STATUS_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

// =============================================================================
// 2) PUBLIC PROFILE (Directory)
// =============================================================================

/** Step 2: Photo */
export const Step2_Photo: Story = {
  name: '2. Photo',
  render: () => {
    const [photoUrl, setPhotoUrl] = createSignal<string>()
    const [state, setState] = createSignal<'empty' | 'uploading' | 'success'>('empty')

    const handleSelect = (file: File) => {
      setState('uploading')
      setTimeout(() => {
        setState('success')
        setPhotoUrl(URL.createObjectURL(file))
      }, 1000)
    }

    return (
      <OnboardingStep
        title="Got a photo?"
        step={2}
        totalSteps={TOTAL_STEPS}
        canContinue={!!photoUrl()}
        onBack={() => alert('Back!')}
        onContinue={() => alert('Next!')}
      >
        <PhotoUpload
          state={state()}
          previewUrl={photoUrl()}
          onFileSelect={handleSelect}
          onRemove={() => { setState('empty'); setPhotoUrl(undefined) }}
          isAvatar
        />
      </OnboardingStep>
    )
  },
}

/** Step 3: Region */
export const Step3_Region: Story = {
  name: '3. Region',
  render: () => {
    const [value, setValue] = createSignal<string>()

    return (
      <OnboardingStep
        title="Where are you?"
        step={3}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        onContinue={() => alert('Next!')}
      >
        <ChoiceSelect
          options={toOptions(REGION_BUCKET_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

/** Step 4: Gender */
export const Step4_Gender: Story = {
  name: '4. Gender',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('public')

    return (
      <OnboardingStep
        title="How do you identify?"
        step={4}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onContinue={() => alert('Next!')}
      >
        <ChoiceSelect
          options={toOptions(GENDER_IDENTITY_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

/** Step 5: Looking For */
export const Step5_LookingFor: Story = {
  name: '5. Looking For',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('public')

    return (
      <OnboardingStep
        title="What are you looking for?"
        step={5}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onContinue={() => alert('Next!')}
      >
        <ChoiceSelect
          options={toOptions(LOOKING_FOR_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

// =============================================================================
// 3) PRIVATE PROFILE (Dating values)
// =============================================================================

/** Step 6: Relationship Structure */
export const Step6_RelationshipStructure: Story = {
  name: '6. Relationship Structure',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <OnboardingStep
        title="What's your relationship style?"
        step={6}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onContinue={() => alert('Next!')}
      >
        <ChoiceSelect
          options={toOptions(RELATIONSHIP_STRUCTURE_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

/** Step 7: Kids */
export const Step7_Kids: Story = {
  name: '7. Kids',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <OnboardingStep
        title="Do you have kids?"
        step={7}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onContinue={() => alert('Next!')}
      >
        <ChoiceSelect
          options={toOptions(KIDS_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

/** Step 8: Religion */
export const Step8_Religion: Story = {
  name: '8. Religion',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <OnboardingStep
        title="What do you believe?"
        step={8}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onContinue={() => alert('Next!')}
      >
        <ChoiceSelect
          options={toOptions(RELIGION_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

/** Step 9: Group Play */
export const Step9_GroupPlay: Story = {
  name: '9. Group Play',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('private')

    return (
      <OnboardingStep
        title="Into group play?"
        step={9}
        totalSteps={TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onContinue={() => alert('Start browsing!')}
        continueText="Start browsing"
      >
        <ChoiceSelect
          options={toOptions(GROUP_PLAY_MODE_LABELS)}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

// =============================================================================
// 4) ACCOUNT CREATION (after profile setup)
// =============================================================================

/** Account Creation: Method selection */
export const Account_MethodSelection: Story = {
  name: 'Account: Method Selection',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        {/* Content */}
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-2xl mx-auto space-y-6">
            {/* Icon */}
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="lock-simple" class="text-4xl text-primary" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Create your account</h1>
              <p class="text-lg text-muted-foreground">
                Your profile is ready. Now secure it with a passkey or wallet.
              </p>
            </div>

            {/* Auth options */}
            <div class="flex flex-col gap-3 pt-4 w-full max-w-sm mx-auto">
              <button
                class="w-full h-14 px-6 text-lg font-medium rounded-full bg-primary text-primary-foreground flex items-center justify-center gap-3"
                onClick={() => alert('Passkey selected')}
              >
                <Icon name="fingerprint" class="text-2xl" />
                <span>Continue with Passkey</span>
              </button>

              <div class="flex items-center gap-4 py-2">
                <div class="flex-1 h-px bg-border" />
                <span class="text-muted-foreground text-sm">or</span>
                <div class="flex-1 h-px bg-border" />
              </div>

              <button
                class="w-full h-14 px-6 text-lg font-medium rounded-full border border-border bg-transparent text-foreground flex items-center justify-center gap-3 hover:bg-secondary/50"
                onClick={() => alert('Wallet selected')}
              >
                <Icon name="wallet" class="text-2xl" />
                <span>Connect Wallet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="w-full px-6 pb-6">
          <p class="text-sm text-muted-foreground text-center">
            Secured by Lit Protocol. Your identity is portable across apps.
          </p>
        </div>
      </div>
    )
  },
}

/** Account Creation: Passkey choice (Create/Sign In) */
export const Account_PasskeyChoice: Story = {
  name: 'Account: Passkey Choice',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        {/* Content */}
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-2xl mx-auto space-y-6">
            {/* Icon */}
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="fingerprint" class="text-4xl text-primary" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Sign in with Passkey</h1>
              <p class="text-lg text-muted-foreground">
                Use your device's passkey (Face ID, Touch ID, or Windows Hello) for secure authentication.
              </p>
            </div>

            {/* Auth options */}
            <div class="flex flex-col gap-3 pt-4 w-full max-w-sm mx-auto">
              <button
                class="w-full h-14 px-6 text-lg font-medium rounded-full bg-primary text-primary-foreground"
                onClick={() => alert('Create Account')}
              >
                Create Account
              </button>

              <button
                class="w-full h-14 px-6 text-lg font-medium rounded-full border border-border bg-transparent text-foreground hover:bg-secondary/50"
                onClick={() => alert('Sign In')}
              >
                Sign In
              </button>
            </div>

            {/* Back button */}
            <button
              class="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mx-auto"
              onClick={() => alert('Back')}
            >
              <Icon name="arrow-left" class="text-base" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    )
  },
}

/** Account Creation: Passkey authenticating */
export const Account_PasskeyAuthenticating: Story = {
  name: 'Account: Passkey Authenticating',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        {/* Content */}
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-2xl mx-auto space-y-6">
            {/* Spinner */}
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Complete the passkey prompt</h1>
              <p class="text-lg text-muted-foreground">
                A passkey prompt should appear on your device. Follow the instructions to continue.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
}

/** Account Creation: Success */
export const Account_Success: Story = {
  name: 'Account: Success',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        {/* Content */}
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-2xl mx-auto space-y-6">
            {/* Success icon */}
            <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Icon name="check-circle" weight="fill" class="text-4xl text-emerald-500" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">You're all set!</h1>
              <p class="text-lg text-muted-foreground">
                Your account is created and your profile is live. Start browsing to find your match.
              </p>
            </div>

            {/* Account info */}
            <div class="bg-card rounded-2xl p-4 border border-border max-w-sm mx-auto">
              <p class="text-sm text-muted-foreground mb-1">Your address</p>
              <p class="font-mono text-foreground">0x1234...5678</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="w-full px-6 pb-6">
          <div class="max-w-sm mx-auto">
            <button
              class="w-full h-14 px-10 text-lg font-medium rounded-full bg-primary text-primary-foreground"
              onClick={() => alert('Start browsing!')}
            >
              Start browsing
            </button>
          </div>
        </div>
      </div>
    )
  },
}

// =============================================================================
// 5) PREFERENCES (Dealbreakers - separate flow after browsing)
// =============================================================================

// =============================================================================
// 6) PREFERENCES (Dealbreakers - separate flow after browsing)
// =============================================================================

const PREF_TOTAL_STEPS = 6

/** Preferences: Their Gender - filter ON by default (dealbreaker), multi-select */
export const Pref1_TheirGender: Story = {
  name: 'Pref 1: Their Gender',
  render: () => {
    const [values, setValues] = createSignal<string[]>([])
    const [filterEnabled, setFilterEnabled] = createSignal(true) // ON by default

    return (
      <OnboardingStep
        title="Who are you interested in?"
        subtitle="Select all that apply"
        step={1}
        totalSteps={PREF_TOTAL_STEPS}
        canContinue={values().length > 0}
        filterEnabled={filterEnabled()}
        onFilterChange={setFilterEnabled}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Next! Selected: ${values().join(', ')}, Filter: ${filterEnabled() ? 'ON' : 'OFF'}`)}
      >
        <ChoiceSelect
          multiple
          options={toOptions(GENDER_IDENTITY_LABELS)}
          value={values()}
          onChange={(v) => setValues(v as string[])}
        />
      </OnboardingStep>
    )
  },
}

/** Preferences: Age Range - filter ON by default (dealbreaker) */
export const Pref2_AgeRange: Story = {
  name: 'Pref 2: Age Range',
  render: () => {
    const [minAge, setMinAge] = createSignal<string>()
    const [maxAge, setMaxAge] = createSignal<string>()
    const [filterEnabled, setFilterEnabled] = createSignal(true) // ON by default

    const ageOptions = [
      { value: '18', label: '18' },
      { value: '21', label: '21' },
      { value: '25', label: '25' },
      { value: '30', label: '30' },
      { value: '35', label: '35' },
      { value: '40', label: '40' },
      { value: '45', label: '45' },
      { value: '50', label: '50+' },
    ]

    return (
      <OnboardingStep
        title="What ages?"
        step={2}
        totalSteps={PREF_TOTAL_STEPS}
        canContinue={!!minAge() && !!maxAge()}
        filterEnabled={filterEnabled()}
        onFilterChange={setFilterEnabled}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Next! Filter: ${filterEnabled() ? 'ON' : 'OFF'}`)}
      >
        <div class="space-y-4">
          <div>
            <p class="text-sm text-muted-foreground mb-2">Minimum age</p>
            <ChoiceSelect
              options={ageOptions}
              value={minAge() ?? ''}
              onChange={setMinAge}
              columns={4}
            />
          </div>
          <div>
            <p class="text-sm text-muted-foreground mb-2">Maximum age</p>
            <ChoiceSelect
              options={ageOptions}
              value={maxAge() ?? ''}
              onChange={setMaxAge}
              columns={4}
            />
          </div>
        </div>
      </OnboardingStep>
    )
  },
}

/** Preferences: Their Location - filter ON by default, multi-select regions */
export const Pref3_Location: Story = {
  name: 'Pref 3: Location',
  render: () => {
    const [values, setValues] = createSignal<string[]>([])
    const [filterEnabled, setFilterEnabled] = createSignal(true) // ON by default

    return (
      <OnboardingStep
        title="Where are they?"
        subtitle="Select all that apply"
        step={3}
        totalSteps={PREF_TOTAL_STEPS}
        canContinue={values().length > 0}
        filterEnabled={filterEnabled()}
        onFilterChange={setFilterEnabled}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Next! Selected: ${values().join(', ')}, Filter: ${filterEnabled() ? 'ON' : 'OFF'}`)}
      >
        <ChoiceSelect
          multiple
          options={toOptions(REGION_BUCKET_LABELS)}
          value={values()}
          onChange={(v) => setValues(v as string[])}
        />
      </OnboardingStep>
    )
  },
}

/** Preferences: Their Relationship Structure - filter OFF by default (signal), multi-select */
export const Pref4_RelationshipStructure: Story = {
  name: 'Pref 4: Relationship Structure',
  render: () => {
    const [values, setValues] = createSignal<string[]>([])
    const [filterEnabled, setFilterEnabled] = createSignal(false) // OFF by default

    return (
      <OnboardingStep
        title="What are you open to?"
        subtitle="Select all that apply"
        step={4}
        totalSteps={PREF_TOTAL_STEPS}
        canContinue={values().length > 0}
        filterEnabled={filterEnabled()}
        onFilterChange={setFilterEnabled}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Next! Selected: ${values().join(', ')}, Filter: ${filterEnabled() ? 'ON' : 'OFF'}`)}
      >
        <ChoiceSelect
          multiple
          options={toOptions(RELATIONSHIP_STRUCTURE_LABELS)}
          value={values()}
          onChange={(v) => setValues(v as string[])}
        />
      </OnboardingStep>
    )
  },
}

/** Preferences: Their Kids Status - filter OFF by default (signal), multi-select */
export const Pref5_Kids: Story = {
  name: 'Pref 5: Kids',
  render: () => {
    const [values, setValues] = createSignal<string[]>([])
    const [filterEnabled, setFilterEnabled] = createSignal(false) // OFF by default

    return (
      <OnboardingStep
        title="What about kids?"
        subtitle="Select all that apply"
        step={5}
        totalSteps={PREF_TOTAL_STEPS}
        canContinue={values().length > 0}
        filterEnabled={filterEnabled()}
        onFilterChange={setFilterEnabled}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Next! Selected: ${values().join(', ')}, Filter: ${filterEnabled() ? 'ON' : 'OFF'}`)}
      >
        <ChoiceSelect
          multiple
          options={toOptions(KIDS_LABELS)}
          value={values()}
          onChange={(v) => setValues(v as string[])}
        />
      </OnboardingStep>
    )
  },
}

/** Preferences: Complete */
export const Pref6_Complete: Story = {
  name: 'Pref 6: Complete',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        {/* Content */}
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-md mx-auto space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Icon name="check-circle" weight="fill" class="text-4xl text-emerald-500" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Preferences saved</h1>
              <p class="text-lg text-muted-foreground">
                We'll show you profiles that match what you're looking for. You can update these anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="w-full px-6 pb-6">
          <div class="max-w-md mx-auto">
            <button
              class="w-full h-14 px-10 text-lg font-medium rounded-full bg-primary text-primary-foreground"
              onClick={() => alert('Start browsing!')}
            >
              Start browsing
            </button>
          </div>
        </div>
      </div>
    )
  },
}

// =============================================================================
// 7) VERIFICATION (Self.xyz - after browsing)
// =============================================================================

/** Verification: Prompt */
export const Verify_Prompt: Story = {
  name: 'Verify: Prompt',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        {/* Content */}
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-md mx-auto space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
              <Icon name="user-circle" class="text-4xl text-blue-500" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Verify your identity</h1>
              <p class="text-lg text-muted-foreground">
                Scan your passport with Self.xyz to unlock full access. Your personal info stays private.
              </p>
            </div>

            {/* Benefits */}
            <div class="text-left space-y-3 bg-card rounded-2xl p-4 border border-border">
              <div class="flex items-start gap-3">
                <Icon name="check" weight="bold" class="text-green-400" />
                <div>
                  <p class="font-medium text-foreground">Like profiles</p>
                  <p class="text-sm text-muted-foreground">Send interest to people you like</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Icon name="check" weight="bold" class="text-green-400" />
                <div>
                  <p class="font-medium text-foreground">Message matches</p>
                  <p class="text-sm text-muted-foreground">Chat when you both like each other</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Icon name="check" weight="bold" class="text-green-400" />
                <div>
                  <p class="font-medium text-foreground">Verified badge</p>
                  <p class="text-sm text-muted-foreground">Show others you're real</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="w-full px-6 pb-6 space-y-3">
          <div class="max-w-md mx-auto space-y-3">
            <button
              class="w-full h-14 px-10 text-lg font-medium rounded-full bg-primary text-primary-foreground"
              onClick={() => alert('Start verification!')}
            >
              Verify with Self.xyz
            </button>
            <button
              class="w-full h-11 px-5 text-base font-medium rounded-full bg-transparent text-muted-foreground hover:text-foreground"
              onClick={() => alert('Skip for now!')}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    )
  },
}

/** Verification: Scanning */
export const Verify_Scanning: Story = {
  name: 'Verify: Scanning',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        {/* Content */}
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-md mx-auto space-y-6">
            {/* Camera viewfinder placeholder */}
            <div class="w-64 h-80 mx-auto rounded-2xl bg-card border-2 border-dashed border-border flex items-center justify-center">
              <div class="space-y-3 text-center">
                <div class="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p class="text-muted-foreground">Scanning passport...</p>
              </div>
            </div>

            <p class="text-sm text-muted-foreground">
              Hold your passport steady in the frame. NFC scanning will begin automatically.
            </p>
          </div>
        </div>
      </div>
    )
  },
}

/** Verification: Success */
export const Verify_Success: Story = {
  name: 'Verify: Success',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        {/* Content */}
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-md mx-auto space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Icon name="check-circle" weight="fill" class="text-4xl text-emerald-500" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Verified!</h1>
              <p class="text-lg text-muted-foreground">
                You now have full access. Your verified age and nationality are stored securely.
              </p>
            </div>

            {/* What was verified */}
            <div class="text-left space-y-2 bg-card rounded-2xl p-4 border border-border">
              <p class="text-sm text-muted-foreground">Verified info</p>
              <div class="flex justify-between">
                <span class="text-foreground">Age range</span>
                <span class="text-muted-foreground">25-29</span>
              </div>
              <div class="flex justify-between">
                <span class="text-foreground">Nationality</span>
                <span class="text-muted-foreground">US</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="w-full px-6 pb-6">
          <div class="max-w-md mx-auto">
            <button
              class="w-full h-14 px-10 text-lg font-medium rounded-full bg-primary text-primary-foreground"
              onClick={() => alert('Done!')}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  },
}
