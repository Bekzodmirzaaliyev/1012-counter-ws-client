import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom' //use - hook

const PrivateRouter = ({ children }) => {
    const isAuth = useSelector(state => state.auth.isAuth)
    const navigate = useNavigate() // routerni o'zgartirvoti


    console.log("DEBUG:", isAuth)


    useEffect(() => {
        if (!isAuth) {
            navigate("/login")
        }
    }, [isAuth])

    return children
}

export default PrivateRouter