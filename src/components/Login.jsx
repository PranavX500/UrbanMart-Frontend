import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import illustration from '../assets/signup-illustration.png'
import './Login.css'

const IconUser = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 12.5c3 0 5.5-2.3 5.5-5.2S15 2 12 2 6.5 4.3 6.5 7.3 9 12.5 12 12.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M4 20.2c.7-3.1 3.9-5.4 8-5.4s7.3 2.3 8 5.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const IconKey = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle
      cx="8.5"
      cy="9"
      r="4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="m11.9 12.3 4.2 4.3v2.4h2.5V17h2.4v-2.5h-2.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function InputField({
  label,
  type = 'text',
  name,
  placeholder,
  icon,
  value,
  onChange,
  autoComplete,
}) {
  return (
    <label className="input-group">
      <span className="input-label">{label}</span>
      <div className="input-wrapper">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        <span className="input-icon">{icon}</span>
      </div>
    </label>
  )
}

const initialFormState = {
  username: '',
  password: '',
}

function Login() {
  const [formData, setFormData] = useState(initialFormState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ⭐ REQUIRED FOR COOKIES
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      let errorMessage = 'Login failed. Please try again.'

      if (!response.ok) {
        try {
          const data = await response.json()
          errorMessage = data.message || data.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // No localStorage token — cookie is HttpOnly
      navigate('/')
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check if the server is running.')
      } else {
        setError(err.message || 'An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-visual">
          <img src={illustration} alt="Abstract black and white collage" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <header className="form-header">
            <p className="eyebrow">Welcome back</p>
            <h1>Log in</h1>
          </header>

          <InputField
            label="Username"
            name="username"
            placeholder="Enter your username"
            icon={<IconUser />}
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            icon={<IconKey />}
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>

          <p className="footer-text">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Login
