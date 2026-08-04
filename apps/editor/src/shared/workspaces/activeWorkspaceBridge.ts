export const ACTIVE_WORKSPACE_STORAGE_KEY = 'homepage_active_workspace_id'

type ActiveWorkspaceResponse = {
  success?: boolean
  data?: {
    workspaceId?: string | null
  }
}

function resolveHomepageOrigin(): string {
  const env = (import.meta as any).env || {}
  const configuredOrigin = env.VITE_HOMEPAGE_ORIGIN || env.VITE_HOMEPAGE_URL
  if (configuredOrigin) return String(configuredOrigin)

  const proto = window.location.protocol
  const host = window.location.hostname
  return `${proto}//${host}:3000`
}

export function getStoredActiveWorkspaceId(): string | null {
  try {
    return window.sessionStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)
  } catch {
    return null
  }
}

export function storeActiveWorkspaceId(workspaceId: string): void {
  try {
    window.sessionStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId)
  } catch {
    // ignore storage failures
  }
}

export function clearStoredActiveWorkspaceId(): void {
  try {
    window.sessionStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY)
  } catch {
    // ignore storage failures
  }
}

export async function fetchActiveWorkspaceIdFromBridge(): Promise<string | null> {
  const origin = resolveHomepageOrigin().replace(/\/+$/, '')
  const url = `${origin}/api/workspaces/active`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to read active workspace (${response.status})`)
  }

  const payload = await response.json() as ActiveWorkspaceResponse
  const workspaceId = typeof payload?.data?.workspaceId === 'string' ? payload.data.workspaceId : null
  if (workspaceId) {
    storeActiveWorkspaceId(workspaceId)
  }

  return workspaceId
}
