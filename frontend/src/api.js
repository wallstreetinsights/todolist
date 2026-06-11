const API_BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function fetchTodos() {
  return request('/api/todos')
}

export function createTodo(title) {
  return request('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function updateTodo(id, payload) {
  return request(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteTodo(id) {
  return request(`/api/todos/${id}`, {
    method: 'DELETE',
  })
}
