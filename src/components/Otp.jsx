import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import illustration from '../assets/signup-illustration.png'
import './Otp.css'

function Otp() {
  const [otp, setOtp] = useState(['', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (error) setError('')

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()

    if (/^\d{4}$/.test(pasted)) {
      setOtp(pasted.split(''))
      inputRefs.current[3]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')

    if (otpValue.length !== 4) {
      setError('Please enter a 4-digit OTP')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch("http://localhost:8080/OTP/Validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ⭐ REQUIRED FOR CORS WITH COOKIES
        body: JSON.stringify({
          otp: parseInt(otpValue, 10),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || data.error || "OTP validation failed")
      }

      navigate('/login')

    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="otp-page">
      <section className="otp-card">
        <div className="otp-visual">
          <img src={illustration} alt="Collage" />
        </div>

        <form className="otp-form" onSubmit={handleSubmit}>
          <header className="form-header">
            <p className="eyebrow">Verify your account</p>
            <h1>Enter OTP</h1>
            <p className="otp-description">
              We've sent a 4-digit code to your email. Please enter it below.
            </p>
          </header>

          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="otp-input"
                required
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="otp-button" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          <p className="resend-text">
            Didn't receive the code?{" "}
            <button type="button" className="resend-link">
              Resend
            </button>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Otp
