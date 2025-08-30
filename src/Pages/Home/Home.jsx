import React from "react";

const { useEffect, useState } = React;

const PCMPlayer = class {
  constructor(audioContext, sampleRate) {
    this.ctx = audioContext;
    this.sampleRate = sampleRate || this.ctx.sampleRate;
    this.playTime = this.ctx.currentTime + 0.2;
  }

  enqueue(int16PCM, channels = 1) {
    const f32 = int16ToFloat32(int16PCM);
    const frameCount = f32.length / channels;
    const buffer = this.ctx.createBuffer(channels, frameCount, this.sampleRate);
    for (let ch = 0; ch < channels; ch++) {
      const channelData = buffer.getChannelData(ch);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = f32[i * channels + ch] || 0;
      }
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.ctx.destination);
    const now = this.ctx.currentTime;
    if (this.playTime < now) this.playTime = now + 0.05;
    src.start(this.playTime);
    this.playTime += buffer.duration;
  }
};

const floatTo16BitPCM = (float32Array) => {
  const out = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
};

const int16ToFloat32 = (int16Array) => {
  const out = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) out[i] = int16Array[i] / 0x8000;
  return out;
};

const b64ToUint8 = (b64) => {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

const uint8ToB64 = (u8) => {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
};

const OwnerCallPanel = () => {
  const [callStatusText, setCallStatusText] = useState("Status: Not connected");
  const [notificationText, setNotificationText] = useState("");
  const [showIncomingModal, setShowIncomingModal] = useState(false);
  const [showOutgoingModal, setShowOutgoingModal] = useState(false);
  const [callerName, setCallerName] = useState("");

  useEffect(() => {
    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU2NzIyMzU0LCJpYXQiOjE3NTYxMTc1NTQsImp0aSI6IjRkZTNjZDYyZDczMDRlYmRhNTQ5NmExYmUwNDQyMzJjIiwidXNlcl9pZCI6NCwidXNlciI6eyJpZCI6NCwidXNlcm5hbWUiOiJTYW5qaWRhIEtoYW5hbSIsImVtYWlsIjoic2FuamlkYS5pY2UuNzc4QGdtYWlsLmNvbSIsInJvbGUiOiJvd25lciIsInJlc3RhdXJhbnRzX2lkIjoyLCJkZXZpY2VfaWQiOm51bGwsInN1YnNjcmlwdGlvbiI6eyJwYWNrYWdlX25hbWUiOiJtb250aCAxIiwic3RhdHVzIjoiQWN0aXZlIiwiY3VycmVudF9wZXJpb2RfZW5kIjoiMjAyNS0wOS0xOCAxMTo0MDozMCswMDowMCJ9LCJvd25lcl9pZCI6NH19.jFJ6LRO4MVbkJD1t1g8Lyu2EzbTUdZK0NDiJhq1GB08";
    const username = "Owner User";
    const userId = 4;
    const restaurantId = 2;

    let callSocket,
      currentCallId = null;
    let audioCtx, micStream, mediaSource, procNode, player;
    let seq = 0;
    let inCall = false;

    const deviceIdInput = document.getElementById("deviceId");
    const deviceUserIdInput = document.getElementById("deviceUserId");
    const callStatus = document.getElementById("call-status");
    const callNotification = document.getElementById("call-notification");
    const connectBtn = document.getElementById("connect-btn");
    const startCallBtn = document.getElementById("start-call");
    const receiveCallBtn = document.getElementById("receive-call");
    const endCallBtn = document.getElementById("end-call");
    const micStartBtn = document.getElementById("mic-start");
    const micStopBtn = document.getElementById("mic-stop");
    const resumeAudioBtn = document.getElementById("resume-audio");
    const usernameSpan = document.getElementById("username");
    usernameSpan.textContent = username;

    // Check for secure context
    if (!window.isSecureContext) {
      setNotificationText(
        "This page must be served over HTTPS or localhost to access the microphone."
      );
      console.error(
        "Insecure context: getUserMedia requires HTTPS or localhost."
      );
    }

    // Request microphone permission on mount
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      })
      .catch((err) => {
        console.error("Microphone permission error:", err);
        setNotificationText(
          "Microphone access denied. Please enable microphone permissions in your browser settings and reload the page."
        );
      });

    function ensureAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        player = new PCMPlayer(audioCtx, audioCtx.sampleRate);
      }
      if (audioCtx.state !== "running") {
        resumeAudioBtn.classList.remove("hidden");
      } else {
        resumeAudioBtn.classList.add("hidden");
      }
    }

    resumeAudioBtn.addEventListener("click", async () => {
      if (audioCtx) {
        await audioCtx.resume();
        resumeAudioBtn.classList.add("hidden");
      }
    });

    function connectSocket() {
      const deviceId = deviceIdInput.value;
      callSocket = new WebSocket(
        `wss://sacred-renewing-dove.ngrok-free.app/ws/call/${deviceId}/?token=${jwt}`
      );

      callSocket.onopen = () => {
        setCallStatusText("Status: Connected");
        connectBtn.classList.add("hidden");
        startCallBtn.classList.remove("hidden");
        micStartBtn.classList.remove("hidden");
        ensureAudioContext();
      };
      callSocket.onerror = (e) => {
        console.error("WS error:", e);
        setCallStatusText("Status: Connection error");
      };
      callSocket.onclose = () => {
        setCallStatusText("Status: Disconnected");
        connectBtn.classList.remove("hidden");
        startCallBtn.classList.remove("hidden");
        receiveCallBtn.classList.add("hidden");
        endCallBtn.classList.add("hidden");
        micStartBtn.classList.add("hidden");
        micStopBtn.classList.add("hidden");
        setShowIncomingModal(false);
        setShowOutgoingModal(false);
        currentCallId = null;
        inCall = false;
        stopMic();
      };
      callSocket.onmessage = handleCallMessage;
    }

    function handleCallMessage(event) {
      const data = JSON.parse(event.data);
      if (data.error) {
        setNotificationText(`Error: ${data.error}`);
        console.error("Call error:", data.error);
        return;
      }

      if (data.action === "incoming_call") {
        currentCallId = data.call_id;
        setCallerName(data.from);
        setNotificationText(`Incoming call from ${data.from}`);
        setCallStatusText("Status: Incoming call");
        setShowIncomingModal(true);
        startCallBtn.classList.add("hidden");
        receiveCallBtn.classList.remove("hidden");
        endCallBtn.classList.remove("hidden");
      } else if (data.action === "call_accepted") {
        setNotificationText(`Call accepted by ${data.from}`);
        setCallStatusText(`Status: Call active (Call ID: ${data.call_id})`);
        setShowIncomingModal(false);
        setShowOutgoingModal(false);
        startCallBtn.classList.add("hidden");
        receiveCallBtn.classList.add("hidden");
        endCallBtn.classList.remove("hidden");
        inCall = true;
        ensureAudioContext();
      } else if (data.action === "call_ended") {
        setNotificationText(`Call ended by ${data.by}`);
        setCallStatusText("Status: Idle");
        setShowIncomingModal(false);
        setShowOutgoingModal(false);
        startCallBtn.classList.remove("hidden");
        receiveCallBtn.classList.add("hidden");
        endCallBtn.classList.add("hidden");
        inCall = false;
        currentCallId = null;
      } else if (data.action === "audio_chunk") {
        if (data.from_user_id === userId) return;
        ensureAudioContext();
        const u8 = b64ToUint8(data.pcm_b64);
        const int16 = new Int16Array(u8.buffer, u8.byteOffset, u8.length / 2);
        player.enqueue(int16, data.channels || 1);
      }
    }

    async function startMic() {
      ensureAudioContext();
      if (audioCtx.state !== "running") await audioCtx.resume();

      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
          },
        });
        mediaSource = audioCtx.createMediaStreamSource(micStream);
        const bufferSize = 2048;
        procNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
        mediaSource.connect(procNode);
        procNode.connect(audioCtx.destination);

        procNode.onaudioprocess = (e) => {
          if (
            !inCall ||
            !callSocket ||
            callSocket.readyState !== WebSocket.OPEN
          )
            return;

          const input = e.inputBuffer.getChannelData(0);
          const pcm16 = floatTo16BitPCM(input);
          const u8 = new Uint8Array(pcm16.buffer);
          const pcm_b64 = uint8ToB64(u8);

          callSocket.send(
            JSON.stringify({
              action: "audio_chunk",
              call_id: currentCallId,
              sample_rate: audioCtx.sampleRate,
              channels: 1,
              seq: seq++,
              pcm_b64,
            })
          );
        };

        micStartBtn.classList.add("hidden");
        micStopBtn.classList.remove("hidden");
      } catch (err) {
        console.error("Failed to start microphone:", err);
        setNotificationText(
          "Failed to access microphone. Please ensure microphone permissions are granted in browser settings."
        );
      }
    }

    function stopMic() {
      try {
        if (procNode) {
          procNode.disconnect();
          procNode.onaudioprocess = null;
        }
        if (mediaSource) mediaSource.disconnect();
        if (micStream) {
          micStream.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        /* ignore */
      }
      micStartBtn.classList.remove("hidden");
      micStopBtn.classList.add("hidden");
    }

    function startCall() {
      const receiverId = deviceUserIdInput.value;
      const deviceId = deviceIdInput.value;
      if (!callSocket || callSocket.readyState !== WebSocket.OPEN) {
        setNotificationText("Please connect to WebSocket first");
        return;
      }
      if (!receiverId) {
        setNotificationText("Please enter a Device User ID");
        return;
      }
      callSocket.send(
        JSON.stringify({
          action: "start_call",
          receiver_id: parseInt(receiverId),
          device_id: parseInt(deviceId),
        })
      );
      setCallStatusText("Status: Calling device...");
      setShowOutgoingModal(true);
      startCallBtn.classList.add("hidden");
      endCallBtn.classList.remove("hidden");
    }

    function receiveCall() {
      if (!currentCallId) {
        setNotificationText("No incoming call to accept");
        return;
      }
      callSocket.send(
        JSON.stringify({
          action: "accept_call",
          call_id: currentCallId,
        })
      );
      receiveCallBtn.classList.add("hidden");
      endCallBtn.classList.remove("hidden");
    }

    function endCall() {
      if (
        callSocket &&
        callSocket.readyState === WebSocket.OPEN &&
        currentCallId
      ) {
        callSocket.send(
          JSON.stringify({
            action: "end_call",
            call_id: currentCallId,
          })
        );
      }
      setCallStatusText("Status: Idle");
      setShowIncomingModal(false);
      setShowOutgoingModal(false);
      startCallBtn.classList.remove("hidden");
      receiveCallBtn.classList.add("hidden");
      endCallBtn.classList.add("hidden");
      inCall = false;
      currentCallId = null;
    }

    connectBtn.addEventListener("click", connectSocket);
    startCallBtn.addEventListener("click", startCall);
    receiveCallBtn.addEventListener("click", receiveCall);
    endCallBtn.addEventListener("click", endCall);
    micStartBtn.addEventListener("click", startMic);
    micStopBtn.addEventListener("click", stopMic);
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Owner Call Panel
        </h2>
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            User:{" "}
            <span id="username" className="font-semibold">
              Loading...
            </span>{" "}
            | Role: <span className="font-semibold">Owner</span>
          </p>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device ID
              </label>
              <input
                id="deviceId"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                defaultValue="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device User ID
              </label>
              <input
                id="deviceUserId"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                defaultValue="5"
              />
            </div>
          </div>
          <div className="text-gray-600 text-lg" id="call-status">
            {callStatusText}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              id="connect-btn"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Connect
            </button>
            <button
              id="start-call"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition hidden flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Start Call
            </button>
            <button
              id="receive-call"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition hidden flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Receive Call
            </button>
            <button
              id="end-call"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition hidden flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              End Call
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              id="mic-start"
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition hidden flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              Start Mic
            </button>
            <button
              id="mic-stop"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition hidden flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707a1 1 0 011.414 0l8.586 8.586a1 1 0 010 1.414l-8.586 8.586a1 1 0 01-1.414 0L5.586 15z"
                />
              </svg>
              Stop Mic
            </button>
            <button
              id="resume-audio"
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition hidden flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.536 8.464a5 5 0 010 7.072m-7.072 0a5 5 0 010-7.072M12 14l2-2-2-2m0 0l-2-2m2 2V4"
                />
              </svg>
              Resume Audio
            </button>
          </div>
          <div id="call-notification" className="text-gray-600 text-lg">
            {notificationText}
          </div>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {showIncomingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Incoming Call
            </h3>
            <p className="text-lg text-gray-600 mb-6">From: {callerName}</p>
            <div className="flex justify-center gap-4">
              <button
                id="modal-receive-call"
                className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition flex items-center"
                onClick={() => receiveCall()}
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Accept
              </button>
              <button
                id="modal-end-call"
                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition flex items-center"
                onClick={() => endCall()}
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outgoing Call Modal */}
      {showOutgoingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Calling...
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Connecting to device...
            </p>
            <div className="flex justify-center gap-4">
              <button
                id="modal-cancel-call"
                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition flex items-center"
                onClick={() => endCall()}
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel Call
              </button>
              <button
                id="modal-end-call-outgoing"
                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition flex items-center"
                onClick={() => endCall()}
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerCallPanel;
