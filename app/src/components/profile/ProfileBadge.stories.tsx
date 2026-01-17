import type { Meta, StoryObj } from 'storybook-solidjs'
import {
  ProfileBadge,
  AGE_BUCKET_LABELS,
  BIOLOGICAL_SEX_LABELS,
  NATIONALITY_LABELS,
  GENDER_IDENTITY_LABELS,
  LOOKING_FOR_LABELS,
  SMOKING_LABELS,
  DRINKING_LABELS,
  BODY_BUCKET_LABELS,
  FITNESS_BUCKET_LABELS,
  KIDS_LABELS,
  KIDS_TIMELINE_LABELS,
  RELATIONSHIP_STRUCTURE_LABELS,
  RELIGION_LABELS,
  KINK_LEVEL_LABELS,
} from './ProfileBadge'

const meta: Meta<typeof ProfileBadge> = {
  title: 'Profile/ProfileBadge',
  component: ProfileBadge,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div class="p-8 bg-background">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProfileBadge>

// =============================================================================
// ATTESTED: Age (Directory.sol - from passport)
// =============================================================================

export const Age_18_24: Story = {
  args: { category: 'Age', value: AGE_BUCKET_LABELS[1], attested: true },
}

export const Age_25_29: Story = {
  args: { category: 'Age', value: AGE_BUCKET_LABELS[2], attested: true },
}

export const Age_30_34: Story = {
  args: { category: 'Age', value: AGE_BUCKET_LABELS[3], attested: true },
}

export const Age_35_39: Story = {
  args: { category: 'Age', value: AGE_BUCKET_LABELS[4], attested: true },
}

export const Age_40_49: Story = {
  args: { category: 'Age', value: AGE_BUCKET_LABELS[5], attested: true },
}

export const Age_50_Plus: Story = {
  args: { category: 'Age', value: AGE_BUCKET_LABELS[6], attested: true },
}

// =============================================================================
// ATTESTED: Biological Sex (Dating.sol - encrypted, revealed on match)
// =============================================================================

export const Sex_Male: Story = {
  args: { category: 'Sex', value: BIOLOGICAL_SEX_LABELS[0], attested: true },
}

export const Sex_Female: Story = {
  args: { category: 'Sex', value: BIOLOGICAL_SEX_LABELS[1], attested: true },
}

// =============================================================================
// ATTESTED: Nationality (Self.xyz passport)
// =============================================================================

export const Nationality_USA: Story = {
  args: { category: 'Nationality', value: NATIONALITY_LABELS.USA, attested: true },
}

export const Nationality_UK: Story = {
  args: { category: 'Nationality', value: NATIONALITY_LABELS.GBR, attested: true },
}

export const Nationality_Japan: Story = {
  args: { category: 'Nationality', value: NATIONALITY_LABELS.JPN, attested: true },
}

export const Nationality_Germany: Story = {
  args: { category: 'Nationality', value: NATIONALITY_LABELS.DEU, attested: true },
}

export const Nationality_Brazil: Story = {
  args: { category: 'Nationality', value: NATIONALITY_LABELS.BRA, attested: true },
}

export const Nationality_Australia: Story = {
  args: { category: 'Nationality', value: NATIONALITY_LABELS.AUS, attested: true },
}

// =============================================================================
// USER-SET: Gender Identity (Directory.sol)
// =============================================================================

export const Gender_Man: Story = {
  args: { category: 'Gender', value: GENDER_IDENTITY_LABELS[1] },
}

export const Gender_Woman: Story = {
  args: { category: 'Gender', value: GENDER_IDENTITY_LABELS[2] },
}

export const Gender_NonBinary: Story = {
  args: { category: 'Gender', value: GENDER_IDENTITY_LABELS[3] },
}

export const Gender_TransMan: Story = {
  args: { category: 'Gender', value: GENDER_IDENTITY_LABELS[4] },
}

export const Gender_TransWoman: Story = {
  args: { category: 'Gender', value: GENDER_IDENTITY_LABELS[5] },
}

// =============================================================================
// USER-SET: Seeking (Directory.sol)
// =============================================================================

export const LookingFor_Casual: Story = {
  args: { category: 'Seeking', value: LOOKING_FOR_LABELS[1] },
}

export const LookingFor_Dating: Story = {
  args: { category: 'Seeking', value: LOOKING_FOR_LABELS[2] },
}

export const LookingFor_Relationship: Story = {
  args: { category: 'Seeking', value: LOOKING_FOR_LABELS[3] },
}

export const LookingFor_Marriage: Story = {
  args: { category: 'Seeking', value: LOOKING_FOR_LABELS[4] },
}

// =============================================================================
// USER-SET: Smoking (Directory.sol)
// =============================================================================

export const Smoking_Never: Story = {
  args: { category: 'Smoking', value: SMOKING_LABELS[1] },
}

export const Smoking_Sometimes: Story = {
  args: { category: 'Smoking', value: SMOKING_LABELS[2] },
}

export const Smoking_Regularly: Story = {
  args: { category: 'Smoking', value: SMOKING_LABELS[3] },
}

// =============================================================================
// USER-SET: Drinking (Directory.sol)
// =============================================================================

export const Drinking_Never: Story = {
  args: { category: 'Drinking', value: DRINKING_LABELS[1] },
}

export const Drinking_Socially: Story = {
  args: { category: 'Drinking', value: DRINKING_LABELS[2] },
}

export const Drinking_Regularly: Story = {
  args: { category: 'Drinking', value: DRINKING_LABELS[3] },
}

// =============================================================================
// USER-SET: Body Type (Directory.sol)
// =============================================================================

export const Body_Slim: Story = {
  args: { category: 'Body', value: BODY_BUCKET_LABELS[1] },
}

export const Body_Athletic: Story = {
  args: { category: 'Body', value: BODY_BUCKET_LABELS[2] },
}

export const Body_Average: Story = {
  args: { category: 'Body', value: BODY_BUCKET_LABELS[3] },
}

export const Body_Curvy: Story = {
  args: { category: 'Body', value: BODY_BUCKET_LABELS[4] },
}

export const Body_Large: Story = {
  args: { category: 'Body', value: BODY_BUCKET_LABELS[5] },
}

// =============================================================================
// USER-SET: Fitness Level (Directory.sol)
// =============================================================================

export const Fitness_NotActive: Story = {
  args: { category: 'Fitness', value: FITNESS_BUCKET_LABELS[1] },
}

export const Fitness_Light: Story = {
  args: { category: 'Fitness', value: FITNESS_BUCKET_LABELS[2] },
}

export const Fitness_Moderate: Story = {
  args: { category: 'Fitness', value: FITNESS_BUCKET_LABELS[3] },
}

export const Fitness_VeryActive: Story = {
  args: { category: 'Fitness', value: FITNESS_BUCKET_LABELS[4] },
}

export const Fitness_Athlete: Story = {
  args: { category: 'Fitness', value: FITNESS_BUCKET_LABELS[5] },
}

// =============================================================================
// PRIVATE: Kids (Dating.sol - encrypted)
// =============================================================================

export const Kids_DontHaveDontWant: Story = {
  args: { category: 'Kids', value: KIDS_LABELS[1] },
}

export const Kids_DontHaveWant: Story = {
  args: { category: 'Kids', value: KIDS_LABELS[2] },
}

export const Kids_DontHaveOpen: Story = {
  args: { category: 'Kids', value: KIDS_LABELS[3] },
}

export const Kids_Have: Story = {
  args: { category: 'Kids', value: KIDS_LABELS[4] },
}

export const Kids_HaveWantMore: Story = {
  args: { category: 'Kids', value: KIDS_LABELS[5] },
}

export const Kids_HaveDone: Story = {
  args: { category: 'Kids', value: KIDS_LABELS[6] },
}

// =============================================================================
// PRIVATE: Relationship Structure (Dating.sol - encrypted)
// =============================================================================

export const Relationship_Monogamous: Story = {
  args: { category: 'Relationship', value: RELATIONSHIP_STRUCTURE_LABELS[1] },
}

export const Relationship_Open: Story = {
  args: { category: 'Relationship', value: RELATIONSHIP_STRUCTURE_LABELS[2] },
}

export const Relationship_Poly: Story = {
  args: { category: 'Relationship', value: RELATIONSHIP_STRUCTURE_LABELS[3] },
}

export const Relationship_Anarchy: Story = {
  args: { category: 'Relationship', value: RELATIONSHIP_STRUCTURE_LABELS[4] },
}

// =============================================================================
// PRIVATE: Religion (Dating.sol - encrypted)
// =============================================================================

export const Religion_NotReligious: Story = {
  args: { category: 'Religion', value: RELIGION_LABELS[1] },
}

export const Religion_Spiritual: Story = {
  args: { category: 'Religion', value: RELIGION_LABELS[2] },
}

export const Religion_Christian: Story = {
  args: { category: 'Religion', value: RELIGION_LABELS[3] },
}

export const Religion_Jewish: Story = {
  args: { category: 'Religion', value: RELIGION_LABELS[4] },
}

export const Religion_Muslim: Story = {
  args: { category: 'Religion', value: RELIGION_LABELS[5] },
}

export const Religion_BuddhistHindu: Story = {
  args: { category: 'Religion', value: RELIGION_LABELS[6] },
}

export const Religion_Other: Story = {
  args: { category: 'Religion', value: RELIGION_LABELS[7] },
}

// =============================================================================
// PRIVATE: Kink Level (Dating.sol - encrypted)
// =============================================================================

export const Kink_VanillaOnly: Story = {
  args: { category: 'Kink', value: KINK_LEVEL_LABELS[1] },
}

export const Kink_VanillaPreferred: Story = {
  args: { category: 'Kink', value: KINK_LEVEL_LABELS[2] },
}

export const Kink_OpenMinded: Story = {
  args: { category: 'Kink', value: KINK_LEVEL_LABELS[3] },
}

export const Kink_Friendly: Story = {
  args: { category: 'Kink', value: KINK_LEVEL_LABELS[4] },
}

export const Kink_Enthusiast: Story = {
  args: { category: 'Kink', value: KINK_LEVEL_LABELS[5] },
}

export const Kink_VeryKinky: Story = {
  args: { category: 'Kink', value: KINK_LEVEL_LABELS[6] },
}

export const Kink_Lifestyle: Story = {
  args: { category: 'Kink', value: KINK_LEVEL_LABELS[7] },
}
