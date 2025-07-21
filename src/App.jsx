// src/App.jsx
import { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import socket from "./Socket.jsx";
import Sidebar from "./components/Sidebar.jsx";
import DrawerUser from "./components/DrawerUser.jsx";
import { toast } from "react-toastify";
import { logout } from "./redux/slices/authSlice.js";
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import { SlCallOut } from "react-icons/sl";

function App() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [callStatus, setCallStatus] = useState("Idle");
  const user = useSelector((state) => state.auth?.user?.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    socket.emit("connected", user);
  }, [user, navigate]);

  const getAllUsers = async () => {
    try {
      const request = await fetch(
        "https://one012-counter-ws-server.onrender.com/api/v1/auth/getAllUsers"
      );
      const response = await request.json();
      setUsers(response);
    } catch (e) {
      console.error("Get all users error:", e);
      toast.error("Foydalanuvchilarni olishda xato");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const checkMicrophone = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMic = devices.some((device) => device.kind === "audioinput");
      if (!hasMic) {
        throw new Error("Mikrofon topilmadi");
      }
      return true;
    } catch (err) {
      console.error("Microphone check error:", err);
      toast.error("Mikrofon topilmadi yoki ruxsat berilmagan");
      return false;
    }
  };

  const startMedia = async () => {
    try {
      const hasMic = await checkMicrophone();
      if (!hasMic) {
        throw new Error("Mikrofon topilmadi");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;
      localAudioRef.current.srcObject = stream;
    } catch (err) {
      console.error("Microphone permission required!", err);
      if (err.name === "NotFoundError") {
        toast.error("Mikrofon topilmadi. Iltimos, mikrofon ulanganligini tekshiring.");
      } else if (err.name === "NotAllowedError") {
        toast.error("Mikrofon ruxsati berilmagan. Brauzer sozlamalarida ruxsatni yoqing.");
      } else {
        toast.error("Mikrofon bilan bog‘liq xato: " + err.message);
      }
      throw err;
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", {
          to: selectedUser?._id,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
    };

    return pc;
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    document.getElementById("call_modal").close();
    setCallStatus("Idle");
    if (selectedUser) {
      socket.emit("end_call", { from: user._id, to: selectedUser._id });
    }
  };

  const acceptCall = async () => {
    try {
      const hasMic = await checkMicrophone();
      if (!hasMic) {
        throw new Error("Mikrofon topilmadi");
      }
      await startMedia();
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(selectedUser.offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer_call", { from: user._id, to: selectedUser._id });
      socket.emit("webrtc_answer", { to: selectedUser._id, sdp: answer });
      setCallStatus("Qo‘ng‘iroq qabul qilindi");
    } catch (err) {
      console.error("Accept call error:", err);
      if (err.name === "NotFoundError") {
        toast.error("Mikrofon topilmadi. Iltimos, mikrofon ulanganligini tekshiring.");
      } else if (err.name === "NotAllowedError") {
        toast.error("Mikrofon ruxsati berilmagan. Brauzer sozlamalarida ruxsatni yoqing.");
      } else {
        toast.error("Qo‘ng‘iroqni qabul qilishda xato: " + err.message);
      }
      endCall();
    }
  };

  const rejectCall = () => {
    socket.emit("reject_call", { from: user._id, to: selectedUser._id });
    endCall();
    toast.info("Qo‘ng‘iroq rad etildi");
  };

  useEffect(() => {
    socket.on("users", (data) => {
      setOnlineUsers(data);
    });

    socket.on("Ban_Result_reciever", (data) => {
      toast.error(data.message);
      dispatch(logout());
      navigate("/login");
    });

    socket.on("admin_notification", (data) => {
      toast.error(data.message);
    });

    socket.on("incoming_call", ({ from, offer, caller }) => {
      setSelectedUser({ ...caller, offer });
      setCallStatus("Sizga qo‘ng‘iroq kelyapti...");
      document.getElementById("call_modal").showModal();
    });

    socket.on("call_accepted", () => {
      setCallStatus("Qo‘ng‘iroq qabul qilindi");
    });

    socket.on("webrtc_answer", async ({ sdp }) => {
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
      } catch (err) {
        console.error("WebRTC answer error:", err);
        toast.error("WebRTC answer qayta ishlashda xato");
      }
    });

    socket.on("webrtc_ice_candidate", async ({ candidate }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (err) {
        console.error("ICE candidate error:", err);
        toast.error("ICE kandidatni qo‘shishda xato");
      }
    });

    socket.on("call_ended", () => {
      endCall();
      toast.info("Qo‘ng‘iroq yakunlandi");
    });

    socket.on("call_rejected", ({ message }) => {
      endCall();
      toast.error(message);
    });

    socket.on("call_error", ({ message }) => {
      endCall();
      toast.error(message);
    });

    return () => {
      socket.off("users");
      socket.off("Ban_Result_reciever");
      socket.off("admin_notification");
      socket.off("incoming_call");
      socket.off("call_accepted");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice_candidate");
      socket.off("call_ended");
      socket.off("call_rejected");
      socket.off("call_error");
    };
  }, [dispatch, navigate, user, selectedUser]);

  const selectUser = (user) => {
    setSelectedUser(user);
    navigate(`/chat/${user._id}`);
  };

  return (
    <div className="flex">
      <Sidebar
        onlineUsers={onlineUsers}
        loading={loading}
        selectUser={selectUser}
        setOnlineUsers={setOnlineUsers}
      />
      <div className="w-full h-screen overflow-y-auto">
        <Outlet
          context={{
            setIsDrawerOpen,
            setSelectedUser,
            selectedUser,
            isDrawerOpen,
            endCall,
          }}
        />
      </div>
      <DrawerUser
        selectedUser={selectedUser}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <dialog id="call_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-5">
              <figure>
                <img
                  src={
                    selectedUser?.profileImage || "https://via.placeholder.com/64"
                  }
                  className="size-24 bg-base-300 rounded-full"
                  alt=""
                />
              </figure>
              <div className="flex flex-col items-center gap-1">
                <p className="text-xl font-semibold">{selectedUser?.username}</p>
                <p className="text-sm">{callStatus}</p>
              </div>
              <audio ref={localAudioRef} autoPlay muted />
              <audio ref={remoteAudioRef} autoPlay />
            </div>
            <div className="modal-action">
              <form method="dialog">
                {callStatus === "Sizga qo‘ng‘iroq kelyapti..." && (
                  <>
                    <button
                      className="btn btn-soft btn-success mr-2"
                      onClick={acceptCall}
                    >
                      <SlCallOut /> Qabul qilish
                    </button>
                    <button
                      className="btn btn-soft btn-error"
                      onClick={rejectCall}
                    >
                      Rad etish
                    </button>
                  </>
                )}
                {callStatus !== "Sizga qo‘ng‘iroq kelyapti..." && (
                  <button
                    className="btn btn-soft btn-error text-2xl"
                    onClick={endCall}
                  >
                    <MdCallEnd />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default App;