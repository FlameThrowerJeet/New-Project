import { Suspense, lazy, useState } from 'react'
import Layout from './components/Layout'
import ChoudharyLogin from './components/ChoudharyLogin'
import './App.css'

const Home = lazy(() => import('./components/Home'))

interface UserData {
  firstName: string;
  aadharNumber: string;
  fullName: string;
}

function App() {
  // Skip login - go directly to Home
  const userData: UserData = {
    firstName: "User",
    aadharNumber: "1234567890",
    fullName: "Default User"
  };

  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Home userData={userData} />
      </Suspense>
    </Layout>
  )
}

export default App
