import { useEffect, useState } from 'react'
import { createTodo, deleteTodo, fetchTodos, updateTodo } from './api'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadTodos = async () => {
    try {
      setError('')
      const data = await fetchTodos()
      setTodos(data)
    } catch (err) {
      setError(err.message || 'Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setSubmitting(true)
    setError('')

    try {
      const created = await createTodo(trimmed)
      setTodos((current) => [created, ...current])
      setTitle('')
    } catch (err) {
      setError(err.message || 'Failed to create todo')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTodo = async (todo) => {
    setError('')

    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed })
      setTodos((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (err) {
      setError(err.message || 'Failed to update todo')
    }
  }

  const removeTodo = async (id) => {
    setError('')

    try {
      await deleteTodo(id)
      setTodos((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete todo')
    }
  }

  return (
    <main className="app">
      <section className="card">
        <header className="header">
          <p className="eyebrow">FastAPI + React</p>
          <h1>Todo List</h1>
          <p className="subtitle">输入任务，调用接口，后端写入数据库。</p>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="添加一个新任务..."
            disabled={submitting}
          />
          <button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="status">Loading todos...</p>
        ) : todos.length === 0 ? (
          <p className="status">还没有任务，先添加一条吧。</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                <label className="todo-item">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                  />
                  <span>{todo.title}</span>
                </label>
                <button
                  type="button"
                  className="delete"
                  onClick={() => removeTodo(todo.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
