import type { Component } from 'solid-js'

/**
 * Base step data - shared across all steps
 */
export interface StepData {
  [key: string]: unknown
}

/**
 * Step component props - receives data and onChange
 */
export interface StepComponentProps<T = StepData> {
  data: T
  onChange: (data: Partial<T>) => void
  onNext?: () => void
}

/**
 * Step metadata - defines how a step appears and behaves
 */
export interface StepMetadata {
  /** Unique step identifier (not a number, won't change if reordered) */
  id: string
  /** Display title */
  title: string
  /** Optional subtitle/description (string or array for bullet points) */
  subtitle?: string | string[]
  /** Whether this step is required to complete onboarding */
  required?: boolean
  /** Validation function - returns true if step data is valid */
  validate?: (data: StepData) => boolean
}

/**
 * Step definition - combines metadata with component
 */
export interface StepDefinition<T = StepData> {
  meta: StepMetadata
  component: Component<StepComponentProps<T>>
}

/**
 * Step registry - maps step IDs to definitions
 */
export type StepRegistry = Record<string, StepDefinition>
