import React from "react";
import { ImCross } from "react-icons/im";
import socket from "../Socket";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const DrawerUser = ({ selectedUser, isOpen, onClose }) => {
  const user = useSelector((state) => state?.auth?.user?.user);
  console.log("USER: ", user);

  const makeAdmin = async ({ userID, selectedUser, role }) => {
    console.log("DEBUG MAKEADMIN: ", { userID, selectedUser, role });
    socket.emit("setAdmin", { userID, selectedUser, role });
  };

  const makeModerator = async ({ userID, selectedUser, role }) => {
    socket.emit("setAdmin", { userID, selectedUser, role });
  };

  const makeVIP = async ({ userID, selectedUser, role }) => {
    socket.emit("setAdmin", { userID, selectedUser, role });
  };

  const makeUser = async ({ userID, selectedUser, role }) => {
    socket.emit("setAdmin", { userID, selectedUser, role });
  };

  const handleBan = async ({ userID, selectedUser, reason }) => {
    try {
      socket.emit("ban", { userID, selectedUser, reason });
    } catch (e) {
      toast.error("F Socket: ", e);
    }
  };

  const handleUnBan = async ({ userID, selectedUser }) => {
    try {
      socket.emit("unban", { userID, selectedUser });
    } catch (e) {
      toast.error("F Socket: ", e);
    }
  };

  const handleMute = async ({ userID, selectedUser }) => {
    try {
      socket.emit("mute", { userID, selectedUser });
    } catch (e) {
      toast.error("F Socket: ", e);
    }
  };

  const handleUnmute = async ({ userID, selectedUser }) => {
    try {
      socket.emit("unmute", { userID, selectedUser });
    } catch (e) {
      toast.error("F Socket: ", e);
    }
  };

  const handleWarn = async ({ userID, selectedUser, reason }) => {
    try {
      socket.emit("warn", { userID, selectedUser, reason });
    } catch (e) {
      toast.error("F Socket: ", e);
    }
  };

  const handleKick = async ({ userID, selectedUser }) => {
    try {
      socket.emit("kick", { userID, selectedUser });
    } catch (e) {
      toast.error("F Socket: ", e);
    }
  };

  const hasAdminPrivileges =
    user?.role === "admin" ||
    user?.role === "owner" ||
    user?.role === "moderator";

  return (
    <div className={`drawer drawer-end ${isOpen ? "drawer-open" : ""}`}>
      <input
        id="user-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={onClose}
      />

      <div className="drawer-side z-50">
        <label
          htmlFor="user-drawer"
          className="drawer-overlay bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        ></label>

        {/* Main Drawer with Glassmorphism */}
        <div className="menu p-0 w-96 min-h-full relative overflow-hidden flex flex-col shadow-2xl">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-blue-500/20 to-cyan-400/20 animate-gradient-xy"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-300/10 via-transparent to-yellow-300/10"></div>

          {/* Glassmorphism Layer */}
          <div className="absolute inset-0 backdrop-blur-xl bg-white/10 dark:bg-black/20 border-l border-white/20"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header with Enhanced Glassmorphism */}
            <div className="sticky top-0 backdrop-blur-2xl bg-white/20 dark:bg-black/30 border-b border-white/20 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-base-content drop-shadow-lg">
                User Profile
              </h2>
              <button
                className="btn btn-ghost btn-sm btn-circle hover:bg-white/20 hover:backdrop-blur-sm transition-all duration-300 border border-white/10"
                onClick={onClose}
              >
                <ImCross className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* User Profile Section with Glass Card */}
              <div className="p-6 pb-4">
                <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 rounded-3xl p-6 border border-white/20 shadow-xl">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      {/* Avatar with Glowing Border */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 animate-spin-slow blur-sm opacity-75"></div>
                      <img
                        src={
                          selectedUser?.profileImage ||
                          "https://via.placeholder.com/150"
                        }
                        alt="avatar"
                        className="relative w-24 h-24 rounded-full border-4 border-white/30 object-cover shadow-2xl backdrop-blur-sm"
                      />
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white/50 shadow-lg animate-pulse"></div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-base-content drop-shadow-lg">
                        {selectedUser?.username}
                      </h3>
                      <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-white/20 font-medium text-sm shadow-lg">
                        {selectedUser?.grade || "Student"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info Section with Enhanced Glass */}
              <div className="px-6 pb-6">
                <div className="backdrop-blur-lg bg-gradient-to-br from-white/15 to-white/5 dark:from-black/25 dark:to-black/10 rounded-2xl p-5 border border-white/20 shadow-xl">
                  <h4 className="font-semibold text-base-content/90 text-sm uppercase tracking-wider mb-4 drop-shadow-sm">
                    User Information
                  </h4>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/10">
                      <span className="text-sm font-medium text-base-content/80">
                        Email
                      </span>
                      <span className="text-sm font-semibold text-base-content truncate max-w-48">
                        {selectedUser?.email || "Not provided"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/10">
                      <span className="text-sm font-medium text-base-content/80">
                        User ID
                      </span>
                      <span className="text-sm font-mono text-base-content/70 truncate max-w-32">
                        {selectedUser?._id || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/10">
                      <span className="text-sm font-medium text-base-content/80">
                        Role
                      </span>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm shadow-lg ${
                          selectedUser?.role === "admin"
                            ? "bg-gradient-to-r from-red-500/30 to-pink-500/30 border-red-300/50 text-red-100"
                            : selectedUser?.role === "moderator"
                            ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-300/50 text-yellow-100"
                            : selectedUser?.role === "vip"
                            ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-300/50 text-blue-100"
                            : "bg-gradient-to-r from-gray-500/30 to-slate-500/30 border-gray-300/50 text-gray-100"
                        }`}
                      >
                        {selectedUser?.role || "user"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Panel with Enhanced Glass Effects */}
              {hasAdminPrivileges && (
                <div className="px-6 pb-6 space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 my-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                      <span className="text-sm font-bold text-primary uppercase tracking-wider px-4 py-2 bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-primary/30 shadow-lg">
                        Admin Panel
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    </div>
                  </div>

                  {/* Role Management with Glass Cards */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-base-content/90 uppercase tracking-wider drop-shadow-sm">
                      Role Management
                    </h5>

                    <div className="backdrop-blur-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/30 rounded-2xl p-4 shadow-xl">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-primary/80 to-blue-600/80 backdrop-blur-sm border-primary/50 hover:from-primary hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            makeAdmin({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                              role: "admin",
                            })
                          }
                        >
                          Make Admin
                        </button>
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-primary/30 to-blue-600/30 backdrop-blur-sm border-primary/50 hover:from-primary/50 hover:to-blue-600/50 text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            makeModerator({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                              role: "moderator",
                            })
                          }
                        >
                          Make Moderator
                        </button>
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-info/80 to-cyan-600/80 backdrop-blur-sm border-info/50 hover:from-info hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            makeVIP({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                              role: "vip",
                            })
                          }
                        >
                          Make VIP
                        </button>
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-gray-500/30 to-slate-600/30 backdrop-blur-sm border-gray-400/50 hover:from-gray-500/50 hover:to-slate-600/50 text-gray-200 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            makeUser({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                              role: "user",
                            })
                          }
                        >
                          Make User
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Moderation Actions with Glass Cards */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-base-content/90 uppercase tracking-wider drop-shadow-sm">
                      Moderation Actions
                    </h5>

                    <div className="backdrop-blur-lg bg-gradient-to-br from-error/10 to-red-600/10 border border-error/30 rounded-2xl p-4 shadow-xl">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-error/80 to-red-600/80 backdrop-blur-sm border-error/50 hover:from-error hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            handleBan({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                              reason: "Admin action",
                            })
                          }
                        >
                          Ban User
                        </button>
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-warning/80 to-orange-600/80 backdrop-blur-sm border-warning/50 hover:from-warning hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            handleWarn({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                              reason: "Admin warning",
                            })
                          }
                        >
                          Warn User
                        </button>
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-error/30 to-red-600/30 backdrop-blur-sm border-error/50 hover:from-error/50 hover:to-red-600/50 text-error font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            handleMute({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                            })
                          }
                        >
                          Mute User
                        </button>
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-error/30 to-red-600/30 backdrop-blur-sm border-error/50 hover:from-error/50 hover:to-red-600/50 text-error font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            handleKick({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                            })
                          }
                        >
                          Kick User
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recovery Actions with Glass Cards */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-base-content/90 uppercase tracking-wider drop-shadow-sm">
                      Recovery Actions
                    </h5>

                    <div className="backdrop-blur-lg bg-gradient-to-br from-success/10 to-green-600/10 border border-success/30 rounded-2xl p-4 shadow-xl">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-success/80 to-green-600/80 backdrop-blur-sm border-success/50 hover:from-success hover:to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            handleUnBan({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                            })
                          }
                        >
                          Unban User
                        </button>
                        <button
                          className="btn btn-sm text-xs h-10 bg-gradient-to-r from-success/30 to-green-600/30 backdrop-blur-sm border-success/50 hover:from-success/50 hover:to-green-600/50 text-success font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          onClick={() =>
                            handleUnmute({
                              userID: user._id,
                              selectedUser: selectedUser._id,
                            })
                          }
                        >
                          Unmute User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DrawerUser;
