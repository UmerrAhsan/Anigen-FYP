import React, { useEffect, useState, Fragment, useRef } from "react";
import axios from "axios";
import MyThreeScene from "../3DRender/MyThreeScene";

const WebGL = () => {
  const canvasRef = useRef(null);
  var [recorder, setRecorder] = useState(null);
  var [data, setData] = useState([]);
  const [filenames, setFilenames] = useState([]);
  const [textValue, setTextValue] = useState("");
  const [filenameValue, setFilenameValue] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFilenames = async () => {
      try {
        const email = localStorage.getItem("name");
        const response = await axios.get(
          process.env.REACT_APP_BACKENDURL + `/TTS/${email}/filenames`
        );
        setFilenames(response.data.filenames);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFilenames();
  }, []);

  const handleFilenameChange = (event) => {
    setFilenameValue(event.target.value);
  };

  async function generateVideo() {
    setSuccess(false);
    setMessage("Generating Video...");
    const canvas = document.querySelector("#canvas");
    const stream = canvas.captureStream(60);
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      data.push(event.data);
    };
    recorder.start();
    await new Promise((resolve) => setTimeout(resolve, 6000));
    recorder.stop();
    const blob = new Blob(data, { type: "video/webm" });
    if (blob.size === 0) {
      setSuccess(false);
      setMessage("Error Recording Video");
    } else {
      var url = URL.createObjectURL(blob);
      var video = document.querySelector("video");
      video.src = url;

      var formData = new FormData();
      formData.append("video_file", blob, "input_video.webm");
      const text = document.getElementById("script").value;
      const email = localStorage.getItem("name");

      if (filenameValue == "default") {
        var query =
          process.env.REACT_APP_MLSERVER +
          `/generateVideo?text=${text}&speaker=VCTK_old_20I-2440@nu.edu.pk&email=${email}`;
      } else {
        if (filenameValue != "") {
          var query =
            process.env.REACT_APP_MLSERVER +
            `/generateVideo?text=${text}&voicename=${filenameValue}&email=${email}`;
        }
      }

      let response = null;
      try {
        response = await axios
          .post(query, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
          })
          .catch((error) => {
            setSuccess(false);
            setMessage("Network Error");
          });
      } catch (error) {
        setSuccess(false);
        setMessage("Network Error");
      }

      if (response === null || response.data.type !== "video/mp4") {
        setSuccess(false);
        setMessage("Network Error Video not generated");
      } else {
        setSuccess(true);
        setMessage("Video Generated");
        url = URL.createObjectURL(response.data);
        video.src = url;
      }
    }
  }

  return (
    <Fragment>
      <div className="d-flex justify-content-center">
        <div className="row">
          <div className="col-md-8">
            <textarea
              id="script"
              placeholder="Enter Script (minimum 20 characters)"
              className="form-control mb-3"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              style={{ height: "10vh", marginTop: "2vh" }}
            ></textarea>
            <select
              className="form-select"
              style={{ width: "27vh", height: "5vh", margin: "0 0 1vh 0" }}
              value={filenameValue}
              onChange={handleFilenameChange}
            >
              <option value="">Select a voicename</option>
              {filenames.map((filename, index) => (
                <option key={index} value={filename}>
                  {filename}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <button
              onClick={generateVideo}
              disabled={textValue.trim().length < 20 || !filenameValue.trim()}
              className="btn btn-primary btn-lg"
              style={{ height: "10vh", marginTop: "2vh", fontSize: "2vh" }}
            >
              Generate Video
            </button>
          </div>
        </div>
      </div>
      {message && (
        <div
          className={`alert alert-${success ? "success" : "danger"}`}
          role="alert"
        >
          {message}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "2vh 0 2vh -28vh",
        }}
      >
        <canvas ref={canvasRef}></canvas>
        <MyThreeScene canvasRef={canvasRef} />
        <video
          id="video"
          width="600px"
          height="400px"
          controls
          style={{ display: "block", margin: "0 auto" }}
        ></video>
      </div>
    </Fragment>
  );
};

export default WebGL;
