import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import io from "socket.io-client"

const socket = io('http://localhost:8000')

function App() {
  const [count, setCount] = useState("JUrat bich")



  return (
    <>
      <p onClick={() => setCount("AbduLahm")}>{count}</p>
    </>
  )
}

export default App
