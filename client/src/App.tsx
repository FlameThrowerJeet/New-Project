import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import './App.css'

const Home = lazy(() => import('./components/Home'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Home />
      </Suspense>
    </Layout>
  )
}

export default App
