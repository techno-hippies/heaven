# Onboarding System

Flexible step-based onboarding where steps can be easily reordered without refactoring.

## Key Concepts

### 1. Steps are ID-based, not position-based
Each step has a unique ID (e.g., `'name'`, `'photo'`, `'gender'`). Steps never reference their position or know what comes before/after them.

### 2. Order is defined in ONE place
`config.ts` contains the `onboardingStepOrder` array. To reorder steps, just rearrange this array:

```ts
export const onboardingStepOrder = [
  'name',
  'photo',
  'gender',
] as const
```

Want photo first? Just reorder:

```ts
export const onboardingStepOrder = [
  'photo',    // ← moved up
  'name',
  'gender',
] as const
```

No other code changes needed!

### 3. Adding new steps

1. Create the step component in `steps/`:
```tsx
// steps/AgeStep.tsx
export const AgeStep: Component<StepComponentProps<AgeStepData>> = (props) => {
  // ...
}

export const ageStepMeta: StepMetadata = {
  id: 'age',
  title: 'How old are you?',
  required: true,
  validate: (data) => /* ... */,
}
```

2. Register it in `steps/index.ts`:
```ts
import { AgeStep, ageStepMeta } from './AgeStep'

export const stepRegistry: StepRegistry = {
  // ...
  age: {
    meta: ageStepMeta,
    component: AgeStep as any,
  },
}
```

3. Add ID to order in `config.ts`:
```ts
export const onboardingStepOrder = [
  'name',
  'age',      // ← new step
  'photo',
  'gender',
] as const
```

## Structure

```
features/onboarding/
├── types.ts                 # Step interfaces
├── config.ts                # Step order (edit this to reorder)
├── steps/
│   ├── index.ts             # Step registry
│   ├── NameStep.tsx         # Individual steps
│   ├── PhotoStep.tsx
│   └── GenderStep.tsx
└── components/              # Shared onboarding UI (wrappers, etc.)
```
