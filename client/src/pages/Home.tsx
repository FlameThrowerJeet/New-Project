import { useEffect } from 'react'
import '../styles/Home.css'

const Home = () => {
  useEffect(() => {
    document.title = 'Fogghya - Home'
  }, [])

  return (
    <div className="home">
      <header className="hero">
        <h1>Welcome to Fogghya</h1>
        <p>Your ultimate platform for content creation and streaming</p>
      </header>
      
      <section className="features">
        <div className="feature-card">
          <h2>Live Streaming</h2>
          <p>Stream your content in real-time with our powerful streaming platform</p>
        </div>
        
        <div className="feature-card">
          <h2>Content Creation</h2>
          <p>Create and share your content with our easy-to-use tools</p>
        </div>
        
        <div className="feature-card">
          <h2>Community</h2>
          <p>Connect with other creators and build your audience</p>
        </div>
      </section>
    </div>
  )
}

export default Home 