import { Component } from 'solid-js'
import { Lock, Eye, Users, Brain, Timer, Heart, UserCircle, ShieldCheck, Sparkle, ArrowRight } from 'phosphor-solid'

// Light Neo Coral palette
const colors = {
  bg: '#fffaf9',
  bgSubtle: '#fff5f3',
  surface: '#ffffff',
  border: '#ffe0dc',
  borderSubtle: '#ffebe8',
  text: '#2d1f1f',
  textSecondary: '#6b5555',
  textMuted: '#9a8585',
  accent: '#ff6b6b',
  accentHover: '#ff5252',
  accentSoft: '#fff0ee',
  accentText: '#ffffff',
}

const fonts = {
  heading: "'Fraunces', Georgia, serif",
  body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
}

export const LandingPage: Component = () => {
  return (
    <div
      class="min-h-screen"
      style={{
        background: colors.bg,
        'font-family': fonts.body,
      }}
    >
      {/* Hero */}
      <section class="relative overflow-hidden">
        <div
          class="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${colors.accentSoft} 0%, ${colors.bg} 100%)` }}
        />
        <div class="max-w-4xl mx-auto px-6 py-24 text-center relative">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <Sparkle size={20} weight="fill" style={{ color: colors.accent }} />
            <span class="text-lg font-medium" style={{ color: colors.accent }}>A new kind of dating</span>
          </div>

          <h1
            class="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ color: colors.text, 'font-family': fonts.heading }}
          >
            Quit porn and social media.
            <br />
            <span style={{ color: colors.accent }}>Find true love.</span>
          </h1>

          <p
            class="text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Your browser history and interests create the perfect match.
            No face photos—just your body, your mind, and real compatibility.
          </p>

          <button
            class="px-8 py-4 rounded-2xl text-xl font-semibold transition-all inline-flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: colors.accent,
              color: colors.accentText,
              'box-shadow': `0 8px 30px ${colors.accent}40`,
            }}
          >
            <span>Get Started</span>
            <ArrowRight size={24} weight="bold" />
          </button>
        </div>
      </section>

      {/* Core Value Props */}
      <section class="py-20" style={{ 'border-top': `1px solid ${colors.borderSubtle}` }}>
        <div class="max-w-5xl mx-auto px-6">
          <div class="grid md:grid-cols-3 gap-8">
            <div
              class="p-6 rounded-2xl"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{ background: '#f3e8ff' }}
              >
                <Brain size={28} weight="fill" style={{ color: '#a855f7' }} />
              </div>
              <h3 class="text-xl font-semibold mb-3" style={{ color: colors.text, 'font-family': fonts.heading }}>Match on what matters</h3>
              <p class="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>
                Your interests, browsing habits, and values—not just a photo.
                AI finds people who actually think like you.
              </p>
            </div>

            <div
              class="p-6 rounded-2xl"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{ background: colors.accentSoft }}
              >
                <UserCircle size={28} weight="fill" style={{ color: colors.accent }} />
              </div>
              <h3 class="text-xl font-semibold mb-3" style={{ color: colors.text, 'font-family': fonts.heading }}>Body, not face</h3>
              <p class="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>
                Show your body, hide your face. Attraction matters, but we're
                filtering out the superficial swipers.
              </p>
            </div>

            <div
              class="p-6 rounded-2xl"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{ background: '#d1fae5' }}
              >
                <Timer size={28} weight="fill" style={{ color: '#10b981' }} />
              </div>
              <h3 class="text-xl font-semibold mb-3" style={{ color: colors.text, 'font-family': fonts.heading }}>3 candidates. That's it.</h3>
              <p class="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>
                No endless swiping. Each day you get three highly compatible
                matches. Quality over quantity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section class="py-20" style={{ background: colors.bgSubtle }}>
        <div class="max-w-4xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2
              class="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: colors.text, 'font-family': fonts.heading }}
            >
              Your data. Your rules.
            </h2>
            <p class="text-xl" style={{ color: colors.textSecondary }}>
              Three levels of privacy for everything you share.
            </p>
          </div>

          <div class="space-y-4">
            <div
              class="p-6 rounded-2xl flex items-start gap-5"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#fee2e2' }}
              >
                <Lock size={28} weight="fill" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2" style={{ color: colors.text, 'font-family': fonts.heading }}>Secret dealbreakers</h3>
                <p class="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>
                  Filter silently, never revealed. Using fully homomorphic encryption,
                  even we can't see your dealbreakers—but they still work.
                </p>
              </div>
            </div>

            <div
              class="p-6 rounded-2xl flex items-start gap-5"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#fef3c7' }}
              >
                <Users size={28} weight="fill" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2" style={{ color: colors.text, 'font-family': fonts.heading }}>Shared on match</h3>
                <p class="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>
                  Hidden while browsing. When you both match, your overlap is revealed.
                  The surprise of "me too!" without the vulnerability.
                </p>
              </div>
            </div>

            <div
              class="p-6 rounded-2xl flex items-start gap-5"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#dbeafe' }}
              >
                <Eye size={28} weight="fill" style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2" style={{ color: colors.text, 'font-family': fonts.heading }}>Public</h3>
                <p class="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>
                  Visible to everyone. The things you're proud of,
                  the things that define you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accountability Section */}
      <section class="py-20" style={{ 'border-top': `1px solid ${colors.borderSubtle}` }}>
        <div class="max-w-4xl mx-auto px-6">
          <div
            class="rounded-3xl p-10 md:p-14"
            style={{
              background: `linear-gradient(135deg, #fdf4ff 0%, ${colors.accentSoft} 100%)`,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div class="flex flex-col md:flex-row items-start gap-6 mb-8">
              <div
                class="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: '#f3e8ff' }}
              >
                <ShieldCheck size={36} weight="fill" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <h2
                  class="text-2xl md:text-3xl font-bold mb-3"
                  style={{ color: colors.text, 'font-family': fonts.heading }}
                >
                  Screen time accountability
                </h2>
                <p class="text-xl leading-relaxed" style={{ color: colors.textSecondary }}>
                  An AI companion that helps you stay off the apps that hurt you.
                  Social media. Porn. The doom scroll. We're here to help you quit.
                </p>
              </div>
            </div>
            <p class="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>
              Your match sees your accountability stats. It's not about perfection—it's
              about showing you're trying. Someone who's working on themselves is
              someone worth meeting.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-24" style={{ background: colors.bgSubtle }}>
        <div class="max-w-2xl mx-auto px-6 text-center">
          <Heart size={48} weight="fill" style={{ color: colors.accent }} class="mx-auto mb-6" />
          <h2
            class="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: colors.text, 'font-family': fonts.heading }}
          >
            Ready to date differently?
          </h2>
          <p class="text-xl mb-10" style={{ color: colors.textSecondary }}>
            Join the waitlist for early access.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="your@email.com"
              class="px-6 py-4 rounded-xl text-lg focus:outline-none focus:ring-2"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                '--tw-ring-color': colors.accent,
              }}
            />
            <button
              class="px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: colors.accent, color: colors.accentText }}
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        class="py-8"
        style={{ 'border-top': `1px solid ${colors.borderSubtle}` }}
      >
        <div class="max-w-4xl mx-auto px-6 text-center">
          <p class="text-lg font-medium" style={{ color: colors.textMuted }}>
            Heaven — Dating for people who want more.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
