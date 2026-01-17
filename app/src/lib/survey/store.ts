/**
 * Survey Store
 *
 * IDB-backed store for survey draft state, following the onboarding store pattern.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import type { SurveyDraft, SurveyAnswer, SurveyTier, SurveySchema } from './types'

// ============ IDB Schema ============

interface SurveyDB extends DBSchema {
  drafts: {
    key: string // schemaId
    value: SurveyDraft
  }
}

const DB_NAME = 'neodate-surveys'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<SurveyDB>> | null = null

function getDB(): Promise<IDBPDatabase<SurveyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SurveyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('drafts')
      },
    })
  }
  return dbPromise
}

// ============ Storage Functions ============

export async function loadSurveyDraft(schemaId: string): Promise<SurveyDraft | null> {
  try {
    const db = await getDB()
    const draft = await db.get('drafts', schemaId)
    return draft ?? null
  } catch (error) {
    console.error('[SurveyStore] Failed to load draft:', error)
    return null
  }
}

export async function saveSurveyDraft(draft: SurveyDraft): Promise<void> {
  try {
    const db = await getDB()
    await db.put('drafts', draft, draft.schemaId)
  } catch (error) {
    console.error('[SurveyStore] Failed to save draft:', error)
  }
}

export async function clearSurveyDraft(schemaId: string): Promise<void> {
  try {
    const db = await getDB()
    await db.delete('drafts', schemaId)
  } catch (error) {
    console.error('[SurveyStore] Failed to clear draft:', error)
  }
}

export async function listSurveyDrafts(): Promise<SurveyDraft[]> {
  try {
    const db = await getDB()
    return await db.getAll('drafts')
  } catch (error) {
    console.error('[SurveyStore] Failed to list drafts:', error)
    return []
  }
}

// ============ Store Factory ============

export interface SurveyStoreOptions {
  schema: SurveySchema
}

export function createSurveyStore(options: SurveyStoreOptions) {
  const { schema } = options

  const [isLoading, setIsLoading] = createSignal(true)
  const [draft, setDraft] = createSignal<SurveyDraft>(createEmptyDraft(schema))

  // Load existing draft on mount
  onMount(() => {
    loadSurveyDraft(schema.id)
      .then((stored) => {
        if (stored && stored.schemaVersion === schema.version) {
          setDraft(stored)
        }
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('[SurveyStore] Load error:', error)
        setIsLoading(false)
      })
  })

  // Auto-save on changes
  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  createEffect(() => {
    const current = draft()
    if (isLoading()) return

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      void saveSurveyDraft({ ...current, updatedAt: Date.now() })
    }, 250)

    onCleanup(() => {
      if (saveTimeout) clearTimeout(saveTimeout)
    })
  })

  // ============ Accessors ============

  const currentQuestionIndex = () => draft().currentQuestionIndex
  const currentQuestion = () => schema.questions[draft().currentQuestionIndex]
  const totalQuestions = () => schema.questions.length
  const isFirstQuestion = () => draft().currentQuestionIndex === 0
  const isLastQuestion = () => draft().currentQuestionIndex === schema.questions.length - 1

  const getAnswer = (questionId: string): SurveyAnswer | undefined => {
    return draft().answers[questionId]
  }

  const getAnswerValue = (questionId: string): string | string[] | number | undefined => {
    return draft().answers[questionId]?.value
  }

  const getAnswerTier = (questionId: string): SurveyTier => {
    const answer = draft().answers[questionId]
    if (answer?.tier) return answer.tier
    const question = schema.questions.find((q) => q.id === questionId)
    return question?.defaultTier ?? 'public'
  }

  const hasAnswer = (questionId: string): boolean => {
    const answer = draft().answers[questionId]
    if (!answer) return false
    if (Array.isArray(answer.value)) return answer.value.length > 0
    if (typeof answer.value === 'string') return answer.value.length > 0
    return true
  }

  const canContinue = (): boolean => {
    const question = currentQuestion()
    if (!question) return false
    if (!question.required) return true
    return hasAnswer(question.id)
  }

  const progress = (): number => {
    const answered = schema.questions.filter((q) => hasAnswer(q.id)).length
    return answered / schema.questions.length
  }

  // ============ Mutators ============

  const setAnswer = (questionId: string, value: string | string[] | number, tier?: SurveyTier) => {
    setDraft((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: { questionId, value, tier },
      },
    }))
  }

  const setAnswerTier = (questionId: string, tier: SurveyTier) => {
    setDraft((prev) => {
      const existing = prev.answers[questionId]
      if (!existing) return prev
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: { ...existing, tier },
        },
      }
    })
  }

  const clearAnswer = (questionId: string) => {
    setDraft((prev) => {
      const { [questionId]: _, ...rest } = prev.answers
      return { ...prev, answers: rest }
    })
  }

  const nextQuestion = () => {
    setDraft((prev) => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, schema.questions.length - 1),
    }))
  }

  const prevQuestion = () => {
    setDraft((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
    }))
  }

  const goToQuestion = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, Math.min(index, schema.questions.length - 1)),
    }))
  }

  const reset = () => {
    setDraft(createEmptyDraft(schema))
    void clearSurveyDraft(schema.id)
  }

  // ============ Export Helpers ============

  /** Get all answers grouped by tier */
  const getAnswersByTier = () => {
    const publicAnswers: Record<string, unknown> = {}
    const matchOnlyAnswers: Record<string, unknown> = {}
    const privateAnswers: Record<string, unknown> = {}

    for (const question of schema.questions) {
      const answer = draft().answers[question.id]
      if (!answer) continue

      const tier = answer.tier ?? question.defaultTier
      const value = answer.value

      switch (tier) {
        case 'public':
          publicAnswers[question.id] = value
          break
        case 'matchOnly':
          matchOnlyAnswers[question.id] = value
          break
        case 'private':
          privateAnswers[question.id] = value
          break
      }
    }

    return { publicAnswers, matchOnlyAnswers, privateAnswers }
  }

  return {
    // State
    draft,
    isLoading,
    schema,

    // Question navigation
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    isFirstQuestion,
    isLastQuestion,
    nextQuestion,
    prevQuestion,
    goToQuestion,

    // Answers
    getAnswer,
    getAnswerValue,
    getAnswerTier,
    hasAnswer,
    setAnswer,
    setAnswerTier,
    clearAnswer,

    // Progress
    canContinue,
    progress,

    // Export
    getAnswersByTier,

    // Reset
    reset,
  }
}

// ============ Helpers ============

function createEmptyDraft(schema: SurveySchema): SurveyDraft {
  return {
    schemaId: schema.id,
    schemaVersion: schema.version,
    answers: {},
    currentQuestionIndex: 0,
    startedAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export type SurveyStore = ReturnType<typeof createSurveyStore>
