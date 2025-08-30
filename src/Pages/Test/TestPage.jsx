import React, { useEffect, useState } from "react";
import { Phone, Video, UserPlus, Sparkles, Users } from "lucide-react";
import { ZIM } from "zego-zim-web";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

function randomID(len) {
  let result = "";
  if (result) return result;
  var chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export default function VideoCallComponent() {
  const [callee, setCallee] = useState("");
  const user_name = "Abu Sayed";

  const userName = randomID(6);
  const userID = "user_" + userName;

  const appID = 1040999479;
  const serverSecret = "93dd0316c1fa2da808800ce9efbcfd3d";

  const TOKEN = ZegoUIKitPrebuilt.generateKitTokenForTest(
    appID,
    serverSecret,
    null,
    userID,
    userName
  );

  const zp = ZegoUIKitPrebuilt.create(TOKEN);
  zp.addPlugins({ ZIM });
  console.log("Token", TOKEN);

  const handleVideoCall = () => {
    const targetUser = {
      userID: callee,
      userName: "user_" + callee,
    };
    zp.sendCallInvitation({
      callees: [targetUser],
      callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
      timeout: 60, // Timeout duration (second). 60s by default, range from [1-600s].
    })
      .then((res) => {
        console.warn(res);
      })
      .catch((err) => {
        console.warn(err);
      });
  };
  const handleVoiceCall = () => {
    const roomID = randomID(6);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Connect & Call
          </h1>
          <p className="text-blue-200 text-sm">
            Start your conversation instantly
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Username Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-5 h-5 text-purple-300" />
              <label className="text-white font-medium text-sm">Username</label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={callee}
                onChange={(e) => setCallee(e.target.value)}
                placeholder="Enter Callee's UserID"
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300 text-center font-medium"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <div className="text-xs text-blue-200 mt-2 text-center">
              UserID: {userID || "Not specified"}
            </div>
          </div>

          {/* Call Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Voice Call Button */}
            <button
              onClick={() =>
                handleVoiceCall(ZegoUIKitPrebuilt.InvitationTypeVoiceCall)
              }
              disabled={!callee.trim()}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />

                <span className="text-sm">Voice Call</span>
              </div>
            </button>

            {/* Video Call Button */}
            <button
              onClick={handleVideoCall}
              disabled={!callee.trim()}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                <Video className="w-5 h-5" />

                <span className="text-sm">Video Call</span>
              </div>
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300">Ready to connect</span>
            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-xs">
            Secure • Encrypted • Instant Connection
          </p>
        </div>
      </div>
    </div>
  );
}
