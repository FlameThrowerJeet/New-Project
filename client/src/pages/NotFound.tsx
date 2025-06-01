import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/NotFound.css'

const NotFound = () => {
  useEffect(() => {
    document.title = 'Fogghya - Page Not Found'
  }, [])

  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="home-link">
        Return to Home
      </Link>
    </div>
  )
}

export default NotFound 