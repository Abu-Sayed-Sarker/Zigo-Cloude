import * as React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useNavigate, useParams } from "react-router-dom";

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

export function getUrlParams(url = window.location.href) {
  let urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

export default function App2() {
  const roomID = useParams().roomId;

  ////////////////////////////////////////// audio call setup //////////////////////////////////////////////////////////

  const navigate = useNavigate();
  let myMeeting = async (element) => {
    // generate Kit Token
    const appID = 1040999479;
    const serverSecret = "93dd0316c1fa2da808800ce9efbcfd3d";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      randomID(5),
      randomID(5)
    );

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    zp.joinRoom({
      showPreJoinView: false,
      container: element,
      sharedLinks: [
        {
          name: "Personal link",
          url:
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?roomID=" +
            roomID,
        },
      ],
      turnOnCameraWhenJoining: false,
      showScreenSharingButton: false,
      showAudioVideoSettingsButton: false,
      showUserList: false,
      showMoreButton: false,
      showMyCameraToggleButton: false,
      showChat: false,
      showRoomDetailsButton: false,
      showTextChat: false,
      maxUsers: 2,
      showRoomTimer: true,
      showUserName: false,
      onUserJoin: () => {
        console.log("user joined");
      },
      onJoinRoom: () => {
        console.log("onJoinRoom");
      },
      onLeaveRoom: () => {
        navigate("/");
        console.log("onLeaveRoom");
      },
      onUserLeave: () => {
        console.log("onUserLeave");
        navigate("/");
      },
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
        audioOnly: true,
        video: false,
      },
    });
  };

  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
}
