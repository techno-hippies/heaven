import { Component, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

// Redirect to home - welcome is now inline there
export const WelcomePage: Component = () => {
  const navigate = useNavigate()

  onMount(() => {
    navigate('/', { replace: true })
  })

  return null
}

export default WelcomePage
