/**
 * SurveyViewer - Display survey responses with decryption
 *
 * Loads survey from on-chain registry, fetches from IPFS, and decrypts if authorized.
 */

import { type Component, createSignal, Show, For, onMount } from 'solid-js'
import type { Address, Hex } from 'viem'
import { Button } from '@/components/ui/button'
import {
  fetchSurveyResponse,
  fetchEnvelope,
  decryptTier,
  getSchema,
  type SurveyResponse,
} from '@/lib/survey'
import { getSurvey } from '@/lib/contracts'

interface SurveyViewerProps {
  wallet: Address
  schemaIdBytes32: Hex
  /** Optional: if we already have the CID, skip chain lookup */
  responseCid?: string
}

type LoadState = 'idle' | 'loading' | 'loaded' | 'error'

export const SurveyViewer: Component<SurveyViewerProps> = (props) => {
  const [loadState, setLoadState] = createSignal<LoadState>('idle')
  const [error, setError] = createSignal<string | null>(null)

  // Data
  const [response, setResponse] = createSignal<SurveyResponse | null>(null)
  const [matchOnlyData, setMatchOnlyData] = createSignal<Record<string, unknown> | null>(null)
  const [privateData, setPrivateData] = createSignal<Record<string, unknown> | null>(null)
  const [matchOnlyError, setMatchOnlyError] = createSignal<string | null>(null)
  const [privateError, setPrivateError] = createSignal<string | null>(null)

  const schema = () => {
    const resp = response()
    return resp ? getSchema(resp.schemaId) : null
  }

  const loadSurvey = async () => {
    setLoadState('loading')
    setError(null)
    setMatchOnlyData(null)
    setPrivateData(null)
    setMatchOnlyError(null)
    setPrivateError(null)

    try {
      // Get CID from props or fetch from chain
      let cid = props.responseCid
      if (!cid) {
        const entry = await getSurvey(props.wallet, props.schemaIdBytes32)
        if (!entry || !entry.responseCid) {
          setError('No survey found for this wallet and schema')
          setLoadState('error')
          return
        }
        cid = entry.responseCid
      }

      console.log('[SurveyViewer] Fetching response:', cid)

      // Fetch response from IPFS
      const resp = await fetchSurveyResponse(cid)
      setResponse(resp)

      console.log('[SurveyViewer] Response loaded:', {
        schemaId: resp.schemaId,
        public: Object.keys(resp.public),
        hasMatchOnly: !!resp.matchOnly,
        hasPrivate: !!resp.private,
      })

      // Try to decrypt matchOnly tier
      if (resp.matchOnly?.cid) {
        try {
          console.log('[SurveyViewer] Decrypting matchOnly tier...')
          const envelope = await fetchEnvelope(resp.matchOnly.cid)
          const decrypted = await decryptTier({ envelope })
          setMatchOnlyData(decrypted.responses)
          console.log('[SurveyViewer] matchOnly decrypted:', Object.keys(decrypted.responses))
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Decrypt failed'
          console.warn('[SurveyViewer] matchOnly decrypt failed:', msg)
          setMatchOnlyError(msg)
        }
      }

      // Try to decrypt private tier
      if (resp.private?.cid) {
        try {
          console.log('[SurveyViewer] Decrypting private tier...')
          const envelope = await fetchEnvelope(resp.private.cid)
          const decrypted = await decryptTier({ envelope })
          setPrivateData(decrypted.responses)
          console.log('[SurveyViewer] private decrypted:', Object.keys(decrypted.responses))
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Decrypt failed'
          console.warn('[SurveyViewer] private decrypt failed:', msg)
          setPrivateError(msg)
        }
      }

      setLoadState('loaded')
    } catch (e) {
      console.error('[SurveyViewer] Load error:', e)
      setError(e instanceof Error ? e.message : 'Failed to load survey')
      setLoadState('error')
    }
  }

  // Auto-load on mount
  onMount(() => {
    loadSurvey()
  })

  // Get answer value for a question ID
  const getAnswer = (questionId: string): { value: unknown; tier: string } | null => {
    const resp = response()
    if (!resp) return null

    // Check public
    if (questionId in resp.public) {
      return { value: resp.public[questionId], tier: 'public' }
    }

    // Check matchOnly
    const matchOnly = matchOnlyData()
    if (matchOnly && questionId in matchOnly) {
      return { value: matchOnly[questionId], tier: 'matchOnly' }
    }

    // Check private
    const priv = privateData()
    if (priv && questionId in priv) {
      return { value: priv[questionId], tier: 'private' }
    }

    // Check if it's in an encrypted tier we couldn't decrypt
    if (resp.matchOnly && matchOnlyError()) {
      return { value: '🔒 Encrypted (match required)', tier: 'matchOnly' }
    }
    if (resp.private && privateError()) {
      return { value: '🔒 Encrypted (owner only)', tier: 'private' }
    }

    return null
  }

  const tierBadge = (tier: string) => {
    switch (tier) {
      case 'public':
        return <span class="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">Public</span>
      case 'matchOnly':
        return <span class="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600">Match Only</span>
      case 'private':
        return <span class="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600">Private</span>
      default:
        return null
    }
  }

  return (
    <div class="rounded-2xl border border-border bg-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-foreground">Survey Responses</h3>
        <Button variant="outline" size="sm" onClick={loadSurvey} disabled={loadState() === 'loading'}>
          {loadState() === 'loading' ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Loading */}
      <Show when={loadState() === 'loading'}>
        <div class="flex items-center justify-center py-8">
          <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span class="ml-2 text-muted-foreground">Loading survey...</span>
        </div>
      </Show>

      {/* Error */}
      <Show when={loadState() === 'error'}>
        <div class="text-center py-8">
          <p class="text-destructive">{error()}</p>
          <Button variant="outline" size="sm" onClick={loadSurvey} class="mt-4">
            Try Again
          </Button>
        </div>
      </Show>

      {/* Loaded */}
      <Show when={loadState() === 'loaded' && response()}>
        <div class="space-y-4">
          {/* Schema info */}
          <div class="text-sm text-muted-foreground mb-4">
            Schema: {response()?.schemaId} v{response()?.schemaVersion}
          </div>

          {/* Questions and answers */}
          <For each={schema()?.questions || []}>
            {(question) => {
              const answer = () => getAnswer(question.id)
              return (
                <div class="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <p class="text-sm font-medium text-foreground">{question.text}</p>
                    {answer() && tierBadge(answer()!.tier)}
                  </div>
                  <Show
                    when={answer()}
                    fallback={<p class="text-sm text-muted-foreground italic">No answer</p>}
                  >
                    {(ans) => {
                      const val = ans().value
                      const isLocked = typeof val === 'string' && val.startsWith('🔒')

                      // Format based on question type
                      const formatValue = () => {
                        if (isLocked) return String(val)

                        // Scale type - show number with labels
                        if (question.type === 'scale' && typeof val === 'number') {
                          const labels = question.scaleLabels
                          return labels ? `${val} (${labels[0]} → ${labels[1]})` : String(val)
                        }

                        // Multi type - show array as comma-separated labels
                        if (question.type === 'multi' && Array.isArray(val)) {
                          const labels = val.map((v) => {
                            const opt = question.options?.find((o) => o.value === v)
                            return opt?.label || v
                          })
                          return labels.join(', ')
                        }

                        // Single type - show label
                        const label = question.options?.find((o) => o.value === val)?.label
                        return label || String(val)
                      }

                      return (
                        <p class="text-sm text-foreground">
                          {formatValue()}
                        </p>
                      )
                    }}
                  </Show>
                </div>
              )
            }}
          </For>

          {/* Decrypt status */}
          <Show when={matchOnlyError() || privateError()}>
            <div class="mt-4 pt-4 border-t border-border">
              <p class="text-xs text-muted-foreground">
                Some tiers couldn't be decrypted. You may need to be matched with this user or be the owner.
              </p>
            </div>
          </Show>
        </div>
      </Show>

      {/* Idle - shouldn't happen with onMount */}
      <Show when={loadState() === 'idle'}>
        <div class="text-center py-8">
          <Button onClick={loadSurvey}>Load Survey</Button>
        </div>
      </Show>
    </div>
  )
}

export default SurveyViewer
