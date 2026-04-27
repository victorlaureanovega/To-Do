import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GoogleGenAI } from '@google/genai'
import { Sparkles } from 'lucide-react'
import SectionCard from '../../../components/common/SectionCard'
import { useAuth } from '../../../hooks/useAuth'
import { isPendingOrOngoingTaskStatus, toEnglishTaskStatus } from '../../../utils/taskStatus'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const geminiApiKey = (import.meta.env.VITE_GEMINI_API_KEY ?? import.meta.env.GEMINI_API_KEY ?? '').trim()
const geminiModel = (import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-3-flash-preview').trim()
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null

const getTaskStatus = (task) => String(
  task?.taskStatus
  ?? task?.status
  ?? task?.taskState
  ?? '',
).trim().toLowerCase()

const isPendingOrInProgressStatus = (task) => {
  const status = getTaskStatus(task)
  return isPendingOrOngoingTaskStatus(status)
}

const getTaskContent = (task) => String(
  task?.content
  ?? task?.description
  ?? task?.title
  ?? 'Untitled task',
)

const getTaskType = (task) => String(
  task?.taskType
  ?? task?.type?.name
  ?? task?.typeName
  ?? 'Unknown',
)

const getEstimatedHours = (task) => String(
  task?.estimatedDuration
  ?? task?.estimatedHours
  ?? 'N/A',
)

const getTaskId = (task, index) => String(task?.taskId ?? task?.id ?? `task-${index}`)

const getTaskStatusLabel = (task) => toEnglishTaskStatus(task?.taskStatus ?? task?.status ?? task?.taskState ?? 'N/A')

const formatEstimatedHours = (task) => {
  const value = task?.estimatedDuration ?? task?.estimatedHours
  if (value === null || value === undefined || value === '') return 'N/A'

  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(numeric)} h`
}

const parseGeminiTaskArray = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Gemini returned an empty response')
  }

  const noFences = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  const firstBracket = noFences.indexOf('[')
  const lastBracket = noFences.lastIndexOf(']')

  if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
    throw new Error('Gemini did not return a JSON array')
  }

  const jsonSlice = noFences.slice(firstBracket, lastBracket + 1)
  const parsed = JSON.parse(jsonSlice)

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response is not an array')
  }

  return parsed
}

export default function DeveloperAiPrioritization() {
  const { user } = useAuth()
  const developerId = String(user?.userId ?? user?.id ?? '').trim()
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [tasksError, setTasksError] = useState(null)
  const [allTasks, setAllTasks] = useState([])

  const [engineerPrompt, setEngineerPrompt] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderingError, setOrderingError] = useState(null)
  const [orderedTasks, setOrderedTasks] = useState([])

  const pendingAndInProgressTasks = useMemo(
    () => allTasks.filter(isPendingOrInProgressStatus),
    [allTasks],
  )

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true)
    setTasksError(null)

    try {
      if (!developerId) {
        throw new Error('No authenticated developer ID available')
      }

      const endpoint = apiBaseUrl
        ? `${apiBaseUrl}/api/tasks/by-developer/${developerId}`
        : `/api/tasks/by-developer/${developerId}`

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Backend responded ${response.status} ${response.statusText}`)
      }

      const payload = await response.json()
      const tasks = Array.isArray(payload) ? payload : []

      setAllTasks(tasks)
      setOrderedTasks([])
    } catch (error) {
      setTasksError(error)
      setAllTasks([])
      setOrderedTasks([])
    } finally {
      setLoadingTasks(false)
    }
  }, [developerId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const orderWithAi = async () => {
    setOrderingError(null)

    if (!pendingAndInProgressTasks.length) {
      setOrderingError(new Error('No pending or in-progress tasks to prioritize'))
      return
    }

    if (!ai) {
      setOrderingError(new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY in frontend .env.local'))
      return
    }

    setOrdering(true)

    try {
      const prompt = `You are now a personal assistant for software engineer working at a big tech company. You have been task with organizing their pending activities by their priroity. you must take into consideration the task, the type, the esimated hours it will take, and the following specific instructions given by the engineer ${engineerPrompt}.\nReturn only an array of tasks, exactly like the one you recieved, but ordered by prirority.\n\nTasks array:\n${JSON.stringify(pendingAndInProgressTasks)}`

      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
      })

      const rawText = typeof response?.text === 'function'
        ? await response.text()
        : String(response?.text ?? '').trim()

      const parsedArray = parseGeminiTaskArray(rawText)
      setOrderedTasks(parsedArray)
    } catch (error) {
      setOrderingError(error)
      setOrderedTasks([])
    } finally {
      setOrdering(false)
    }
  }

  return (
    <div className="developer-task-board">
      <SectionCard
        title="Pending and in-progress tasks"
        subtitle={`${user?.name ?? user?.username ?? `Developer ${developerId || '?'}`} - source for AI prioritization`}
        noPad
      >
        {tasksError && (
          <div style={{ padding: '1rem', color: 'var(--error)' }} role="alert">
            Error loading tasks: {tasksError.message}
          </div>
        )}

        {!tasksError && !loadingTasks && allTasks.length > 0 && pendingAndInProgressTasks.length === 0 && (
          <div style={{ padding: '1rem' }}>
            No tasks with Pending or Ongoing status were found for this user.
          </div>
        )}

        {!tasksError && pendingAndInProgressTasks.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Estimated hours</th>
                </tr>
              </thead>
              <tbody>
                {pendingAndInProgressTasks.map((task, index) => (
                  <tr key={getTaskId(task, index)}>
                    <td>{getTaskContent(task)}</td>
                    <td>{getTaskType(task)}</td>
                    <td>{getTaskStatusLabel(task)}</td>
                    <td>{formatEstimatedHours(task)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="AI ordering controls"
        subtitle="Provide additional guidance before generating your priority order"
      >
        <div className="task-form developer-ai-controls">
          <input
            type="text"
            className="form-input developer-ai-prompt-input"
            placeholder="Ask our AI for any special consideration on your task prioritization"
            value={engineerPrompt}
            onChange={(event) => setEngineerPrompt(event.target.value)}
            disabled={ordering}
          />

          <button
            type="button"
            className="btn btn-ghost developer-ai-order-btn"
            onClick={orderWithAi}
            disabled={ordering || loadingTasks}
          >
            <Sparkles size={14} />
            {ordering ? 'Ordering with AI...' : 'Order my tasks with AI'}
          </button>

          {orderingError && (
            <p className="task-board-error" role="alert">
              AI ordering error: {orderingError.message}
            </p>
          )}
        </div>
      </SectionCard>

      {orderedTasks.length > 0 && (
        <SectionCard
          title="AI-prioritized tasks"
          subtitle="Returned by Gemini in priority order"
          noPad
        >
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Task</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Estimated hours</th>
                </tr>
              </thead>
              <tbody>
                {orderedTasks.map((task, index) => (
                  <tr key={getTaskId(task, index)}>
                    <td>{index + 1}</td>
                    <td>{getTaskContent(task)}</td>
                    <td>{getTaskType(task)}</td>
                    <td>{getTaskStatusLabel(task)}</td>
                    <td>{formatEstimatedHours(task)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  )
}