import React, { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { activeChatId } from '../recoil/chats';
import { callTriggerState, callType, currentCallUser, showCallDialog } from '../recoil/call';

const CallDialog = ({ socket, chats }) => {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth/2, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const dialogRef = useRef(null); 

  const receiverUserId = useRecoilValue(activeChatId); 

  const callRequested = useRecoilValue(callTriggerState);
  const resetCallTrigger = useResetRecoilState(callTriggerState);
  const [showCallDialogValue, setShowCallDialog] = useRecoilState(showCallDialog);
  const [currentCallUserValue, setCurrentCallUser] = useRecoilState(currentCallUser);
  const [callTypeValue,setCallType]=useRecoilState(callType);

  useEffect(() => {
    if (callRequested) {
      initiateCall();
      resetCallTrigger(); 
    }
  }, [callRequested]);

  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('call', (call) => {
      // console.log('📥 Incoming PeerJS call...');
      setIncomingCall(call);
    });

    peerInstance.current = peer;

    socket.on('incoming:call', ({ uniqueKey, from , callType}) => {
      const callerName = chats.find((chat) => chat.id.split("_")[0] === from);
      setCallType(callType);
      if (callerName) {
        setCurrentCallUser(callerName.name);
      }
      // console.log('📲 Call request from user:', from);
      setShowCallDialog(true);
      setRemotePeerId(uniqueKey); 
    });

    return () => {
      socket.off('incoming:call');
    };
  }, [socket, chats, setCurrentCallUser, setShowCallDialog]);

  const initiateCall = () => {
    if (!peerId || !receiverUserId) return;
    socket.emit('init:call', {
      uniqueKey: peerId,
      to: receiverUserId.split("_")[0],
      callType:callTypeValue
    });
    // console.log('📤 Sent init:call to', receiverUserId);
  };

  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: callTypeValue==="video", audio: true });

      if (currentUserVideoRef.current) {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
      }

      incomingCall.answer(mediaStream);
      setCurrentCall(incomingCall);
      setCallActive(true);

      incomingCall.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
      });

      incomingCall.on('close', () => endCall());
      incomingCall.on('error', (err) => console.error("Incoming call error:", err));

      setIncomingCall(null);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Please allow camera and microphone access to make a call.");
    }
  };

  const makePeerCall = async () => {
    if (!remotePeerId || callActive) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: callTypeValue==="video", audio: true });

      if (currentUserVideoRef.current) {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
      }

      const call = peerInstance.current.call(remotePeerId, mediaStream);

      setCurrentCall(call);
      setCallActive(true);

      call.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
      });

      call.on('close', () => endCall());
      call.on('error', (err) => console.error("Outgoing call error:", err));

    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Please allow camera and microphone access to make a call.");
    }
  };

  const endCall = () => {
    if (currentCall) {
      currentCall.close();
    }

    if (currentUserVideoRef.current?.srcObject) {
      currentUserVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      currentUserVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    setCurrentCall(null);
    setIncomingCall(null);
    setRemotePeerId('');
    setCallActive(false);
    setShowCallDialog(false);
    setCurrentCallUser("");
  };

  const onMouseDown = useCallback((e) => {
    if (dialogRef.current && dialogRef.current.contains(e.target) && !e.target.closest('button, video')) {
      setIsDragging(true);
      const rect = dialogRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging) return;
    let newX = e.clientX - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dialogWidth = dialogRef.current ? dialogRef.current.offsetWidth : 0;
    const dialogHeight = dialogRef.current ? dialogRef.current.offsetHeight : 0;

    newX = Math.max(0, Math.min(newX, viewportWidth - dialogWidth));
    newY = Math.max(0, Math.min(newY, viewportHeight - dialogHeight));

    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);


  if (!showCallDialogValue) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-50"> 
      <div
        ref={dialogRef}
        className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 
                  transform transition-transform duration-100 ease-out 
                  ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                  pointer-events-auto`} 
        style={{ position: 'absolute', left: position.x, top: position.y }} 
        onMouseDown={onMouseDown} 
      >
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-6">
          {callActive ? (
            `Call with ${currentCallUserValue}`
          ) : incomingCall || remotePeerId ? (
            `Incoming Call from ${currentCallUserValue}`
          ) : (
            `Calling ${currentCallUserValue}...`
          )}
        </h2>

        <div className='w-full text-2xl dark:text-white text-black text-center'>{callTypeValue==="video"?"Video Call":"Audio Call"}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <p className="w-full text-center text-sm md:text-base text-gray-700 dark:text-gray-300 py-2 bg-gray-200 dark:bg-gray-700 font-medium">
              You
            </p>
            <video
              ref={currentUserVideoRef}
              className={`w-full ${callTypeValue==="video"? "h-48":"h-1"} md:h-64 object-cover bg-gray-900`}
              autoPlay
              muted
              playsInline
            />
          </div>

          <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <p className="w-full text-center text-sm md:text-base text-gray-700 dark:text-gray-300 py-2 bg-gray-200 dark:bg-gray-700 font-medium">
              {currentCallUserValue || 'Remote User'}
            </p>
            <video
              ref={remoteVideoRef}
              className={`w-full ${callTypeValue==="video"? "h-48":"h-1"} md:h-64 object-cover bg-gray-900`}
              autoPlay
              playsInline
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!callActive && (incomingCall || remotePeerId) && (
            <button
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
              onClick={incomingCall ? answerCall : makePeerCall}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7a1 1 0 00-1-1h-2a1 1 0 00-1 1v5.618A19.04 19.04 0 0110 20.724a19.05 19.05 0 01-6-13.725V7a1 1 0 00-1-1H3a1 1 0 00-1 1v.003c0 .093.018.185.05.275.04.108.093.21.16.305l7.25 12.564a2.002 2.002 0 003.5 0l7.25-12.564a.999.999 0 00.16-.305.996.996 0 00.05-.275V7a1 1 0 00-1-1h-2z"></path></svg>
              {incomingCall ? 'Connect' : 'Answer Call'}
            </button>
          )}

          {!callActive && !incomingCall && !remotePeerId && (
            <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
              Waiting for {currentCallUserValue} to connect...
            </p>
          )}

          <button
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
            onClick={endCall}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallDialog;