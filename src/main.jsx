import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Register from "./pages/Register.jsx"
import Login from "./pages/Login.jsx"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { persistor, store } from './redux/store.js'
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import PrivateRouter from './guard/PrivateRouter.jsx'
import Chat from "./pages/Chat.jsx"
  import { ToastContainer } from 'react-toastify';

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRouter>
      <App />
    </PrivateRouter>,
    children: [
      {
        path: "/chat/:user",
        element: <Chat />
      }
    ]
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/login",
    element: <Login />
  }
]);

// isAuth = false


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
        <ToastContainer />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
