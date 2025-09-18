import './App.css'
import { Button } from './components/ui/button'

function App() {

  return (
    <>
      <div className="p-4 text-shadow-lg">Hello Tailwind v4.1!</div>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button>Click me</Button>
      </div>
    </>
  )
}

export default App
