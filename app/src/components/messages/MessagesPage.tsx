/**
 * MessagesPage - Main messages page using MessagesView
 * Shows messages list and conversation view
 */

import type { Component } from 'solid-js'
import { cn } from '@/lib/utils'
import { MessagesView } from './MessagesView'

export const MessagesPage: Component<{ class?: string }> = (props) => {
  return (
    <MessagesView class={cn('h-full', props.class)} />
  )
}

export default MessagesPage
