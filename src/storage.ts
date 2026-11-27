import { seedData } from './data'
import type { DemoData } from './types'

const KEY = 'hopecare-ai-demo-v2'

export function loadData(): DemoData {
  try {
    const saved = localStorage.getItem(KEY)
    return saved ? JSON.parse(saved) as DemoData : structuredClone(seedData)
  } catch {
    return structuredClone(seedData)
  }
}

export function saveData(data: DemoData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function resetData(): DemoData {
  const fresh = structuredClone(seedData)
  saveData(fresh)
  return fresh
}
