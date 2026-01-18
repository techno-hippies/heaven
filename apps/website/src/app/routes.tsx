import { lazy } from 'solid-js'
import { Route } from '@solidjs/router'
import AppLayout from '@/layouts/AppLayout'
import OnboardingLayout from '@/layouts/OnboardingLayout'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/Home'))
const MessagesPage = lazy(() => import('@/pages/Messages'))
const SurveyPage = lazy(() => import('@/pages/Survey'))
const StorePage = lazy(() => import('@/pages/Store'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const MusicPage = lazy(() => import('@/pages/Music'))
const OnboardingPage = lazy(() => import('@/pages/Onboarding'))

export const routes = (
  <>
    {/* Onboarding flow - no nav */}
    <Route path="/onboarding" component={OnboardingLayout}>
      <Route path="/:stepId?" component={OnboardingPage} />
    </Route>

    {/* Main app - with sidebar/footer nav */}
    <Route path="/" component={AppLayout}>
      <Route path="/" component={HomePage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/survey" component={SurveyPage} />
      <Route path="/store" component={StorePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/music" component={MusicPage} />
    </Route>
  </>
)
