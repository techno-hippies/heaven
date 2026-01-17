import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal, createEffect } from 'solid-js'
import { OnboardingStep } from './OnboardingStep'
import { ChooseName } from './ChooseName'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { InputWithSuffix, InputStatus, type InputState } from '@/components/ui/input'
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

// =============================================================================
// S1: ABOUT YOU (Values) - stored to Zama/FHE
// =============================================================================

const ABOUT_YOU_TOTAL_STEPS = 10

/** S1.1: Relationship Status */
export const S1_1_RelationshipStatus: Story = {
  name: 'S1.1 Relationship Status',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="What's your relationship status?"
        step={1}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={!!value()}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onBack={() => alert('Back to landing!')}
        onSkip={() => alert('Skipped - storing UNKNOWN')}
        onContinue={() => alert(`Next! Value: ${value()}, Visibility: ${visibility()}`)}
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

/** S1.2: Photo */
export const S1_2_Photo: Story = {
  name: 'S1.2 Photo',
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
        sectionLabel="Profile"
        title="Got a photo?"
        subtitle="Your main avatar is public and portable on Ethereum."
        step={2}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={!!photoUrl()}
        onBack={() => alert('Back!')}
        onSkip={() => alert('Skipped photo')}
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

/** S1.3: Name - uses new ChooseName component with TLD selector */
export const S1_3_Name: Story = {
  name: 'S1.3 Name',
  render: () => {
    const [name, setName] = createSignal('')
    const [tld, setTld] = createSignal('neodate')
    const [status, setStatus] = createSignal<InputState>('idle')

    // Simulated taken names per TLD
    const takenNames: Record<string, string[]> = {
      neodate: ['alice', 'bob', 'admin', 'test'],
      star: ['alice', 'admin'],
      spiral: ['bob'],
      tulip: [],
    }

    // Check availability when name or TLD changes
    createEffect(() => {
      const currentName = name()
      const currentTld = tld()

      if (currentName.length < 3) {
        setStatus('idle')
        return
      }

      setStatus('checking')
      setTimeout(() => {
        const taken = takenNames[currentTld] ?? []
        setStatus(taken.includes(currentName) ? 'invalid' : 'valid')
      }, 500)
    })

    return (
      <ChooseName
        name={name()}
        onNameChange={setName}
        selectedTld={tld()}
        onTldChange={setTld}
        status={status()}
        step={3}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Registered: ${name()}.${tld()}`)}
      />
    )
  },
}

/** S1.4: Region */
export const S1_4_Region: Story = {
  name: 'S1.4 Region',
  render: () => {
    const [value, setValue] = createSignal<string>()

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="Where are you?"
        step={4}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        onSkip={() => alert('Skipped - storing UNKNOWN')}
        onContinue={() => alert(`Next! Value: ${value()}`)}
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

/** S1.5: Gender */
export const S1_5_Gender: Story = {
  name: 'S1.5 Gender',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('public')

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="How do you identify?"
        step={5}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onSkip={() => alert('Skipped - storing UNKNOWN')}
        onContinue={() => alert(`Next! Value: ${value()}, Visibility: ${visibility()}`)}
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

/** S1.6: Looking For */
export const S1_6_LookingFor: Story = {
  name: 'S1.6 Looking For',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('public')

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="What are you looking for?"
        step={6}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onSkip={() => alert('Skipped - storing UNKNOWN')}
        onContinue={() => alert(`Next! Value: ${value()}, Visibility: ${visibility()}`)}
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

/** S1.7: Relationship Structure */
export const S1_7_RelationshipStructure: Story = {
  name: 'S1.7 Relationship Structure',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="What's your relationship style?"
        step={7}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onSkip={() => alert('Skipped - storing UNKNOWN')}
        onContinue={() => alert(`Next! Value: ${value()}, Visibility: ${visibility()}`)}
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

/** S1.8: Kids */
export const S1_8_Kids: Story = {
  name: 'S1.8 Kids',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="Do you have kids?"
        step={8}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onSkip={() => alert('Skipped - storing UNKNOWN')}
        onContinue={() => alert(`Next! Value: ${value()}, Visibility: ${visibility()}`)}
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

/** S1.9: Religion */
export const S1_9_Religion: Story = {
  name: 'S1.9 Religion',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="What do you believe?"
        step={9}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onSkip={() => alert('Skipped - storing UNKNOWN')}
        onContinue={() => alert(`Next! Value: ${value()}, Visibility: ${visibility()}`)}
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

/** S1.10: Group Play */
export const S1_10_GroupPlay: Story = {
  name: 'S1.10 Group Play',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('private')

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="Into group play?"
        step={10}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back!')}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onSkip={() => alert('Skipped - storing UNKNOWN')}
        onContinue={() => alert('Moving to Dealbreakers phase!')}
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
// S1.11: PREVIEW - Review before committing
// =============================================================================

/** S1.11: Profile Preview - grouped by visibility */
export const S1_11_Preview: Story = {
  name: 'S1.11 Preview',
  render: () => {
    // Mock data from previous steps
    const profile = {
      photoUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=sakura&backgroundColor=ffdfbf',
      name: 'Sakura',
      domain: 'sakura.neodate',
      fields: [
        { category: 'Status', value: 'Single', visibility: 'match' as const },
        { category: 'Region', value: 'East & Southeast Asia', visibility: 'public' as const },
        { category: 'Gender', value: 'Woman', visibility: 'public' as const },
        { category: 'Seeking', value: 'Relationship', visibility: 'public' as const },
        { category: 'Structure', value: 'Monogamous', visibility: 'match' as const },
        { category: 'Kids', value: 'Want kids', visibility: 'match' as const },
        { category: 'Religion', value: 'Buddhist/Hindu', visibility: 'match' as const },
        { category: 'Group play', value: 'Not interested', visibility: 'private' as const },
      ],
    }

    const publicFields = () => profile.fields.filter(f => f.visibility === 'public')
    const matchFields = () => profile.fields.filter(f => f.visibility === 'match')
    const privateFields = () => profile.fields.filter(f => f.visibility === 'private')

    return (
      <OnboardingStep
        sectionLabel="Preview"
        title="Here's your profile"
        subtitle="Review before creating your account."
        step={ABOUT_YOU_TOTAL_STEPS}
        totalSteps={ABOUT_YOU_TOTAL_STEPS}
        canContinue={true}
        onBack={() => alert('Back to Group Play!')}
        onContinue={() => alert('Open AuthModal!')}
        continueText="Create profile"
      >
        <div class="space-y-6">
          {/* Photo + Name */}
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex-shrink-0">
              <img
                src={profile.photoUrl}
                alt={profile.name}
                class="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 class="text-xl font-bold text-foreground">{profile.name}</h2>
              <p class="text-base text-muted-foreground">{profile.domain}</p>
            </div>
          </div>

          {/* Public section */}
          {publicFields().length > 0 && (
            <div>
              <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Public
              </p>
              <div class="grid grid-cols-2 gap-x-6 gap-y-3">
                {publicFields().map(field => (
                  <div class="flex flex-col">
                    <span class="text-sm text-muted-foreground">{field.category}</span>
                    <span class="text-base font-medium text-foreground">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared with matches section */}
          {matchFields().length > 0 && (
            <div>
              <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Shared with matches
              </p>
              <div class="grid grid-cols-2 gap-x-6 gap-y-3">
                {matchFields().map(field => (
                  <div class="flex flex-col">
                    <span class="text-sm text-muted-foreground">{field.category}</span>
                    <span class="text-base font-medium text-foreground">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Private section */}
          {privateFields().length > 0 && (
            <div>
              <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Private
              </p>
              <div class="grid grid-cols-2 gap-x-6 gap-y-3">
                {privateFields().map(field => (
                  <div class="flex flex-col">
                    <span class="text-sm text-muted-foreground">{field.category}</span>
                    <span class="text-base font-medium text-foreground">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </OnboardingStep>
    )
  },
}

// =============================================================================
// S2: DEALBREAKERS (Hard Gates) - stored to Zama/FHE
// Only: Gender, Age, Location
// =============================================================================

const DEALBREAKER_TOTAL_STEPS = 3

/** S2.1: Gender Dealbreaker - Gate */
export const S2_1_GenderDealbreaker: Story = {
  name: 'S2.1 Gender Dealbreaker - Gate',
  render: () => {
    const [choice, setChoice] = createSignal<'open' | 'pick'>()
    const [values, setValues] = createSignal<string[]>([])

    const gateOptions = [
      { value: 'open' as const, label: 'Yes' },
      { value: 'pick' as const, label: 'No' },
    ]

    // Gate screen: "Are you open to all genders?"
    if (!choice() || choice() === 'open') {
      return (
        <OnboardingStep
          sectionLabel="Dealbreakers"
          title="Are you open to all genders?"
          subtitle="Set only what's non-negotiable."
          step={1}
          totalSteps={DEALBREAKER_TOTAL_STEPS}
          canContinue={!!choice()}
          onBack={() => alert('Back to Profile section!')}
          onContinue={() => {
            if (choice() === 'open') {
              alert('No gender dealbreaker - showing all genders')
            }
          }}
        >
          <div class="flex flex-col gap-2">
            {gateOptions.map((option) => {
              const isSelected = () => choice() === option.value
              return (
                <button
                  type="button"
                  onClick={() => setChoice(option.value)}
                  class={`flex items-center gap-3 p-4 rounded-2xl text-left cursor-pointer border transition-colors ${
                    isSelected()
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  {/* Radio dot */}
                  <div
                    class={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected()
                        ? 'border-primary'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {isSelected() && (
                      <div class="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Content */}
                  <span class="font-medium text-foreground">{option.label}</span>
                </button>
              )
            })}
          </div>
        </OnboardingStep>
      )
    }

    // Picker screen: "Who do you want to see?"
    return (
      <OnboardingStep
        sectionLabel="Dealbreakers"
        title="Who do you want to see?"
        subtitle="Set only what's non-negotiable."
        step={1}
        totalSteps={DEALBREAKER_TOTAL_STEPS}
        canContinue={values().length > 0}
        onBack={() => setChoice(undefined)}
        onContinue={() => alert(`Dealbreaker: ${values().join(', ')}`)}
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

/** S2.2: Age Dealbreaker */
export const S2_2_AgeDealbreaker: Story = {
  name: 'S2.2 Age Dealbreaker',
  render: () => {
    const [minAge, setMinAge] = createSignal<string>()
    const [maxAge, setMaxAge] = createSignal<string>()

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

    const handleContinue = () => {
      if (minAge() && maxAge()) {
        alert(`Age dealbreaker: ${minAge()}-${maxAge()}`)
      } else {
        alert('No age dealbreaker - showing all ages')
      }
    }

    return (
      <OnboardingStep
        sectionLabel="Dealbreakers"
        title="Age range"
        subtitle="Set only what's non-negotiable."
        step={2}
        totalSteps={DEALBREAKER_TOTAL_STEPS}
        canContinue={true}
        onBack={() => alert('Back!')}
        onContinue={handleContinue}
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

// Seeking regions without "Prefer not to say" (key 9)
const SEEKING_REGION_OPTIONS = Object.entries(REGION_BUCKET_LABELS)
  .filter(([key]) => key !== '9')
  .map(([value, label]) => ({ value, label }))

/** S2.3: Location Dealbreaker */
export const S2_3_LocationDealbreaker: Story = {
  name: 'S2.3 Location Dealbreaker',
  render: () => {
    const [values, setValues] = createSignal<string[]>([])

    return (
      <OnboardingStep
        sectionLabel="Dealbreakers"
        title="Where should they be?"
        subtitle="Set only what's non-negotiable."
        step={3}
        totalSteps={DEALBREAKER_TOTAL_STEPS}
        canContinue={values().length > 0}
        onBack={() => alert('Back!')}
        onContinue={() => alert(`Region dealbreaker: ${values().join(', ')}`)}
        continueText="Start browsing"
      >
        <ChoiceSelect
          multiple
          options={SEEKING_REGION_OPTIONS}
          value={values()}
          onChange={(v) => setValues(v as string[])}
        />
      </OnboardingStep>
    )
  },
}

// =============================================================================
// S3: CREATE ACCOUNT
// =============================================================================

/** S3.1: Account Method Selection */
export const S3_1_AccountMethod: Story = {
  name: 'S3.1 Account Method',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-2xl mx-auto space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="lock-simple" class="text-4xl text-primary" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Create your account</h1>
              <p class="text-lg text-muted-foreground">
                Your profile is ready. Now secure it with a passkey or wallet.
              </p>
            </div>

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

        <div class="w-full px-6 pb-6">
          <p class="text-sm text-muted-foreground text-center">
            Secured by Lit Protocol. Your identity is portable across apps.
          </p>
        </div>
      </div>
    )
  },
}

/** S3.2: Committing (loading state) */
export const S3_3_Committing: Story = {
  name: 'S3.3 Committing',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-md mx-auto space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Setting up your profile</h1>
              <p class="text-lg text-muted-foreground">
                Encrypting and saving to blockchain...
              </p>
            </div>

            <div class="space-y-2 text-sm text-muted-foreground">
              <p>✓ Encrypting values with FHE</p>
              <p>✓ Generating proof</p>
              <p class="text-foreground">○ Writing to Directory...</p>
              <p class="text-muted-foreground/50">○ Writing to Dating contract...</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
}

/** S3.4: Success */
export const S3_4_Success: Story = {
  name: 'S3.4 Success',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-md mx-auto space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Icon name="check-circle" weight="fill" class="text-4xl text-emerald-500" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">You're all set!</h1>
              <p class="text-lg text-muted-foreground">
                Your profile is live. Start browsing to find your match.
              </p>
            </div>

            <div class="bg-card rounded-2xl p-4 border border-border">
              <p class="text-sm text-muted-foreground mb-1">Your address</p>
              <p class="font-mono text-foreground">0x1234...5678</p>
            </div>
          </div>
        </div>

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
// P: POST-ONBOARDING PREFERENCES (Soft - Filecoin/IPFS)
// =============================================================================

/** P0: Preferences Entry */
export const P0_PreferencesEntry: Story = {
  name: 'P0 Preferences Entry',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-md mx-auto space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="funnel" class="text-4xl text-primary" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Improve recommendations</h1>
              <p class="text-lg text-muted-foreground">
                Add preferences to help us show you better matches. These don't hide anyone.
              </p>
            </div>

            <div class="text-left bg-card rounded-2xl p-4 border border-border">
              <p class="text-sm text-muted-foreground mb-3">Preferences are different from dealbreakers:</p>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <Icon name="check" weight="bold" class="text-green-400 text-sm" />
                  <span class="text-sm text-foreground">Used to rank and sort profiles</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="check" weight="bold" class="text-green-400 text-sm" />
                  <span class="text-sm text-foreground">Optionally shared with matches</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="x" weight="bold" class="text-red-400 text-sm" />
                  <span class="text-sm text-foreground">Never hide profiles from you</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full px-6 pb-6">
          <div class="max-w-md mx-auto space-y-3">
            <button
              class="w-full h-14 px-10 text-lg font-medium rounded-full bg-primary text-primary-foreground"
              onClick={() => alert('Start preferences survey')}
            >
              Add preferences
            </button>
            <button
              class="w-full text-center text-muted-foreground hover:text-foreground py-2"
              onClick={() => alert('Skip for now')}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    )
  },
}

/** P1: Preference Builder Example */
export const P1_PreferenceBuilder: Story = {
  name: 'P1 Preference Builder',
  render: () => {
    const [values, setValues] = createSignal<string[]>([])
    const [privacy, setPrivacy] = createSignal<'private' | 'match' | 'public'>('private')

    return (
      <OnboardingStep
        variant="modal"
        headerTitle="Preferences"
        sectionLabel="Preferences"
        title="Relationship style preferences?"
        subtitle="Select what you're open to"
        canContinue={values().length > 0}
        onBack={() => alert('Close!')}
        onSkip={() => alert('Skip this preference')}
        onContinue={() => alert(`Saved! Values: ${values().join(', ')}, Privacy: ${privacy()}`)}
        continueText="Save"
      >
        <ChoiceSelect
          multiple
          options={toOptions(RELATIONSHIP_STRUCTURE_LABELS)}
          value={values()}
          onChange={(v) => setValues(v as string[])}
        />

        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">Who can see this preference?</p>
          <div class="flex gap-2">
            {[
              { value: 'private', label: 'Only me', icon: 'eye-slash' },
              { value: 'match', label: 'Matches', icon: 'users' },
              { value: 'public', label: 'Anyone', icon: 'globe' },
            ].map((opt) => (
              <button
                class={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors ${
                  privacy() === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => setPrivacy(opt.value as typeof privacy extends () => infer T ? T : never)}
              >
                <Icon name={opt.icon as any} class="w-4 h-4" />
                <span class="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </OnboardingStep>
    )
  },
}

/** P2: Storage Choice */
export const P2_StorageChoice: Story = {
  name: 'P2 Storage Choice',
  render: () => {
    const [storage, setStorage] = createSignal<'ipfs' | 'filecoin'>('ipfs')

    return (
      <div class="flex flex-col items-center h-screen bg-background">
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-md mx-auto space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="globe" class="text-4xl text-primary" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Where to save?</h1>
              <p class="text-lg text-muted-foreground">
                Your preferences are encrypted. Choose where to store them.
              </p>
            </div>

            <div class="space-y-3 text-left">
              <button
                class={`w-full p-4 rounded-2xl border text-left transition-colors ${
                  storage() === 'ipfs'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => setStorage('ipfs')}
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="globe" class="text-blue-500" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-foreground">IPFS</p>
                    <p class="text-sm text-muted-foreground">Free — we pin it for you</p>
                  </div>
                  <div class={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    storage() === 'ipfs' ? 'border-primary' : 'border-muted-foreground/30'
                  }`}>
                    {storage() === 'ipfs' && <div class="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
              </button>

              <button
                class={`w-full p-4 rounded-2xl border text-left transition-colors ${
                  storage() === 'filecoin'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => setStorage('filecoin')}
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="lock-simple" class="text-green-500" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-foreground">Filecoin</p>
                    <p class="text-sm text-muted-foreground">You pay USDFC + FIL gas — you own it</p>
                  </div>
                  <div class={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    storage() === 'filecoin' ? 'border-primary' : 'border-muted-foreground/30'
                  }`}>
                    {storage() === 'filecoin' && <div class="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="w-full px-6 pb-6">
          <div class="max-w-md mx-auto">
            <button
              class="w-full h-14 px-10 text-lg font-medium rounded-full bg-primary text-primary-foreground"
              onClick={() => alert(`Saving to ${storage()}...`)}
            >
              Save preferences
            </button>
          </div>
        </div>
      </div>
    )
  },
}

/** P3: Consent for Recommendations */
export const P3_RecommendationConsent: Story = {
  name: 'P3 Recommendation Consent',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
        <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div class="max-w-md mx-auto space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="sparkle" class="text-4xl text-primary" />
            </div>

            <div class="space-y-3">
              <h1 class="text-3xl font-bold text-foreground">Better recommendations?</h1>
              <p class="text-lg text-muted-foreground">
                Allow Neodate to use your encrypted preferences for personalized recommendations.
              </p>
            </div>

            <div class="text-left bg-card rounded-2xl p-4 border border-border space-y-3">
              <div class="flex items-start gap-3">
                <Icon name="check" weight="bold" class="text-green-400 mt-0.5" />
                <p class="text-sm text-foreground">Better match suggestions based on your preferences</p>
              </div>
              <div class="flex items-start gap-3">
                <Icon name="check" weight="bold" class="text-green-400 mt-0.5" />
                <p class="text-sm text-foreground">You can revoke access anytime</p>
              </div>
              <div class="flex items-start gap-3">
                <Icon name="lock-simple" weight="bold" class="text-blue-400 mt-0.5" />
                <p class="text-sm text-foreground">Your data stays encrypted — we only see what we need</p>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full px-6 pb-6">
          <div class="max-w-md mx-auto space-y-3">
            <button
              class="w-full h-14 px-10 text-lg font-medium rounded-full bg-primary text-primary-foreground"
              onClick={() => alert('Allowed until revoked')}
            >
              Allow until revoked
            </button>
            <button
              class="w-full h-12 px-6 text-base font-medium rounded-full border border-border hover:bg-secondary/50"
              onClick={() => alert('Allowed for 24h')}
            >
              Allow for 24 hours
            </button>
            <button
              class="w-full text-center text-muted-foreground hover:text-foreground py-2"
              onClick={() => alert('Not now')}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    )
  },
}

// =============================================================================
// VERIFICATION (Self.xyz - after browsing)
// =============================================================================

/** Verification: Prompt */
export const Verify_Prompt: Story = {
  name: 'Verify: Prompt',
  render: () => {
    return (
      <div class="flex flex-col items-center h-screen bg-background">
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
