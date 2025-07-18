import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { BsThreeDotsVertical } from "react-icons/bs";
import { PiTelegramLogo } from "react-icons/pi";
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import socket from "../Socket.jsx";
import DrawerUser from "../components/DrawerUser";
import Phonecall from '../components/Phonecall.jsx';
import PhonecallOutgoing from '../components/PhonecallOutgoing.jsx';

const Chat = () => {
  const { user } = useParams();
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const userinfo = useSelector(state => state?.auth?.user?.user);
  const [chat, setChat] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Call related states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isPhoneOpen, serIsphineOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callStatus, setCallStatus] = useState("");
  const audioRef = useRef(null);

  // Get user data
  useEffect(() => {
    const getUser = async () => {
      try {
        const request = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/auth/getUser/${user}`);
        const response = await request.json();
        setSelectedUser(response);
      } catch (e) {
        console.log("SERVER ERROR: ", e);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    getUser();
  }, [user]);

  // Get chat messages
  useEffect(() => {
    const getChat = async () => {
      try {
        const request = await fetch(`https://one012-counter-ws-server.onrender.com/api/v1/message/${userinfo._id}/${user}`);
        const response = await request.json();
        setChat(response);
      } catch (e) {
        console.log("SERVER ERROR: ", e);
      }
    };
    getChat();
  }, [user]);

  // Setup WebRTC connection
  const setupWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      
      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const pc = new RTCPeerConnection(configuration);
      setPeerConnection(pc);
      
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            to: isIncomingCall ? caller._id : selectedUser._id,
            candidate: event.candidate
          });
        }
      };
      
      return pc;
    } catch (error) {
      console.error("Error setting up WebRTC:", error);
    }
  };

  // Socket event listeners
  useEffect(() => {
    const handleIncomingCall = (data) => {
      setCaller(data.from);
      setIsIncomingCall(true);
      setCallStatus("Incoming call...");
      document.getElementById('call_modal').showModal();
    };

    const handleCallAccepted = async () => {
      setCallStatus("Call connected");
      const pc = await setupWebRTC();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", {
        to: selectedUser._id,
        offer: offer
      });
    };

    const handleCallRejected = () => {
      setIsCalling(false);
      setCallStatus("Call rejected");
      setTimeout(() => document.getElementById('call_modal').close(), 2000);
    };

    const handleCallEnded = () => {
      setIsCalling(false);
      setIsIncomingCall(false);
      setCallStatus("Call ended");
      cleanupMedia();
      setTimeout(() => document.getElementById('call_modal').close(), 2000);
    };

    const handleIceCandidate = (candidate) => {
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const handleOffer = async (offer) => {
      const pc = await setupWebRTC();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", {
        to: offer.from._id,
        answer: answer
      });
    };

    const handleAnswer = async (answer) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleReceiveMessage = (data) => {
      setChat(prev => [...prev, data]);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      cleanupMedia();
    };
  }, [peerConnection, isIncomingCall, caller, selectedUser]);

  // Clean up media streams
  const cleanupMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setRemoteStream(null);
  };

  // Message handlers
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage(e);
  };

  const typingHandler = (e) => {
    setInputValue(e.target.value);
    socket.emit("typing", { from: userinfo, to: selectedUser });
  };

  // Call handlers
  const handleStartCall = async () => {
    setIsCalling(true);
    setCallStatus("Calling...");
    await setupWebRTC();
    socket.emit("start_call", {
      from: userinfo,
      to: selectedUser
    });
    document.getElementById('call_modal').showModal();
  };

  const handleAcceptCall = () => {
    socket.emit("accept_call", {
      from: caller,
      to: userinfo
    });
    setIsIncomingCall(false);
    setCallStatus("Call in progress");
  };

  const handleRejectCall = () => {
    socket.emit("reject_call", {
      from: caller,
      to: userinfo
    });
    setIsIncomingCall(false);
    setCallStatus("Call rejected");
    setTimeout(() => document.getElementById('call_modal').close(), 2000);
  };

  const handleEndCall = () => {
    socket.emit("end_call", {
      from: userinfo,
      to: selectedUser._id
    });
    setIsCalling(false);
    setIsIncomingCall(false);
    cleanupMedia();
    document.getElementById('call_modal').close();
  };

  // Update audio element when remote stream changes
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    {showCallModal && (
      <dialog id="call_modal" className="modal modal-bottom sm:modal-middle" open>
        <div className="modal-box">
          <div className='flex flex-col items-center justify-center'>
            <div className='flex flex-col items-center gap-5'>
              <figure>
                <img 
                  src={incomingCall?.from.profileImage || "https://via.placeholder.com/64"} 
                  className='size-24 bg-base-300 rounded-full' 
                  alt="Caller" 
                />
              </figure>
              <div className='flex flex-col items-center gap-1'>
                <p className='text-xl font-semibold'>
                  {incomingCall?.from.username}
                </p>
                <p className='text-sm'>{callStatus}</p>
              </div>
            </div>
            
            <div className="modal-action">
              {incomingCall && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      handleRejectCall();
                      setShowCallModal(false);
                    }}
                    className="btn btn-error text-2xl"
                  >
                    <MdCallEnd />
                  </button>
                  <button 
                    onClick={() => {
                      handleAcceptCall();
                      setCallStatus("Call in progress");
                    }}
                    className="btn btn-success text-2xl"
                  >
                    <IoCall />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </dialog>
    )};
  )}

export default Chat;