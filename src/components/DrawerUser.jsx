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
          className="drawer-overlay"
          onClick={onClose}
        ></label>

        <div className="menu p-0 w-96 min-h-full bg-base-100 text-base-content flex flex-col shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/75 border-b border-base-300 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-base-content">
              User Profile
            </h2>
            <button
              className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-colors duration-200"
              onClick={onClose}
            >
              <ImCross className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* User Profile Section */}
            <div className="p-6 pb-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <img
                    src={
                      selectedUser?.profileImage ||
                      "https://via.placeholder.com/150"
                    }
                    alt="avatar"
                    className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-success rounded-full border-2 border-base-100"></div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-base-content">
                    {selectedUser?.username}
                  </h3>
                  <div className="badge badge-outline badge-lg font-medium">
                    {selectedUser?.grade || "Student"}
                  </div>
                </div>
              </div>
            </div>

            {/* User Info Section */}
            <div className="px-6 pb-6">
              <div className="bg-base-200/50 rounded-2xl p-5 space-y-4">
                <h4 className="font-semibold text-base-content/80 text-sm uppercase tracking-wider mb-3">
                  User Information
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-base-content/70">
                      Email
                    </span>
                    <span className="text-sm font-semibold text-base-content truncate max-w-48">
                      {selectedUser?.email || "Not provided"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-base-content/70">
                      User ID
                    </span>
                    <span className="text-sm font-mono text-base-content/60 truncate max-w-32">
                      {selectedUser?._id || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-base-content/70">
                      Role
                    </span>
                    <div
                      className={`badge badge-sm font-semibold ${
                        selectedUser?.role === "admin"
                          ? "badge-error"
                          : selectedUser?.role === "moderator"
                          ? "badge-warning"
                          : selectedUser?.role === "vip"
                          ? "badge-info"
                          : "badge-ghost"
                      }`}
                    >
                      {selectedUser?.role || "user"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Panel */}
            {hasAdminPrivileges && (
              <div className="px-6 pb-6 space-y-6">
                <div className="text-center">
                  <div className="divider divider-primary">
                    <span className="text-sm font-bold text-primary uppercase tracking-wider">
                      Admin Panel
                    </span>
                  </div>
                </div>

                {/* Role Management */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">
                    Role Management
                  </h5>

                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="btn btn-primary btn-sm text-xs h-10"
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
                        className="btn btn-primary btn-outline btn-sm text-xs h-10"
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
                        className="btn btn-info btn-sm text-xs h-10"
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
                        className="btn btn-ghost btn-sm text-xs h-10"
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

                {/* Moderation Actions */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">
                    Moderation Actions
                  </h5>

                  <div className="bg-error/5 border border-error/20 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="btn btn-error btn-sm text-xs h-10"
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
                        className="btn btn-warning btn-sm text-xs h-10"
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
                        className="btn btn-error btn-outline btn-sm text-xs h-10"
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
                        className="btn btn-error btn-outline btn-sm text-xs h-10"
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

                {/* Recovery Actions */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">
                    Recovery Actions
                  </h5>

                  <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="btn btn-success btn-sm text-xs h-10"
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
                        className="btn btn-success btn-outline btn-sm text-xs h-10"
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
  );
};

export default DrawerUser;
