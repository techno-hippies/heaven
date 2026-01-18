import type { ParentComponent } from 'solid-js'

export const OnboardingLayout: ParentComponent = (props) => {
  return (
    <div class="min-h-screen bg-background">
      {props.children}
    </div>
  )
}

export default OnboardingLayout
