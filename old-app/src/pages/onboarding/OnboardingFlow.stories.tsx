import type { Meta, StoryObj } from 'storybook-solidjs'
import { createSignal } from 'solid-js'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { DealbreakerToggle } from '@/components/ui/dealbreaker-toggle'
import { type Visibility } from '@/components/ui/visibility-select'
import { Icon } from '@/components/icons'
import {
  RELATIONSHIP_STATUS_LABELS,
  RELATIONSHIP_STRUCTURE_LABELS,
} from '@/components/profile/ProfileBadge'

const meta: Meta = {
  title: 'Onboarding/New Flow (Profile → Preferences)',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

const toOptions = (labels: Record<number, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

// =============================================================================
// PROFILE PHASE - All "About Me" steps (with Visibility toggle)
// =============================================================================

const PROFILE_TOTAL_STEPS = 12

/** Profile 1: Photo */
export const Profile_01_Photo: Story = {
  name: '1. Profile: Photo',
  render: () => (
    <OnboardingStep
      sectionLabel="Profile"
      title="Got a photo?"
      subtitle="Your main avatar is public and portable on Ethereum."
      step={1}
      totalSteps={PROFILE_TOTAL_STEPS}
      canContinue={false}
      onBack={() => alert('Exit')}
      onSkip={() => alert('Skip photo')}
    >
      <div class="w-32 h-32 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
        <Icon name="camera" class="w-12 h-12 text-muted-foreground" />
      </div>
    </OnboardingStep>
  ),
}

/** Profile 7: Kids Status - "Do you have children?" */
export const Profile_07_KidsStatus: Story = {
  name: '7. Profile: Kids Status (have kids?)',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    // New simplified options - just about having kids, not wanting them
    const options = [
      { value: '1', label: 'No children' },
      { value: '2', label: 'Have children' },
    ]

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="Do you have children?"
        step={7}
        totalSteps={PROFILE_TOTAL_STEPS}
        canContinue={!!value()}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onBack={() => alert('Back')}
        onContinue={() => alert(`Value: ${value()}, Visibility: ${visibility()}`)}
      >
        <ChoiceSelect
          options={options}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

/** Profile 8: Family Plans - "Do you want children in the future?" (NEW) */
export const Profile_08_FamilyPlans: Story = {
  name: '8. Profile: Family Plans (want kids?) [NEW]',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [visibility, setVisibility] = createSignal<Visibility>('match')

    // New field - your own plans for having children
    const options = [
      { value: 'yes', label: 'Yes, I want children' },
      { value: 'no', label: "No, I don't want children" },
      { value: 'open', label: 'Open / Unsure' },
    ]

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="Do you want children in the future?"
        step={8}
        totalSteps={PROFILE_TOTAL_STEPS}
        canContinue={!!value()}
        visibility={visibility()}
        onVisibilityChange={setVisibility}
        onBack={() => alert('Back')}
        onContinue={() => alert(`Value: ${value()}, Visibility: ${visibility()}`)}
      >
        <ChoiceSelect
          options={options}
          value={value() ?? ''}
          onChange={setValue}
        />
      </OnboardingStep>
    )
  },
}

/** Profile 11: Preview */
export const Profile_11_Preview: Story = {
  name: '11. Profile: Preview',
  render: () => {
    const profile = {
      photoUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=sakura&backgroundColor=ffdfbf',
      name: 'Sakura',
      domain: 'sakura.neodate',
      fields: [
        { category: 'Region', value: 'East Asia', visibility: 'public' as const },
        { category: 'Gender', value: 'Woman', visibility: 'public' as const },
        { category: 'Looking for', value: 'Relationship', visibility: 'public' as const },
        { category: 'Status', value: 'Single', visibility: 'match' as const },
        { category: 'Structure', value: 'Monogamous', visibility: 'match' as const },
        { category: 'Has kids', value: 'No children', visibility: 'match' as const },
        { category: 'Wants kids', value: 'Yes, I want children', visibility: 'match' as const },
        { category: 'Religion', value: 'Buddhist', visibility: 'match' as const },
        { category: 'Group play', value: 'Not interested', visibility: 'private' as const },
      ],
    }

    const publicFields = () => profile.fields.filter(f => f.visibility === 'public')
    const matchFields = () => profile.fields.filter(f => f.visibility === 'match')
    const privateFields = () => profile.fields.filter(f => f.visibility === 'private')

    return (
      <OnboardingStep
        sectionLabel="Profile"
        title="Here's your profile"
        subtitle="Review before creating your account."
        step={PROFILE_TOTAL_STEPS}
        totalSteps={PROFILE_TOTAL_STEPS}
        canContinue={true}
        onBack={() => alert('Back')}
        onContinue={() => alert('Create profile → Commit → Preferences')}
        continueText="Create profile"
      >
        <div class="space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex-shrink-0">
              <img src={profile.photoUrl} alt={profile.name} class="w-full h-full object-cover" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-foreground">{profile.name}</h2>
              <p class="text-base text-muted-foreground">{profile.domain}</p>
            </div>
          </div>

          {publicFields().length > 0 && (
            <div>
              <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Public</p>
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

          {matchFields().length > 0 && (
            <div>
              <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Shared with matches</p>
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

          {privateFields().length > 0 && (
            <div>
              <p class="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Private (matching only)</p>
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
// TRANSITION: Profile Complete → Now Set Preferences
// =============================================================================

/** Transition screen after profile commit */
export const Transition_ProfileComplete: Story = {
  name: '12. Transition: Now set preferences',
  render: () => (
    <div class="flex flex-col items-center h-screen bg-background">
      <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div class="max-w-md mx-auto space-y-6">
          <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Icon name="check-circle" weight="fill" class="text-4xl text-emerald-500" />
          </div>

          <div class="space-y-3">
            <h1 class="text-3xl font-bold text-foreground">Profile created!</h1>
            <p class="text-lg text-muted-foreground">
              Now set your preferences to filter who you see.
            </p>
          </div>

          <div class="text-left bg-card rounded-2xl p-4 border border-border space-y-2">
            <p class="text-sm font-medium text-foreground mb-2">What's next:</p>
            <div class="flex items-center gap-2">
              <Icon name="funnel" class="text-primary" />
              <span class="text-sm text-muted-foreground">Set who you want to see</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="warning" class="text-amber-500" />
              <span class="text-sm text-muted-foreground">Mark dealbreakers to hide profiles</span>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full px-6 pb-6">
        <div class="max-w-md mx-auto">
          <button
            class="w-full h-14 px-10 text-lg font-medium rounded-full bg-primary text-primary-foreground"
            onClick={() => alert('Continue to preferences')}
          >
            Set preferences
          </button>
        </div>
      </div>
    </div>
  ),
}

// =============================================================================
// PREFERENCES PHASE - All "What I Want" steps (with Dealbreaker toggle)
// =============================================================================

const PREFERENCES_TOTAL_STEPS = 6

/** Preferences 1: Seeking Genders (always strict) */
export const Preferences_01_SeekingGenders: Story = {
  name: '13. Preferences: Seeking Genders',
  render: () => {
    const [values, setValues] = createSignal<string[]>([])

    const options = [
      { value: '1', label: 'Woman' },
      { value: '2', label: 'Man' },
      { value: '3', label: 'Non-binary' },
      { value: '4', label: 'Trans woman' },
      { value: '5', label: 'Trans man' },
    ]

    return (
      <OnboardingStep
        sectionLabel="Preferences"
        title="Who do you want to see?"
        subtitle="Select all that apply. This is always a dealbreaker."
        step={1}
        totalSteps={PREFERENCES_TOTAL_STEPS}
        canContinue={values().length > 0}
        onBack={() => alert('Back')}
        onContinue={() => alert(`Genders: ${values().join(', ')}`)}
      >
        <ChoiceSelect
          multiple
          options={options}
          value={values()}
          onChange={(v) => setValues(v as string[])}
        />

        {/* Gender is always strict - no toggle, just info */}
        <div class="flex items-center gap-3 p-4 rounded-2xl border border-amber-500/50 bg-amber-500/5">
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Icon name="funnel" weight="fill" class="w-[18px] h-[18px] text-amber-500" />
          </div>
          <div>
            <span class="font-medium text-foreground">Always a dealbreaker</span>
            <p class="text-sm text-muted-foreground">Profiles outside your selection won't appear</p>
          </div>
        </div>
      </OnboardingStep>
    )
  },
}

/** Preferences 4: Partner Relationship Structure - 3-state with dealbreaker toggle */
export const Preferences_04_PartnerRelationshipStructure: Story = {
  name: '16. Preferences: Partner Relationship Structure',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [dealbreaker, setDealbreaker] = createSignal(true) // Default ON

    // 3-state options
    const options = [
      { value: 'mono', label: 'Monogamous' },
      { value: 'non-mono', label: 'Non-monogamous' },
      { value: 'doesnt-matter', label: "Doesn't matter" },
    ]

    const isDoesntMatter = () => value() === 'doesnt-matter'

    return (
      <OnboardingStep
        sectionLabel="Preferences"
        title="Partner's relationship style?"
        subtitle="What are you open to?"
        step={4}
        totalSteps={PREFERENCES_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back')}
        onContinue={() => alert(`Value: ${value()}, Dealbreaker: ${dealbreaker()}`)}
      >
        <ChoiceSelect
          options={options}
          value={value() ?? ''}
          onChange={setValue}
        />

        {/* Dealbreaker toggle - disabled when "doesn't matter" */}
        <div
          class={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${
            isDoesntMatter()
              ? 'border-border bg-card opacity-50'
              : dealbreaker()
                ? 'border-amber-500/50 bg-amber-500/5'
                : 'border-border bg-card'
          }`}
        >
          <div class="flex items-start gap-3">
            <div
              class={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDoesntMatter()
                  ? 'bg-secondary text-muted-foreground'
                  : dealbreaker()
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              <Icon name="funnel" weight={dealbreaker() && !isDoesntMatter() ? 'fill' : 'regular'} class="w-[18px] h-[18px]" />
            </div>
            <div class="min-w-0">
              <span class="font-medium text-foreground">Dealbreaker</span>
              <p class="text-sm text-muted-foreground">
                {isDoesntMatter()
                  ? "Dealbreaker doesn't apply when you choose 'Doesn't matter'"
                  : dealbreaker()
                    ? 'Hide profiles outside this relationship style'
                    : 'Show all regardless of relationship style'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dealbreaker()}
            disabled={isDoesntMatter()}
            onClick={() => !isDoesntMatter() && setDealbreaker(!dealbreaker())}
            class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDoesntMatter()
                ? 'bg-secondary cursor-not-allowed'
                : dealbreaker()
                  ? 'bg-primary'
                  : 'bg-secondary'
            }`}
          >
            <span
              class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                dealbreaker() && !isDoesntMatter() ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </OnboardingStep>
    )
  },
}

/** Preferences 5: Partner Has Kids - 3-state with dealbreaker toggle */
export const Preferences_05_PartnerHasKids: Story = {
  name: '17. Preferences: Partner Has Kids',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [dealbreaker, setDealbreaker] = createSignal(false) // Default OFF

    const options = [
      { value: 'yes', label: 'Yes, has children' },
      { value: 'no', label: 'No children' },
      { value: 'doesnt-matter', label: "Doesn't matter" },
    ]

    const isDoesntMatter = () => value() === 'doesnt-matter'

    return (
      <OnboardingStep
        sectionLabel="Preferences"
        title="Partner has children?"
        subtitle="What are you open to?"
        step={5}
        totalSteps={PREFERENCES_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back')}
        onContinue={() => alert(`Value: ${value()}, Dealbreaker: ${dealbreaker()}`)}
      >
        <ChoiceSelect
          options={options}
          value={value() ?? ''}
          onChange={setValue}
        />

        {/* Dealbreaker toggle - disabled when "doesn't matter" */}
        <div
          class={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${
            isDoesntMatter()
              ? 'border-border bg-card opacity-50'
              : dealbreaker()
                ? 'border-amber-500/50 bg-amber-500/5'
                : 'border-border bg-card'
          }`}
        >
          <div class="flex items-start gap-3">
            <div
              class={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDoesntMatter()
                  ? 'bg-secondary text-muted-foreground'
                  : dealbreaker()
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              <Icon name="funnel" weight={dealbreaker() && !isDoesntMatter() ? 'fill' : 'regular'} class="w-[18px] h-[18px]" />
            </div>
            <div class="min-w-0">
              <span class="font-medium text-foreground">Dealbreaker</span>
              <p class="text-sm text-muted-foreground">
                {isDoesntMatter()
                  ? "Dealbreaker doesn't apply when you choose 'Doesn't matter'"
                  : dealbreaker()
                    ? 'Hide profiles outside this selection'
                    : 'Show all regardless of children'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dealbreaker()}
            disabled={isDoesntMatter()}
            onClick={() => !isDoesntMatter() && setDealbreaker(!dealbreaker())}
            class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDoesntMatter()
                ? 'bg-secondary cursor-not-allowed'
                : dealbreaker()
                  ? 'bg-primary'
                  : 'bg-secondary'
            }`}
          >
            <span
              class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                dealbreaker() && !isDoesntMatter() ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </OnboardingStep>
    )
  },
}

/** Preferences 6: Partner Wants Kids - 3-state with dealbreaker toggle */
export const Preferences_06_PartnerWantsKids: Story = {
  name: '18. Preferences: Partner Wants Kids',
  render: () => {
    const [value, setValue] = createSignal<string>()
    const [dealbreaker, setDealbreaker] = createSignal(false) // Default OFF

    const options = [
      { value: 'yes', label: 'Yes, wants children' },
      { value: 'no', label: "Doesn't want children" },
      { value: 'doesnt-matter', label: "Doesn't matter" },
    ]

    const isDoesntMatter = () => value() === 'doesnt-matter'

    return (
      <OnboardingStep
        sectionLabel="Preferences"
        title="Partner wants children?"
        subtitle="What are you open to?"
        step={6}
        totalSteps={PREFERENCES_TOTAL_STEPS}
        canContinue={!!value()}
        onBack={() => alert('Back')}
        onContinue={() => alert('Done! Start browsing')}
        continueText="Start browsing"
      >
        <ChoiceSelect
          options={options}
          value={value() ?? ''}
          onChange={setValue}
        />

        {/* Dealbreaker toggle - disabled when "doesn't matter" */}
        <div
          class={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${
            isDoesntMatter()
              ? 'border-border bg-card opacity-50'
              : dealbreaker()
                ? 'border-amber-500/50 bg-amber-500/5'
                : 'border-border bg-card'
          }`}
        >
          <div class="flex items-start gap-3">
            <div
              class={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDoesntMatter()
                  ? 'bg-secondary text-muted-foreground'
                  : dealbreaker()
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              <Icon name="funnel" weight={dealbreaker() && !isDoesntMatter() ? 'fill' : 'regular'} class="w-[18px] h-[18px]" />
            </div>
            <div class="min-w-0">
              <span class="font-medium text-foreground">Dealbreaker</span>
              <p class="text-sm text-muted-foreground">
                {isDoesntMatter()
                  ? "Dealbreaker doesn't apply when you choose 'Doesn't matter'"
                  : dealbreaker()
                    ? 'Hide profiles outside this selection'
                    : 'Show all regardless of family plans'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dealbreaker()}
            disabled={isDoesntMatter()}
            onClick={() => !isDoesntMatter() && setDealbreaker(!dealbreaker())}
            class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDoesntMatter()
                ? 'bg-secondary cursor-not-allowed'
                : dealbreaker()
                  ? 'bg-primary'
                  : 'bg-secondary'
            }`}
          >
            <span
              class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                dealbreaker() && !isDoesntMatter() ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </OnboardingStep>
    )
  },
}

// =============================================================================
// SUMMARY: The Complete Flow
// =============================================================================

/** Summary of the new architecture */
export const _00_FlowSummary: Story = {
  name: '0. Flow Summary',
  render: () => (
    <div class="min-h-screen bg-background p-8">
      <div class="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 class="text-2xl font-bold text-foreground mb-2">New Onboarding Architecture</h1>
          <p class="text-muted-foreground">Clean separation: Profile (about me) → Preferences (what I want)</p>
        </div>

        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</span>
            Profile Phase (Visibility toggle)
          </h2>
          <div class="ml-10 space-y-2 text-sm">
            <p class="text-foreground">1. Photo</p>
            <p class="text-foreground">2. Name</p>
            <p class="text-foreground">3. Region</p>
            <p class="text-foreground">4. Gender</p>
            <p class="text-foreground">5. Relationship status</p>
            <p class="text-foreground">6. Relationship structure</p>
            <p class="text-foreground">7. Children status <span class="text-muted-foreground">("Do you have children?")</span></p>
            <p class="text-foreground font-medium text-primary">8. Family plans <span class="text-muted-foreground">("Do you want children?" - NEW)</span></p>
            <p class="text-foreground">9. Looking for</p>
            <p class="text-foreground">10. Religion</p>
            <p class="text-foreground">11. Group play</p>
            <p class="text-foreground">12. Preview</p>
          </div>
        </div>

        <div class="border-t border-border pt-4">
          <p class="text-center text-muted-foreground italic">— Create Profile / Commit to Chain —</p>
        </div>

        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm font-bold">2</span>
            Preferences Phase (Dealbreaker toggle)
          </h2>
          <div class="ml-10 space-y-2 text-sm">
            <p class="text-foreground">1. Seeking genders <span class="text-amber-500">(always strict)</span></p>
            <p class="text-foreground">2. Seeking age range <span class="text-muted-foreground">(strict ON default)</span></p>
            <p class="text-foreground">3. Seeking regions <span class="text-muted-foreground">(strict ON default)</span></p>
            <p class="text-foreground">4. Partner relationship structure <span class="text-muted-foreground">(strict ON default)</span></p>
            <p class="text-foreground">5. Partner has kids <span class="text-muted-foreground">(strict OFF default)</span></p>
            <p class="text-foreground">6. Partner wants kids <span class="text-muted-foreground">(strict OFF default)</span></p>
          </div>
        </div>

        <div class="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h3 class="font-semibold text-foreground">Key Rules</h3>
          <ul class="text-sm space-y-2 text-muted-foreground">
            <li><strong class="text-foreground">Visibility</strong> only on Profile steps (who sees this about me)</li>
            <li><strong class="text-foreground">Dealbreaker</strong> only on Preference steps (hard filter vs soft preference)</li>
            <li><strong class="text-foreground">"Doesn't matter"</strong> = no filter, dealbreaker toggle disabled (greyed out)</li>
            <li>No step has both Visibility AND Dealbreaker</li>
          </ul>
        </div>
      </div>
    </div>
  ),
}
