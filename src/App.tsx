import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<div>Techview - IT 취준생을 위한 기술 모의면접 서비스</div>} />
      </Routes>
    </div>
  )
}

export default App

