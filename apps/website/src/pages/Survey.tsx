import type { Component } from 'solid-js'
import { SurveyCard } from '@/features/survey/components/SurveyCard'

// Mock data - would come from user's survey progress
const mockSurveys = [
  {
    title: 'Lifestyle',
    category: 'lifestyle' as const,
    description: 'Smoking, drinking, diet, and fitness',
    total: 5,
    completed: 5,
  },
  {
    title: 'Intimacy',
    category: 'intimacy' as const,
    description: 'Preferences, boundaries, and experience',
  },
  {
    title: 'Work',
    category: 'work' as const,
    description: 'Career, education, and ambition',
  },
  {
    title: 'Body',
    category: 'body' as const,
    description: 'Height, body type, and fitness',
  },
]

export const SurveyPage: Component = () => {
  return (
    <div class="min-h-screen p-4 md:p-8">
      <div class="max-w-2xl mx-auto space-y-3">
        {mockSurveys.map((survey) => (
          <SurveyCard
            title={survey.title}
            category={survey.category}
            description={survey.description}
            total={survey.total}
            completed={survey.completed}
            onClick={() => console.log(`Navigate to ${survey.category} survey`)}
          />
        ))}
      </div>
    </div>
  )
}

export default SurveyPage
