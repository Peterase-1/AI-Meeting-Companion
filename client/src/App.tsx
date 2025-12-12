import { Routes, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { InputSection } from './components/InputSection'
import { OutputSection } from './components/OutputSection'
import { CanvasBackground } from './components/InteractiveBackground'
import { AuthModal } from './components/Auth/AuthModal'
import { AuthModalProvider } from './contexts/AuthModalContext'
import type { RootState, AppDispatch } from './store'
import { loadUser } from './features/authSlice'
import { ProfilePage } from './pages/ProfilePage'


function App() {
  const { token, user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (token && !user) {
      dispatch(loadUser())
    }
  }, [token, user, dispatch])

  return (
    <AuthModalProvider>
      <AuthModal />
      <Routes>
        <Route path="/" element={
          <Layout>
            <CanvasBackground />
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 relative z-10">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white">
                AI Meeting Companion
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                Transform your meetings with AI-powered summaries, action items, and more.
              </p>
            </div>

            <div className="w-full max-w-4xl mx-auto relative z-10 mb-8">
              <InputSection />
            </div>

            <OutputSection />
          </Layout>
        } />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </AuthModalProvider>
  )
}

export default App
