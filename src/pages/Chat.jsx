// ✅ Full call logic implemented in this component with incoming call modal, timer, and cleanup
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { BsThreeDotsVertical } from "react-icons/bs"
import { PiTelegramLogo } from "react-icons/pi"
import socket from "../Socket.jsx"
import DrawerUser from "../components/DrawerUser"
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import { FaPhone } from "react-icons/fa";
import CallModal from "../components/CallModal";


const Chat = () => {
  const { user } = useParams();
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [chat, setChat] = useState([]);
  const [status, setStatus] = useState("Вызов...");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const audioRef = useRef(null);
  const userinfo = useSelector(state => state?.auth?.user?.user);

  useEffect(() => {
    const receiveMessage = (data) => setChat(prev => [...prev, data]);
    socket.on("receive_message", receiveMessage);
    return () => socket.off("receive_message", receiveMessage);
  }, []);

  useEffect(() => {
    setLoading(true);
    const getUser = async () => {
      try {
        const res = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/auth/getUser/${user}`);
        const data = await res.json();
        setSelectedUser(data);
      } catch (err) {
        console.log("getUser error:", err);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, [user]);

  useEffect(() => {
    const getChat = async () => {
      try {
        const res = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/message/${userinfo._id}/${user}`);
        const data = await res.json();
        setChat(data);
      } catch (err) {
        console.log("getChat error:", err);
      }
    }
    getChat();
  }, [user]);

  const sendMessage = (e) => {
    e.preventDefault();
    const msg = {
      text: inputValue,
      from: userinfo._id,
      to: selectedUser._id,
    };
    socket.emit("send_message", msg);
    setChat(prev => [...prev, msg]);
    setInputValue("");
  };

  const typingHandler = (e) => {
    setInputValue(e.target.value);
    socket.emit("typing", { from: userinfo, to: selectedUser });
  };

  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopCall = () => {
    if (peerConnection) peerConnection.close();
    setPeerConnection(null);
    setIsCalling(false);
    setIncomingCall(null);
    setCallDuration(0);
    clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = new MediaStream();
    if (audioRef.current) audioRef.current.srcObject = null;
  };

  const handleCall = async () => {
    document.getElementById('my_modal_5').showModal();
    setIsCalling(true);
    setStatus("Вызов...");

    const localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    localStreamRef.current = localStream;
    if (audioRef.current) audioRef.current.srcObject = remoteStreamRef.current;

    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", {
          to: selectedUser.socketId,
          candidate: e.candidate,
          from: socket.id
        });
      }
    };

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach(track => remoteStreamRef.current.addTrack(track));
      if (audioRef.current) audioRef.current.srcObject = remoteStreamRef.current;
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // ✅ KERAKLI QO‘NG‘Iroq event
    socket.emit("call_user", {
      to: selectedUser.socketId,
      from: socket.id,
      user: userinfo, // foydalanuvchi haqida info borishi kerak
    });

    socket.emit("make_offer", {
      to: selectedUser.socketId,
      offer,
      from: socket.id
    });

    setPeerConnection(pc);
  };


  useEffect(() => {
    socket.on("answer_received", async ({ answer }) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
        startCallTimer();
      }
    });

    socket.on("ice_candidate_received", async ({ candidate }) => {
      if (peerConnection) await peerConnection.addIceCandidate(candidate);
    });

    socket.on("call_rejected", () => {
      setStatus("Call rejected");
      stopCall();
    });

    socket.on("call_accepted", () => {
      setStatus("Call connected");
      startCallTimer();
    });

    socket.on("incoming_call", ({ from, socketId }) => {
      setIncomingCall({ from, socketId });
      document.getElementById('incoming_modal').showModal();
    });

    const handleCall = async () => {
      document.getElementById('my_modal_5').showModal();
      setIsCalling(true);
      setStatus("Вызов...");

      const localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      localStreamRef.current = localStream;
      if (audioRef.current) audioRef.current.srcObject = remoteStreamRef.current;

      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice_candidate", {
            to: selectedUser.socketId,
            candidate: e.candidate,
            from: socket.id
          });
        }
      };

      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach(track => remoteStreamRef.current.addTrack(track));
        if (audioRef.current) audioRef.current.srcObject = remoteStreamRef.current;
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // ✅ KERAKLI QO‘NG‘Iroq event
      socket.emit("call_user", {
        to: selectedUser.socketId,
        from: socket.id,
        user: userinfo, // foydalanuvchi haqida info borishi kerak
      });

      socket.emit("make_offer", {
        to: selectedUser.socketId,
        offer,
        from: socket.id
      });

      setPeerConnection(pc);
    };


    socket.on("call_ended", stopCall);

    return () => {
      socket.off("answer_received");
      socket.off("ice_candidate_received");
      socket.off("call_rejected");
      socket.off("call_accepted");
      socket.off("incoming_call");
      socket.off("call_ended");
    };
  }, [peerConnection]);

  const acceptIncoming = async () => {
    setIsCalling(true);
    setStatus("Qo‘ng‘iroq qabul qilindi");
    document.getElementById('my_modal_5').showModal();
    document.getElementById('incoming_modal').close();

    const localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    localStreamRef.current = localStream;
    if (audioRef.current) audioRef.current.srcObject = remoteStreamRef.current;

    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", {
          to: incomingCall.socketId,
          candidate: e.candidate,
          from: socket.id
        });
      }
    };

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach(track => remoteStreamRef.current.addTrack(track));
      if (audioRef.current) audioRef.current.srcObject = remoteStreamRef.current;
    };

    setPeerConnection(pc);
    socket.emit("accept_call", { to: incomingCall.socketId, from: socket.id });
  };

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className='flex flex-col h-screen'>
      <DrawerUser selectedUser={selectedUser} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <div className='w-full p-5 bg-base-300 flex items-center justify-between'>
        <div>
          <p className='font-bold text-lg'>{selectedUser?.username}</p>
          <p className='text-sm'>{selectedUser?.grade}</p>
        </div>
        <div>
          <button className="btn btn-soft btn-success" onClick={handleCall}><IoCall /></button>
          <button onClick={() => setIsDrawerOpen(true)} className='btn btn-ghost'>
            <BsThreeDotsVertical />
          </button>

          <button className="btn btn-primary" onClick={() => document.getElementById('call_modal').showModal()}>
            <FaPhone />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className='flex-1 h-[55%] px-4 overflow-y-auto'>
        {chat?.map((item, id) => (
          <div key={id} className={`chat flex flex-col w-full ${item.from === userinfo._id ? "chat-end" : "chat-start"}`}>
            <div className={`flex items-end gap-4 max-w-[65%] ${item.from === userinfo._id ? "flex-row-reverse" : "flex-row"}`}>
              <figure>
                <img src={selectedUser?.profileImage || "https://via.placeholder.com/64"} className='size-10 bg-base-300 rounded-full' alt="" />
              </figure>
              <div className={`chat-bubble flex-1 ${item.from === userinfo._id ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                <p className='break-words w-full'>{item?.text}</p>
                <p className='text-white/70 text-end text-xs'>{item?.timeStamp?.slice(11, 16)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className='w-full py-5 px-5 bg-base-300 flex gap-2'>
        <input
          type="text"
          value={inputValue}
          onChange={typingHandler}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
          className='input input-bordered w-full'
        />
        <button className='btn btn-soft btn-primary' onClick={sendMessage}>
          <PiTelegramLogo />
        </button>
      </div>

      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className='flex flex-col items-center justify-center'>
            <div className='flex flex-col items-center gap-5'>
              <figure>
                <img src={selectedUser?.profileImage || "https://via.placeholder.com/64"} className='size-24 bg-base-300 rounded-full' alt="" />
              </figure>
              <div className='flex flex-col items-center gap-1'>
                <p className='text-xl font-semibold'>{selectedUser?.username}</p>
                <p className='text-sm'>{status} | {formatTime(callDuration)}</p>
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-soft btn-error text-2xl" onClick={stopCall}><MdCallEnd /></button>
              </form>
            </div>
            <audio ref={audioRef} autoPlay></audio>
          </div>
        </div>
      </dialog>

      <dialog id="incoming_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Kirish qo‘ng‘iroq</h3>
          <p className="py-4">Kimdandir sizga audio qo‘ng‘iroq kelmoqda</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-success" onClick={acceptIncoming}>Qabul qilish</button>
              <button className="btn btn-error" onClick={() => {
                socket.emit("reject_call", { to: incomingCall.socketId });
                document.getElementById('incoming_modal').close();
              }}>Rad etish</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Chat;