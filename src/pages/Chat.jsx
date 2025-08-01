import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { PiTelegramLogo } from "react-icons/pi";
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import { HiMiniPaperAirplane } from "react-icons/hi2";
import DrawerUser from '../components/DrawerUser.jsx';
import socket from '../Socket.jsx';

const Chat = () => {
  const { user } = useParams();
  const userinfo = useSelector(state => state.auth?.user?.user);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chat, setChat] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [status, setStatus] = useState("Qo'ng'iroq...");
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/auth/getUser/${user}`);
      const data = await res.json();
      setSelectedUser(data);
    })();

    (async () => {
      const res = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/message/${userinfo._id}/${user}`);
      const data = await res.json();
      setChat(data);
    })();
  }, [user]);

  useEffect(() => {
    socket.on("receive_message", data => setChat(prev => [...prev, data]));

    socket.on("call_accepted", () => {
      setStatus("Ulandi");
      startTimer();
    });

    socket.on("call_rejected", () => {
      setStatus("Qo'ng'iroq rad etildi");
      stopCall();
    });

    socket.on("answer_received", async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
        startTimer();
      }
    });

    socket.on("ice_candidate_received", async ({ candidate }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    });

    socket.on("call_ended", stopCall);

    return () => {
      socket.off("receive_message");
      socket.off("call_accepted");
      socket.off("call_rejected");
      socket.off("answer_received");
      socket.off("ice_candidate_received");
      socket.off("call_ended");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const msg = { text: inputValue, from: userinfo._id, to: selectedUser._id };
    socket.emit("send_message", msg);
    setChat(prev => [...prev, msg]);
    setInputValue("");
  };

  const typingHandler = (e) => {
    setInputValue(e.target.value);
    socket.emit("typing", { from: userinfo, to: selectedUser });
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
  };

  const stopCall = () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    peerConnectionRef.current = null;
    setIsCalling(false);
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
    document.getElementById("phone_call_modal")?.showModal();
    setIsCalling(true);
    setStatus("Qo'ng'iroq...");

    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = localStream;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", {
          to: selectedUser.socketId,
          candidate: e.candidate,
          from: socket.id,
        });
      }
    };

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach(track => remoteStreamRef.current.addTrack(track));
      if (audioRef.current) audioRef.current.srcObject = remoteStreamRef.current;
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call", { to: selectedUser, from: userinfo });
    socket.emit("make_offer", {
      to: selectedUser.socketId,
      offer,
      from: socket.id,
    });

    peerConnectionRef.current = pc;
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <div className='flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden'>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <DrawerUser selectedUser={selectedUser} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Header */}
      <div className='w-full p-6 backdrop-blur-md bg-white/10 border-b border-white/20 flex items-center justify-between relative z-10'>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img src={selectedUser?.profileImage} alt="" className='w-12 h-12 rounded-full object-cover ring-2 ring-blue-400/50 shadow-lg' />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
          </div>
          <div>
            <p className='font-bold text-xl text-white drop-shadow-lg'>{selectedUser?.username}</p>
            <p className='text-sm text-blue-300 font-medium'>{selectedUser?.grade}</p>
          </div>
        </div>
        <div className='flex gap-3'>
          <button className="group p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:scale-105 transition-all" onClick={handleCall}>
            <IoCall className="text-white text-lg group-hover:animate-pulse" />
          </button>
          <button onClick={() => setIsDrawerOpen(true)} className='group p-3 bg-white/10 rounded-xl hover:scale-105 transition-all border border-white/20'>
            <BsThreeDotsVertical className="text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className='flex-1 px-6 py-4 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'>
        <div className="space-y-4">
          {chat?.map((item, id) => (
            <div key={id} className={`flex ${item.from === userinfo._id ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 items-end max-w-[70%] ${item.from === userinfo._id ? "flex-row-reverse" : "flex-row"}`}>
                <img src={item.from === userinfo._id ? userinfo.profileImage : selectedUser?.profileImage} alt="" className='w-8 h-8 rounded-full object-cover ring-1 ring-white/30' />
                <div className="flex flex-col">
                  <div className={`relative px-4 py-3 rounded-2xl shadow-lg border border-white/10 ${
                    item.from === userinfo._id 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md" 
                      : "bg-white/10 text-white rounded-bl-md"
                  }`}>
                    <p className="break-words whitespace-pre-line max-w-lg">{item.text}</p>
                  </div>
                  <p className={`text-xs mt-1 px-2 ${item.from === userinfo._id ? "text-right" : "text-left"} text-gray-400`}>
                    {item?.timeStamp?.slice(11, 16)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className='w-full p-6 backdrop-blur-md bg-white/5 border-t border-white/10 relative z-10'>
        <div className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={typingHandler}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
              placeholder="Type your message..."
              className='w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none'
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">💬</div>
          </div>
          <button 
            className='group p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:scale-105 transition-all' 
            onClick={sendMessage}
            disabled={!inputValue.trim()}
          >
            <HiMiniPaperAirplane className={`text-white text-xl ${inputValue.trim() ? 'group-hover:translate-x-1 group-hover:-translate-y-1' : 'opacity-50'}`} />
          </button>
        </div>
      </div>

      {/* Outgoing Call Modal */}
      <dialog id="phone_call_modal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
        <div className="modal-box bg-gradient-to-br from-gray-900 to-black border border-white/20 shadow-2xl">
          <div className='flex flex-col items-center gap-6 p-6'>
            <div className="relative">
              <img src={selectedUser?.profileImage} className='w-32 h-32 rounded-full object-cover shadow-2xl ring-4 ring-white/20' alt="" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="text-center space-y-2">
              <p className='text-2xl font-bold text-white'>{selectedUser?.username}</p>
              <div className="flex items-center justify-center gap-2 text-blue-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <p className='text-lg font-medium'>{status}</p>
              </div>
              <p className='text-3xl font-mono text-white tracking-wider'>{formatTime(callDuration)}</p>
            </div>
            <div className="modal-action mt-6">
              <form method="dialog">
                <button 
                  className="group p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-full hover:scale-110 transition-all" 
                  onClick={stopCall}
                >
                  <MdCallEnd className="text-white text-3xl group-hover:animate-pulse" />
                </button>
              </form>
            </div>
            <audio ref={audioRef} autoPlay></audio>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Chat;
