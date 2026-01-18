import { lazy } from 'solid-js'
import { Route } from '@solidjs/router'
import { AppLayout } from '@/layouts/AppLayout'

const WelcomePage = lazy(() => import('@/pages/Welcome'))
const OnboardingPage = lazy(() => import('@/pages/Onboarding'))
const HomePage = lazy(() => import('@/pages/Home'))
const MessagesPage = lazy(() => import('@/pages/Messages'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const SurveyPage = lazy(() => import('@/pages/Survey'))
const StorePage = lazy(() => import('@/pages/Store'))

export const routes = (
  <>
    {/* Standalone pages (no nav) */}
    <Route path="/welcome" component={WelcomePage} />
    <Route path="/onboarding" component={OnboardingPage} />

    {/* App pages (with nav) */}
    <Route path="/" component={AppLayout}>
      <Route path="/" component={HomePage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/survey" component={SurveyPage} />
      <Route path="/store" component={StorePage} />
      <Route path="/profile" component={ProfilePage} />
    </Route>
  </>
)
