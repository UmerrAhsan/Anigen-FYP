import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "./avatar.css";
const CreateAvatar = () => {
  const subdomain = "anigen"; // See section about becoming a partner
  const iFrameRef = useRef(null);
  var [avatarUrl, setAvatarUrl] = useState("");
  var [user, setUser] = useState({
    email: localStorage.getItem("name"),
    avatarUrl: "",
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const email = localStorage.getItem("name");
  useEffect(() => {
    let iFrame = iFrameRef.current;
    if (iFrame) {
      iFrame.src = `https://${subdomain}.readyplayer.me/en/avatar?frameApi`;
    }
  });
  useEffect(() => {
    window.addEventListener("message", subscribe);
    document.addEventListener("message", subscribe);
    return () => {
      window.removeEventListener("message", subscribe);
      document.removeEventListener("message", subscribe);
    };
  });

  function subscribe(event) {
    const json = parse(event);
    if (json?.source !== "readyplayerme") {
      return;
    }

    if (json.eventName === "v1.frame.ready") {
      let iFrame = iFrameRef.current;
      if (iFrame && iFrame.contentWindow) {
        iFrame.contentWindow.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**",
          }),
          "*"
        );
      }
    }
    // Get avatar GLB URL
    if (json.eventName === "v1.avatar.exported") {
      avatarUrl = json.data.url;
      localStorage.setItem("avatar", avatarUrl);

      user = {
        ...user,
        email: email,
        avatarUrl: avatarUrl,
      };

      axios
        .post(process.env.REACT_APP_BACKENDURL + "/avatar", user)
        .then((response) => {
          if (response.data.message === "Avatar URL updated successfully") {
            setSuccess(true);
            setMessage("Avatar Created Successfully");
          } else if (response.data.message === "Avatar URL is empty") {
            setSuccess(false);
            setMessage("Avatar creation error. Please try again");
          } else {
            setSuccess(false);
            setMessage("Error");
          }
        })
        .catch((error) => {
          setSuccess(false);
          setMessage("Network Error");
          console.error(error);
        });
    }
    // Get user id
    if (json.eventName === "v1.user.set") {
      console.log(`User with id ${json.data.id} set:${JSON.stringify(json)}`);
    }
  }

  function parse(event) {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      return null;
    }
  }

  return (
    <div>
      {message && (
        <div
          className={`alert alert-${success ? "success" : "danger"}`}
          role="alert"
        >
          {message}
        </div>
      )}
      <div className="App">
        <iframe
          allow="camera *; microphone *"
          className="iFrame"
          id="frame"
          ref={iFrameRef}
          title={"Ready Player Me"}
        />
      </div>
    </div>
  );
};

export default CreateAvatar;
