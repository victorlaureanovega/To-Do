import AppRouter from './app/routes/AppRouter'

function App() {
  return (
    <div className="app-root">
      <div className="app-background-layer" aria-hidden="true">
        <div className="app-background-shape app-background-shape--one" />
        <div className="app-background-shape app-background-shape--two" />
        <div className="app-background-shape app-background-shape--three" />
        <div className="app-background-tint" />
      </div>

      <div className="app-content-layer">
        <AppRouter />
      </div>
    </div>
  )
}

export default App
