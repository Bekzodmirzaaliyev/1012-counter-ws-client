import { useRouteError, Link } from "react-router-dom";
import { MessageCircle, Home, RefreshCw, AlertTriangle, WifiOff } from "lucide-react";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  const getErrorInfo = () => {
    if (error?.status === 404) {
      return {
        icon: <MessageCircle className="w-16 h-16 text-blue-400" />,
        title: "Chat Not Found",
        message: "The conversation you're looking for doesn't exist or has been moved.",
        suggestion: "Check the URL or start a new conversation"
      };
    } else if (error?.status >= 500) {
      return {
        icon: <WifiOff className="w-16 h-16 text-red-400" />,
        title: "Server Error",
        message: "Our chat servers are experiencing issues right now.",
        suggestion: "Please try again in a few moments"
      };
    } else {
      return {
        icon: <AlertTriangle className="w-16 h-16 text-amber-400" />,
        title: "Something Went Wrong",
        message: error?.message || "An unexpected error occurred in the chat application.",
        suggestion: "Try refreshing the page or go back to your chats"
      };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />


      <div className="relative max-w-md w-full z-10">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
                {errorInfo.icon}
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              {errorInfo.title}
            </h1>
            <p className="text-gray-300 text-lg mb-2 leading-relaxed">
              {errorInfo.message}
            </p>
            <p className="text-gray-400 text-sm">
              {errorInfo.suggestion}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Link
              to="/"
              className="group flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Back to Chats
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="group flex items-center justify-center gap-3 w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-4 px-6 rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </button>
          </div>

          {/* Status Code */}
          {error?.status && (
            <div className="flex justify-center mt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                Error {error.status}
              </span>
            </div>
          )}

          {/* Connection Indicator */}
          <div className="flex justify-center items-center gap-2 mt-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Connection Active</span>
            </div>
          </div>
        </div>

        {/* Development Stack Trace */}
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <div className="mt-6 backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl p-4">
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-gray-300 hover:text-white transition-colors mb-3 font-medium">
                🔧 Development Error Details
              </summary>
              <pre className="text-xs bg-black/30 text-green-300 p-4 rounded-xl overflow-auto max-h-48 border border-green-500/20 font-mono leading-relaxed">
                {error.stack}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Floating Blurs */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="fixed top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
