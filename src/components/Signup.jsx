import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import illustration from '../assets/signup-illustration.png'
import './Signup.css'

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
  email: '',
  username: '',
  password: '',
  phoneNo: '',
  terms: false,
}

function Signup() {
  const [formData, setFormData] = useState(initialFormState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8080/auth/signup', {
        method: 'POST',
        credentials: 'include',           // ⭐ REQUIRED for CORS + Cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          phoneNo: formData.phoneNo,
          emailId: formData.email,
        }),
      })

      let errorMessage = 'Signup failed. Please try again.'

      if (!response.ok) {
        try {
          const data = await response.json()
          errorMessage = data.message || data.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      navigate('/otp')
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
    <main className="signup-page">
      <section className="signup-card">
        <div className="signup-visual">
          <img src={illustration} alt="Abstract black and white collage" />
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <header className="form-header">
            <p className="eyebrow">Join us for exclusive deals</p>
            <h1>Sign up</h1>
          </header>

          <InputField
            label="Username"
            name="username"
            placeholder="Choose your username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <InputField
            label="Phone Number"
            name="phoneNo"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phoneNo}
            onChange={handleChange}
            autoComplete="tel"
          />

          <InputField
            label="Create your password"
            name="password"
            type="password"
            placeholder="••••••••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {error && <div className="error-message">{error}</div>}

          <label className="terms-row">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              required
            />
            <span>
              I accept <a href="/">Terms and Privacy Policy</a>.
            </span>
          </label>

          <button type="submit" className="signup-button" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>

          <p className="footer-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Signup
