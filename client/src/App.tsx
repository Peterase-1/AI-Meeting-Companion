import { Layout } from './components/Layout'
import { InputSection } from './components/InputSection'

function App() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
          AI Meeting Companion
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Transform your meetings with AI-powered summaries, action items, and more.
        </p>
      </div>
      <InputSection />
    </Layout>
  )
}

export default App
