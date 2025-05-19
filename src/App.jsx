import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import io from "socket.io-client"
import './App.css'

// const socket = io('http://localhost:8000') // Убедись, что порт совпадает
const socket = io('https://one012-counter-ws-server.onrender.com') // Убедись, что порт совпадает

function App() {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const user = useSelector(state => state.auth?.user?.newUser)

  useEffect(() => {
    console.log("USER:", user)
    if (!user) return

    socket.emit("connected", user)

    socket.on("users", (users) => {
      console.log("🔥 Online Users: ", users)
      setOnlineUsers(users)
      setLoading(false)
    })

    return () => {
      socket.off("users")
    }
  }, [user])

  const getAllUsers = async () => {
    try {
      const request = await fetch('http://localhost:8000/api/v1/auth/getAllUsers')
      const response = await request.json()
      setUsers(response)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllUsers()
  })
  return (
    <div className='flex'>
      {/* Левая панель */}
      <div className='w-3/12 h-screen bg-base-300 border-r'>
        {loading ? (
          <div className='h-full w-full flex justify-center items-center'>
            <span className="loading loading-bars loading-xl"></span>
          </div>
        ) : (
          <div className='h-full w-full overflow-y-auto p-2 flex flex-col gap-5'>
            {onlineUsers.length > 0 ? (
              onlineUsers.map((item, index) => (
                <div key={index} className='flex items-center gap-5 p-2 bg-base-100 rounded-xl shadow'>
                  <img
                    src={item.profileImage || "https://via.placeholder.com/64"}
                    className='size-16 rounded-full object-cover'
                    alt="profile"
                  />
                  <div className='flex flex-col gap-1'>
                    <span className='font-bold text-lg'>{item.username}</span>
                    <span className='text-success text-xs font-bold'>🟢 {item.status || "Online"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-sm text-gray-400'>No online users</div>
            )}
          </div>
        )}
      </div>

      {/* Правая часть — контент по маршрутам */}
      <div className='w-9/12 h-screen overflow-y-auto p-4'>
        <Outlet />
      </div>
    </div>
  )
}

export default App
