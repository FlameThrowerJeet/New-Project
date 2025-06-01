import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import './App.css'

// Lazy load components for better performance
const Home = lazy(() => import('./components/Home'))
const Images = lazy(() => import('./components/Images'))
const Videos = lazy(() => import('./components/Videos'))
const Game = lazy(() => import('./components/Game'))
const RoutineTracker = lazy(() => import('./components/Planner'))
const Marketplace = lazy(() => import('./components/Marketplace'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/game" element={<Game />} />
          <Route path="/routine-tracker" element={<RoutineTracker />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
