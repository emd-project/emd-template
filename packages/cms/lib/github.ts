const API = 'https://api.github.com'

/** Encode Uint8Array to base64 (safe for UTF-8 content) */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

type GHFile = {
  name: string
  path: string
  sha: string
  type: 'file' | 'dir'
  size: number
  download_url: string | null
}

type GHFileContent = {
  content: string
  sha: string
  name: string
  path: string
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

/** List files in a directory */
export async function listFiles(
  token: string,
  repo: string,
  path: string,
  branch: string
): Promise<GHFile[]> {
  const url = `${API}/repos/${repo}/contents/${path}?ref=${branch}`
  const res = await fetch(url, { headers: headers(token), cache: 'no-store' })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/** Get a single file's content (base64 decoded) */
export async function getFile(
  token: string,
  repo: string,
  path: string,
  branch: string
): Promise<{ content: string; sha: string } | null> {
  const url = `${API}/repos/${repo}/contents/${path}?ref=${branch}`
  const res = await fetch(url, { headers: headers(token), cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const data = (await res.json()) as GHFileContent
  // Decode base64 → binary → UTF-8 (atob alone breaks accented chars)
  const binary = atob(data.content.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  const content = new TextDecoder('utf-8').decode(bytes)
  return { content, sha: data.sha }
}

/** Create or update a file */
export async function putFile(
  token: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string
): Promise<{ sha: string }> {
  const url = `${API}/repos/${repo}/contents/${path}`
  const body: Record<string, unknown> = {
    message,
    content: uint8ToBase64(new TextEncoder().encode(content)),
    branch,
  }
  if (sha) body.sha = sha

  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub PUT error: ${res.status} ${err.message ?? ''}`)
  }

  const data = await res.json()
  return { sha: data.content.sha }
}

/** Delete a file */
export async function deleteFile(
  token: string,
  repo: string,
  path: string,
  sha: string,
  message: string,
  branch: string
): Promise<void> {
  const url = `${API}/repos/${repo}/contents/${path}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch }),
  })
  if (!res.ok) throw new Error(`GitHub DELETE error: ${res.status}`)
}

/** Batch commit multiple files atomically via Git Trees API */
export type BatchFileChange = { path: string; content: string }

export async function batchPutFiles(
  token: string,
  repo: string,
  branch: string,
  files: BatchFileChange[],
  message: string
): Promise<{ commitSha: string }> {
  if (files.length === 0) throw new Error('No files to commit')
  const h = { ...headers(token), 'Content-Type': 'application/json' }

  const refRes = await fetch(`${API}/repos/${repo}/git/ref/heads/${branch}`, { headers: headers(token) })
  if (!refRes.ok) throw new Error(`git/ref failed: ${refRes.status}`)
  const refData = (await refRes.json()) as { object: { sha: string } }
  const baseCommitSha = refData.object.sha

  const commitRes = await fetch(`${API}/repos/${repo}/git/commits/${baseCommitSha}`, { headers: headers(token) })
  if (!commitRes.ok) throw new Error(`git/commits failed: ${commitRes.status}`)
  const commitData = (await commitRes.json()) as { tree: { sha: string } }

  const treeRes = await fetch(`${API}/repos/${repo}/git/trees`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      base_tree: commitData.tree.sha,
      tree: files.map((f) => ({ path: f.path, mode: '100644' as const, type: 'blob' as const, content: f.content })),
    }),
  })
  if (!treeRes.ok) throw new Error(`git/trees failed: ${treeRes.status}`)
  const treeData = (await treeRes.json()) as { sha: string }

  const newCommitRes = await fetch(`${API}/repos/${repo}/git/commits`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ message, tree: treeData.sha, parents: [baseCommitSha] }),
  })
  if (!newCommitRes.ok) throw new Error(`git/commits create failed: ${newCommitRes.status}`)
  const newCommitData = (await newCommitRes.json()) as { sha: string }

  const updateRes = await fetch(`${API}/repos/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers: h,
    body: JSON.stringify({ sha: newCommitData.sha }),
  })
  if (!updateRes.ok) throw new Error(`git/refs update failed: ${updateRes.status}`)

  return { commitSha: newCommitData.sha }
}

/** Upload a binary file (for images) */
export async function uploadBinary(
  token: string,
  repo: string,
  path: string,
  base64Content: string,
  message: string,
  branch: string
): Promise<{ sha: string }> {
  const url = `${API}/repos/${repo}/contents/${path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: base64Content, branch }),
  })
  if (!res.ok) throw new Error(`GitHub upload error: ${res.status}`)
  const data = await res.json()
  return { sha: data.content.sha }
}
