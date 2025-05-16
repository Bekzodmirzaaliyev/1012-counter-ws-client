import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import io from "socket.io-client"
import { Outlet } from 'react-router-dom'

const socket = io('http://localhost:8000')

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
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
  }, [])

  console.log(users)

  return (
    <>
      <div className='flex'>
        <div className='w-3/12 h-screen bg-base-300'>
          {
            loading ? (
              <div className='h-full w-full flex justify-center items-center'>
                <span className="loading loading-bars loading-xl"></span>
              </div>
            ) : (
              <div className='h-full w-full overflow-y-auto p-2 flex flex-col gap-5'>
                {
                  users.length > 0 ? (
                    users.map((item, index) => (
                      <div className='flex items-center gap-5'>
                        <div>
                          <img src={item.profileImage} className='size-16 rounded-full object-cover' alt="" />
                        </div>
                        <div className='flex flex-col gap-2'>
                          <span>{item.username}</span>
                          <span className='text-error'>{item.status || "Offline"}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='h-full w-full flex justify-center items-center'>
                      <span>No users</span>
                    </div>
                  )
                }
              </div>
            )
          }
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default App
