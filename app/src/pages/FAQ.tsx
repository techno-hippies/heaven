/**
 * FAQ Page - Frequently Asked Questions
 * - Mobile: Full width
 * - Desktop: Uses DesktopSidebar, content centered in remaining space
 */

import type { Component } from 'solid-js'
import { For } from 'solid-js'
import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  title: string
  items: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'What is Neodate?',
        answer: 'Dating and friendship matching based on interests inferred from DNS browsing patterns, plus verified identity gating and encrypted compatibility checks.',
      },
      {
        question: 'How do I sign up?',
        answer: 'Passkey only. No email or phone. Passkeys are phishing-resistant and don\'t require sharing secrets. We recommend 1Password, Bitwarden, or a YubiKey to manage your passkey.',
      },
      {
        question: 'What if I lose my passkey?',
        answer: 'If you lose your passkey, you may lose access. Use a passkey manager (1Password/Bitwarden) or hardware key and keep recovery methods enabled.',
      },
      {
        question: 'Do I need crypto?',
        answer: 'Yes. Your identity is wallet-based. Swiping on candidates, setting preferences, and sending likes are on-chain operations that cost gas. We use an L2 (Zama\'s fhEVM) so fees are low.',
      },
      {
        question: 'Why do I have to verify my identity?',
        answer: 'To reduce bots, impersonation, and fraud, and to enforce age gating without collecting your name.',
      },
      {
        question: 'Is Neodate 18+?',
        answer: 'Yes. We require proof you\'re above a minimum age threshold.',
      },
    ],
  },
  {
    title: 'DNS VPN',
    items: [
      {
        question: 'Can I set up a profile without using the DNS VPN?',
        answer: 'You can create a profile without the DNS VPN, but you won\'t get high-quality recommendations. The VPN provides the interest signal Neodate matches on. Some actions also require on-chain transactions, which cost gas.',
      },
      {
        question: 'Is the DNS VPN secure?',
        answer: 'By default, your DNS traffic is unencrypted—your ISP and network operators already see every domain you visit. The VPN (WireGuard) encrypts this traffic so they can\'t see it anymore. Neodate can see your DNS queries instead, which is the trade-off: you\'re choosing to share with us rather than your ISP.',
      },
      {
        question: 'Why DNS instead of questionnaires?',
        answer: 'Lower effort, harder to fake, and reflects real interests rather than aspirational self-descriptions.',
      },
    ],
  },
  {
    title: 'Privacy & Data',
    items: [
      {
        question: 'Who owns my data?',
        answer: 'You control your identity (your passkey-backed wallet) and the on-chain records your wallet writes. Public profile fields and follows are portable by design. Off-chain data (like aggregated DNS features) is designed to be exportable and deletable.',
      },
      {
        question: 'How do follows work?',
        answer: 'We use Ethereum Follow Protocol (EFP). You mint a free EFP List NFT that stores your follows on-chain. Your follow list is portable—any app can read it, and you can take it with you if you leave. EFP also supports tags like block and mute, which we respect in the app.',
      },
      {
        question: 'What DNS data do you store?',
        answer: 'We log DNS queries to generate interest signals for matching. This includes the domains you visit while the VPN is active. Logs are stored in Tinybird and used to compute taste vectors and candidate matches.',
      },
      {
        question: 'Do you store the exact domains I visit?',
        answer: 'Yes, while the VPN is on. DNS queries are logged to build your interest profile. This is the core signal that makes matching work—it\'s what you\'re trading for better matches.',
      },
      {
        question: 'Is my data sold or used for ads?',
        answer: 'No. We don\'t sell your data or use it for advertising.',
      },
      {
        question: 'What\'s on-chain vs off-chain?',
        answer: 'On-chain: public profile fields you choose to publish, likes/follows, and encrypted compatibility artifacts. Off-chain: onboarding state, claims, abuse controls, and aggregated interest features.',
      },
      {
        question: 'What can\'t be deleted because it\'s on-chain?',
        answer: 'Anything written to the blockchain is immutable: public profile fields, likes, follows, and encrypted compatibility data. You can stop publishing and rotate identity, but historical on-chain data persists.',
      },
      {
        question: 'Can I export my data?',
        answer: 'Yes. On-chain data is already portable. Off-chain data exports are downloadable from your settings.',
      },
      {
        question: 'Can I delete my data?',
        answer: 'Off-chain data: deletable. On-chain data: immutable, but you can stop publishing and rotate identity.',
      },
    ],
  },
  {
    title: 'Matching',
    items: [
      {
        question: 'How does matching work?',
        answer: 'We generate candidates based on your public profile fields (location, intent, etc.) combined with DNS-derived interest signals. Encrypted preferences determine compatibility. Mutual interest unlocks messaging.',
      },
      {
        question: 'How do you check compatibility without seeing my preferences?',
        answer: 'We use Fully Homomorphic Encryption (Zama fhEVM). Your preferences and dealbreakers are encrypted on-chain—the contract checks compatibility on encrypted data without ever decrypting it. Nobody (not even us) can see what you\'re filtering on.',
      },
      {
        question: 'What gets revealed when I match?',
        answer: 'Only what you choose to share. For each preference, you can mark it as "share on match" or "never reveal." Shared values are revealed only to your match, and numerics like age are bucketed (e.g., "23-27") for privacy.',
      },
      {
        question: 'Can I use this just to make friends?',
        answer: 'Absolutely—we encourage it. You can label your intent as friendship, dating, or community.',
      },
      {
        question: 'Does adding more profile fields increase costs?',
        answer: 'Yes, roughly linearly. Public fields (Directory.sol) add moderate, predictable storage costs. Private/encrypted fields (Dating.sol, fhEVM) are materially more expensive—each attribute adds ~5 encrypted writes plus ACL operations, and increases coprocessor work during profile setup, compatibility checks, and match reveals. "Share on match" fields add extra work when computing shared values. We keep the encrypted attribute set small to manage cost and latency.',
      },
    ],
  },
  {
    title: 'Photos & Profiles',
    items: [
      {
        question: 'Can I use a real photo?',
        answer: 'No. Neodate doesn\'t support face photos. You can use an anime avatar or non-face photos (pets, art, landscapes). This reduces lookism and makes the first impression interest-based. After matching, you can share photos in chat if you want.',
      },
      {
        question: 'Why do you encourage pseudonyms?',
        answer: 'To promote anonymity, interest-based connections, and reduce vanity. If we don\'t know your real name either, privacy risks decrease. You can disclose your real name to matches later if you choose.',
      },
    ],
  },
  {
    title: 'Verification',
    items: [
      {
        question: 'What exactly does Self.xyz verify?',
        answer: 'Minimum age and document fields used for gating. We don\'t request your name.',
      },
      {
        question: 'Sex vs. gender?',
        answer: 'For verification we use the sex marker attested by Self.xyz from your passport/ID (whatever your document reports, often M/F and sometimes X). We use this wording because it\'s a verified field. Separately, you can optionally state your gender identity as self-asserted profile info (not used for verification).',
      },
      {
        question: 'Does Self.xyz actually support "X" as a sex marker?',
        answer: 'Honestly? I don\'t know. The MRZ spec supports "X" and "<" (unspecified), so it should technically work. If you have a passport with an X marker and want to help us test, please reach out. I believe in choice—and where we\'re going, all I really care about is that you\'re human, 18+, and not machine.',
      },
    ],
  },
  {
    title: 'Messaging & Safety',
    items: [
      {
        question: 'Can anyone message me?',
        answer: 'Protocol-wise, XMTP is permissionless. App-wise, we only surface conversations with matches.',
      },
      {
        question: 'How do you prevent harassment?',
        answer: 'Consent-based inbox (<a href="https://docs.xmtp.org/chat-apps/user-consent/user-consent" target="_blank" rel="noopener noreferrer">XMTP user consent</a>), blocks, reporting, rate limits, and verified-only actions.',
      },
      {
        question: 'Can I block or report someone?',
        answer: 'Yes, with fast enforcement via client and server blocklists.',
      },
      {
        question: 'Do you support disappearing messages?',
        answer: 'Yes, and we encourage using them. Messages can be set to auto-delete after a time period. <a href="https://docs.xmtp.org/chat-apps/core-messaging/disappearing-messages" target="_blank" rel="noopener noreferrer">Learn more</a>',
      },
    ],
  },
  {
    title: 'Open Source & Trust',
    items: [
      {
        question: 'Is this open source?',
        answer: 'Yes. Our contracts are open source. You can review our code on GitHub. Audits are in progress.',
      },
      {
        question: 'What\'s your threat model?',
        answer: 'We protect against data brokers, ISPs, and casual snooping. We cannot fully protect against a compromised server or targeted device malware.',
      },
    ],
  },
]

export const FAQ: Component = () => {
  return (
    <div class="min-h-screen bg-background">
      <DesktopSidebar
        isConnected={true}
        username="@neo.eth"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=neo"
      />

      {/* Main content area - offset by sidebar on desktop */}
      <div class="md:pl-72 min-h-screen">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-12">
          <h1 class="text-4xl font-bold text-foreground mb-2">FAQ</h1>
          <p class="text-lg text-muted-foreground mb-12">Common questions about Neodate</p>

          <div class="space-y-12">
            <For each={faqCategories}>
              {(category) => (
                <section>
                  <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                    {category.title}
                  </h2>
                  <div class="space-y-8">
                    <For each={category.items}>
                      {(item) => (
                        <div>
                          <h3 class="text-lg font-medium text-foreground mb-2">
                            {item.question}
                          </h3>
                          <p class="text-base text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:underline" innerHTML={item.answer} />
                        </div>
                      )}
                    </For>
                  </div>
                </section>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ
