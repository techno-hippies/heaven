/**
 * Survey Page
 *
 * Encrypted survey upload pipeline.
 * Supports testSchema (simple test) and personalitySchema (full survey).
 */

import { type Component, createSignal, For, Show, createMemo, createEffect } from 'solid-js'
import { Button } from '@/components/ui/button'
import { ChoiceSelect } from '@/components/ui/choice-select'
import { ScaleSelect } from '@/components/ui/scale-select'
import { VisibilitySelect, type Visibility } from '@/components/ui/visibility-select'
import { useAuth } from '@/contexts/AuthContext'
import {
  testSchema,
  personalitySchema,
  visibilityToTier,
  tierToVisibility,
  uploadSurvey,
  type SurveyAnswer,
  type SurveySchema,
} from '@/lib/survey'
import { registerSurvey } from '@/lib/contracts'
import { SurveyViewer } from '@/components/survey/SurveyViewer'
import type { Hex, Address } from 'viem'

type SubmitState = 'idle' | 'uploading' | 'registering' | 'success' | 'error'

// Available schemas
const SCHEMAS: Record<string, SurveySchema> = {
  test: testSchema,
  personality: personalitySchema,
}

export const SurveyPage: Component = () => {
  const auth = useAuth()

  // Schema selection
  const [schemaId, setSchemaId] = createSignal<string>('personality')
  const schema = () => SCHEMAS[schemaId()]

  // Answer state: questionId -> { value, tier }
  const [answers, setAnswers] = createSignal<Record<string, SurveyAnswer>>({})
  const [submitState, setSubmitState] = createSignal<SubmitState>('idle')
  const [resultCid, setResultCid] = createSignal<string | null>(null)
  const [txHash, setTxHash] = createSignal<Hex | null>(null)
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null)

  // Initialize answers with default tiers for selected schema
  const initializeAnswers = (s: SurveySchema) => {
    const initial: Record<string, SurveyAnswer> = {}
    for (const q of s.questions) {
      initial[q.id] = {
        questionId: q.id,
        value: q.type === 'multi' ? [] : q.type === 'scale' ? null : '',
        tier: q.defaultTier,
      }
    }
    setAnswers(initial)
  }

  // Re-initialize when schema changes
  createEffect(() => {
    const s = schema()
    if (s) {
      initializeAnswers(s)
      // Reset submit state
      setSubmitState('idle')
      setResultCid(null)
      setTxHash(null)
      setErrorMessage(null)
    }
  })

  const updateAnswer = (questionId: string, value: string | string[] | number | null) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], value },
    }))
  }

  const updateTier = (questionId: string, visibility: Visibility) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], tier: visibilityToTier(visibility) },
    }))
  }

  // Check if a question is answered based on its type
  const isAnswered = (questionId: string, type: string, required: boolean): boolean => {
    if (!required) return true
    const answer = answers()[questionId]
    if (!answer) return false

    switch (type) {
      case 'multi':
        return Array.isArray(answer.value) && answer.value.length > 0
      case 'scale':
        return answer.value !== null && answer.value !== undefined
      default:
        return answer.value !== '' && answer.value !== null
    }
  }

  const isComplete = createMemo(() => {
    const s = schema()
    if (!s) return false
    return s.questions.every((q) => isAnswered(q.id, q.type, q.required !== false))
  })

  const handleSubmit = async () => {
    if (!auth.pkpAddress()) {
      setErrorMessage('Please connect your wallet first')
      return
    }

    setSubmitState('uploading')
    setErrorMessage(null)
    setResultCid(null)
    setTxHash(null)

    try {
      // Group answers by tier
      const publicAnswers: Record<string, unknown> = {}
      const matchOnlyAnswers: Record<string, unknown> = {}
      const privateAnswers: Record<string, unknown> = {}

      for (const [questionId, answer] of Object.entries(answers())) {
        const tier = answer.tier || 'public'
        const value = answer.value

        switch (tier) {
          case 'public':
            publicAnswers[questionId] = value
            break
          case 'matchOnly':
            matchOnlyAnswers[questionId] = value
            break
          case 'private':
            privateAnswers[questionId] = value
            break
        }
      }

      const currentSchema = schema()
      console.log('[Survey] Uploading with tiers:', {
        schema: currentSchema.id,
        public: Object.keys(publicAnswers),
        matchOnly: Object.keys(matchOnlyAnswers),
        private: Object.keys(privateAnswers),
      })

      // Step 1: Upload to IPFS
      const result = await uploadSurvey({
        schema: currentSchema,
        ownerAddress: auth.pkpAddress()!,
        publicAnswers,
        matchOnlyAnswers: Object.keys(matchOnlyAnswers).length > 0 ? matchOnlyAnswers : undefined,
        privateAnswers: Object.keys(privateAnswers).length > 0 ? privateAnswers : undefined,
      })

      console.log('[Survey] Upload result:', result)
      setResultCid(result.responseCid)

      // Step 2: Register on-chain (Base Sepolia)
      setSubmitState('registering')

      const pkpInfo = auth.pkpInfo()
      let authData = auth.authData()
      const eoaAddress = auth.eoaAddress()

      if (!eoaAddress && pkpInfo && authData) {
        authData = await auth.getSigningAuthData()
      }

      const options = pkpInfo && authData ? { pkpInfo, authData } : undefined

      const hash = await registerSurvey({
        schemaIdBytes32: currentSchema.schemaIdBytes32 as Hex,
        responseCid: result.responseCid,
        encryptionMode: result.encryptionMode,
      }, options)

      console.log('[Survey] Registered on-chain:', hash)
      setTxHash(hash)
      setSubmitState('success')
    } catch (error) {
      console.error('[Survey] Error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed')
      setSubmitState('error')
    }
  }

  return (
    <div class="min-h-screen bg-background">
      <div class="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-foreground">{schema().name}</h1>
          <p class="text-muted-foreground mt-1">{schema().description}</p>

          {/* Schema selector */}
          <div class="mt-4 flex gap-2">
            <For each={Object.entries(SCHEMAS)}>
              {([id, s]) => (
                <button
                  type="button"
                  onClick={() => setSchemaId(id)}
                  class={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    schemaId() === id
                      ? 'bg-primary text-primary-foreground border-transparent'
                      : 'border-border text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  {s.name}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Auth check */}
        <Show when={!auth.isAuthenticated()}>
          <div class="rounded-2xl border border-border bg-card p-6 text-center">
            <p class="text-muted-foreground mb-4">Connect your wallet to take the survey</p>
            <Button onClick={() => auth.openAuthDialog()}>Connect</Button>
          </div>
        </Show>

        {/* Survey form */}
        <Show when={auth.isAuthenticated()}>
          <div class="space-y-8">
            <For each={schema().questions}>
              {(question, index) => {
                const answer = () => answers()[question.id]
                const visibility = () => tierToVisibility(answer()?.tier || question.defaultTier)

                return (
                  <div class="rounded-2xl border border-border bg-card p-6">
                    {/* Question number and text */}
                    <div class="mb-4">
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-muted-foreground">
                          Question {index() + 1} of {schema().questions.length}
                        </span>
                        {question.required === false && (
                          <span class="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Optional
                          </span>
                        )}
                      </div>
                      <h2 class="text-lg font-semibold text-foreground mt-1">
                        {question.text}
                      </h2>
                    </div>

                    {/* Input based on question type */}
                    <div class="mb-6">
                      {/* Single choice */}
                      <Show when={question.type === 'single'}>
                        <ChoiceSelect
                          options={question.options || []}
                          value={String(answer()?.value || '')}
                          onChange={(v) => updateAnswer(question.id, v as string)}
                          columns={2}
                        />
                      </Show>

                      {/* Multi choice */}
                      <Show when={question.type === 'multi'}>
                        <ChoiceSelect
                          options={question.options || []}
                          value={Array.isArray(answer()?.value) ? answer()!.value as string[] : []}
                          onChange={(v) => updateAnswer(question.id, v as string[])}
                          multiple
                        />
                      </Show>

                      {/* Scale */}
                      <Show when={question.type === 'scale'}>
                        <ScaleSelect
                          value={typeof answer()?.value === 'number' ? answer()!.value as number : null}
                          onChange={(v) => updateAnswer(question.id, v)}
                          range={question.range as [number, number]}
                          scaleLabels={question.scaleLabels as [string, string]}
                        />
                      </Show>
                    </div>

                    {/* Visibility */}
                    <div>
                      <label class="block text-sm font-medium text-muted-foreground mb-2">
                        Who can see this?
                      </label>
                      <VisibilitySelect
                        value={visibility()}
                        onChange={(v) => updateTier(question.id, v)}
                      />
                    </div>
                  </div>
                )
              }}
            </For>

            {/* Submit section */}
            <div class="rounded-2xl border border-border bg-card p-6">
              <Show when={submitState() === 'success' && resultCid()}>
                <div class="text-center">
                  <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-foreground mb-2">Survey Registered!</h3>
                  <p class="text-sm text-muted-foreground mb-4">
                    Your encrypted survey is stored on IPFS and registered on-chain.
                  </p>

                  {/* IPFS CID */}
                  <div class="mb-3">
                    <p class="text-xs text-muted-foreground mb-1">IPFS CID</p>
                    <div class="bg-muted rounded-lg p-2 text-xs font-mono break-all">
                      {resultCid()}
                    </div>
                    <a
                      href={`https://ipfs.filebase.io/ipfs/${resultCid()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary text-xs hover:underline"
                    >
                      View on IPFS →
                    </a>
                  </div>

                  {/* Transaction hash */}
                  <Show when={txHash()}>
                    <div class="mb-6">
                      <p class="text-xs text-muted-foreground mb-1">Transaction (Base Sepolia)</p>
                      <div class="bg-muted rounded-lg p-2 text-xs font-mono break-all">
                        {txHash()?.slice(0, 10)}...{txHash()?.slice(-8)}
                      </div>
                      <a
                        href={`https://sepolia.basescan.org/tx/${txHash()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary text-xs hover:underline"
                      >
                        View on BaseScan →
                      </a>
                    </div>
                  </Show>
                </div>

                {/* Verify: Load and decrypt the survey we just submitted */}
                <div class="mt-6 pt-6 border-t border-border">
                  <h4 class="text-sm font-medium text-foreground mb-4">Verify Decryption</h4>
                  <SurveyViewer
                    wallet={auth.pkpAddress() as Address}
                    schemaIdBytes32={schema().schemaIdBytes32 as Hex}
                    responseCid={resultCid()!}
                  />
                </div>
              </Show>

              <Show when={submitState() === 'error'}>
                <div class="text-center mb-4">
                  <div class="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-foreground mb-2">Upload Failed</h3>
                  <p class="text-sm text-destructive">{errorMessage()}</p>
                </div>
              </Show>

              <Show when={submitState() !== 'success'}>
                <div class="flex flex-col items-center gap-4">
                  <p class="text-sm text-muted-foreground text-center">
                    Your answers will be encrypted based on visibility settings and stored on IPFS.
                  </p>
                  <Button
                    size="lg"
                    disabled={!isComplete() || submitState() === 'uploading' || submitState() === 'registering'}
                    onClick={handleSubmit}
                    class="w-full"
                  >
                    {submitState() === 'uploading' ? (
                      <span class="flex items-center gap-2">
                        <div class="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Encrypting & Uploading...
                      </span>
                    ) : submitState() === 'registering' ? (
                      <span class="flex items-center gap-2">
                        <div class="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Registering on-chain...
                      </span>
                    ) : (
                      'Submit Survey'
                    )}
                  </Button>
                  <Show when={!isComplete()}>
                    <p class="text-xs text-muted-foreground">
                      Please answer all questions to continue
                    </p>
                  </Show>
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default SurveyPage
