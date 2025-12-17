// const PROFILE_ENDPOINT = import.meta.env.VITE_PROFILE_ENDPOINT ?? '/api/auth/profile'

// function ProductPage() {
//   const [profile, setProfile] = useState(null)
//   const [isLoadingProfile, setIsLoadingProfile] = useState(true)

//   useEffect(() => {
//     // Fetch user profile to display username
//     async function loadProfile() {
//       try {
//         const response = await fetch(PROFILE_ENDPOINT, {
//           method: 'GET',
//           credentials: 'include', // Include cookies (HttpOnly cookie will be sent automatically)
//         })

//         if (response.ok) {
//           const data = await response.json()
//           setProfile(data)
//         }
//       } catch (err) {
//         // User not logged in or error - that's okay, show sign in/sign up buttons
//       } finally {
//         setIsLoadingProfile(false)
//       }
//     }

//     loadProfile()
//   }, [])

//   const isLoggedIn = profile !== null
//   const displayName = profile?.username || 'User'
//   const avatarInitial = displayName.charAt(0).toUpperCase()

//   {!isLoadingProfile && (
//     <>
//       {!isLoggedIn ? (
//         <div className="auth-buttons">
//           <Link to="/login" className="auth-button ghost">
//             Sign In
//           </Link>
//           <Link to="/signup" className="auth-button primary">
//             Sign Up
//           </Link>
//         </div>
//       ) : (
//         <div className="top-actions">
//           <button className="icon-button" aria-label="Notifications">
//             🔔
//           </button>
//           <Link to="/profile" className="profile-link" aria-label="Go to profile">
//             <span className="avatar">{avatarInitial}</span>
//             <span className="profile-name">{displayName}</span>
//           </Link>
//         </div>
//       )}
//     </>
//   )}
// </header>
