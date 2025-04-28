import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import io from "socket.io-client"

const socket = io('http://localhost:8000')

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    socket.on('counterUpdate', (value) => {
      setCount(value)
    })

    return () => {
      socket.off('counterUpdate')
    }
  }, [])

  const increment = () => {
    socket.emit("increment")
  }

  const decrement = () => {
    socket.emit('decrement')
  }

  return (
    <>
      <p>SON: {count}</p>
      <button className='' onClick={() => increment()}>Increment</button>
      <button className='' onClick={() => decrement()}>Decrement</button>
    </>
  )
}

export default App
