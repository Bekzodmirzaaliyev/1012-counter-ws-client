import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { BsThreeDotsVertical } from "react-icons/bs";
import { PiTelegramLogo } from "react-icons/pi";
<<<<<<< HEAD
import socket from "../Socket";
import DrawerUser from "../components/DrawerUser";
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import Phonecall from '../components/Phonecall.jsx';
import PhonecallOutgoing from '../components/PhonecallOutgoing.jsx';
=======
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import DrawerUser from '../components/DrawerUser.jsx';
import socket from '../Socket.jsx';
>>>>>>> f721a28b11fc12ff03ab2b8602c68bffa9475371

const Chat = () => {
  const { user } = useParams();
  const userinfo = useSelector(state => state.auth?.user?.user);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chat, setChat] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [status, setStatus] = useState("Qo‘ng‘iroq...");
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const audioRef = useRef(null);

  // Fetch user & chat
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

  // WebSocket events
  useEffect(() => {
    socket.on("receive_message", data => setChat(prev => [...prev, data]));

    socket.on("incoming_call", ({ from, socketId }) => {
      setIncomingCall({ from, socketId });
      document.getElementById("incoming_modal")?.showModal();
    });

    socket.on("call_accepted", () => {
      setStatus("Ulandi");
      startTimer();
    });

    socket.on("call_rejected", () => {
      setStatus("Qo‘ng‘iroq rad etildi");
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
      socket.off("incoming_call");
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
    document.getElementById("my_modal_5")?.showModal();
    setIsCalling(true);
    setStatus("Qo‘ng‘iroq...");

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

  const acceptIncoming = async () => {
    document.getElementById("incoming_modal")?.close();
    document.getElementById("my_modal_5")?.showModal();
    setIsCalling(true);
    setStatus("Qabul qilindi");

    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = localStream;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", {
          to: incomingCall.socketId,
          candidate: e.candidate,
          from: socket.id,
        });
      }
    };

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach(track => remoteStreamRef.current.addTrack(track));
      if (audioRef.current) audioRef.current.srcObject = remoteStreamRef.current;
    };

    peerConnectionRef.current = pc;

    socket.emit("accept_call", {
      to: incomingCall.socketId,
      from: socket.id,
    });
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <div className='flex flex-col h-screen'>
      <DrawerUser selectedUser={selectedUser} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <div className='w-full p-5 bg-base-300 flex items-center justify-between'>
        <div>
          <p className='font-bold text-lg'>{selectedUser?.username}</p>
          <p className='text-sm'>{selectedUser?.grade}</p>
        </div>
        <div className='flex gap-2'>
          <button className="btn btn-success" onClick={handleCall}><IoCall /></button>
          <button onClick={() => setIsDrawerOpen(true)} className='btn btn-ghost'><BsThreeDotsVertical /></button>
        </div>
      </div>

      <div className='flex-1 px-4 overflow-y-auto'>
        {chat?.map((item, id) => (
          <div key={id} className={`chat ${item.from === userinfo._id ? "chat-end" : "chat-start"}`}>
            <div className={`flex gap-4 items-end max-w-[65%] ${item.from === userinfo._id ? "flex-row-reverse" : "flex-row"}`}>
              <img src={selectedUser?.profileImage} alt="" className='size-10 rounded-full' />
              <div className={`chat-bubble ${item.from === userinfo._id ? "chat-bubble-primary" : "chat-bubble-secondary"} min-w-auto break-words whitespace-pre-line`}>
                <p>{item.text}</p>
                <p className='text-xs text-right'>{item?.timeStamp?.slice(11, 16)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='w-full py-5 px-5 bg-base-300 flex gap-2'>
        <input
          type="text"
          value={inputValue}
          onChange={typingHandler}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
          className='input input-bordered w-full'
        />
        <button className='btn btn-primary' onClick={sendMessage}><PiTelegramLogo /></button>
      </div>

      {/* Outgoing Call Modal */}
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
<<<<<<< HEAD
        <div className="modal-box text-center">
          <img src={selectedUser?.profileImage} alt="" className='size-20 rounded-full mx-auto' />
          <p className='text-xl font-semibold mt-3'>{selectedUser?.username}</p>
          <p className='text-sm'>{status} | {formatTime(callDuration)}</p>
          <div className="modal-action justify-center">
            <form method="dialog">
              <button className="btn btn-error" onClick={stopCall}><MdCallEnd className='text-2xl' /></button>
            </form>
=======
        <div className="modal-box">
          <div className='flex flex-col items-center gap-4'>
            <img src={selectedUser?.profileImage} className='size-24 rounded-full' alt="" />
            <p className='text-xl font-semibold'>{selectedUser?.username}</p>
            <p className='text-sm'>{status} | {formatTime(callDuration)}</p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-error text-2xl" onClick={stopCall}><MdCallEnd /></button>
              </form>
            </div>
            <audio ref={audioRef} autoPlay></audio>
>>>>>>> f721a28b11fc12ff03ab2b8602c68bffa9475371
          </div>
        </div>
      </dialog>

      {/* Incoming Call Modal */}
      <dialog id="incoming_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">📞 Kirish qo‘ng‘iroq</h3>
          <p className="py-2">Sizga {incomingCall?.from?.username} dan qo‘ng‘iroq kelyapti</p>
          <div className="modal-action flex gap-4">
            <form method="dialog">
              <button className="btn btn-success" onClick={acceptIncoming}>Qabul qilish</button>
            </form>
            <form method="dialog">
              <button className="btn btn-error" onClick={() => {
                socket.emit("reject_call", { to: incomingCall?.socketId });
                document.getElementById("incoming_modal")?.close();
              }}>Rad etish</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Chat;
