import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { persistor, store } from './redux/store.js'
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

// Lazy load komponenlari
const App = lazy(() => import('./App.jsx'));
const Register = lazy(() => import("./pages/Register.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const PrivateRouter = lazy(() => import('./guard/PrivateRouter.jsx'));
const Chat = lazy(() => import("./pages/Chat.jsx"));

// Loading komponenti
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
    <div className="text-center">
      {/* Main loading animation */}
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-base-100 border-t-accent rounded-full animate-spin mx-auto"></div>
        <div className="w-16 h-16 border-4 border-transparent border-t-secondary rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2 animate-pulse"></div>
      </div>
      
      {/* Loading text */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-base-100 animate-pulse">
          Loading...
        </h2>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-base-100 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-base-100 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-base-100 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  </div>
);

// PersistGate uchun loading komponenti
const PersistLoading = () => (
  <div className="min-h-screen bg-base-200 flex items-center justify-center">
    <div className="text-center">
      <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
      <p className="text-base-content/70">Restoring data...</p>
    </div>
  </div>
);

// Page-specific loading komponenti - kattaroq va yaxshiroq
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        <div className="w-12 h-12 border-4 border-transparent border-t-secondary rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2" style={{animationDirection: 'reverse'}}></div>
      </div>
      <h3 className="text-lg font-semibold text-base-content mb-2 animate-pulse">Loading page...</h3>
      <div className="flex justify-center space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  </div>
);

// Chat o'tish uchun maxsus loading komponenti
const ChatTransitionLoading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-14 h-14 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto"></div>
        <div className="w-10 h-10 border-3 border-transparent border-t-secondary rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
        <div className="w-6 h-6 border-2 border-transparent border-t-primary rounded-full animate-spin absolute top-4 left-1/2 transform -translate-x-1/2" style={{animationDuration: '0.6s'}}></div>
      </div>
      <h3 className="text-base font-medium text-base-content mb-3 animate-pulse">Loading chat...</h3>
      <div className="flex justify-center space-x-1">
        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoading />}>
        <PrivateRouter>
          <App />
        </PrivateRouter>
      </Suspense>
    ),
    children: [
      {
        path: "/chat/:user",
        element: (
          <Suspense fallback={<ChatTransitionLoading />}>
            <Chat />
          </Suspense>
        )
      }
    ]
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Register />
      </Suspense>
    )
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    )
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        <Suspense fallback={<LoadingSpinner />}>
          <RouterProvider router={router} />
        </Suspense>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </PersistGate>
    </Provider>
  </StrictMode>,
)