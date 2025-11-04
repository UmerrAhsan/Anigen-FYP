import React, { useState, useEffect, useRef } from "react";
import * as THREE from "./three";
import { FBXLoader } from "./three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "./three/examples/jsm/loaders/RGBELoader.js";
import * as TWEEN from "es6-tween";
import axios from "axios";
const MyThreeScene = () => {
  const canvasRef = useRef(null);
  var [mixer, setMixer] = useState(null);
  var [scene, setScene] = useState(null);
  var [camera, setCamera] = useState(null);
  var [renderer, setRenderer] = useState(null);
  var [controls, setControls] = useState(null);
  var [tween, setTween] = useState(null);
  var [avatarurl, setavatarurl] = useState("");

  function loadBackground(url, renderer) {
    return new Promise((resolve) => {
      const loader = new RGBELoader();
      const generator = new THREE.PMREMGenerator(renderer);
      loader.load(url, (texture) => {
        const envMap = generator.fromEquirectangular(texture).texture;
        generator.dispose();
        texture.dispose();
        resolve(envMap);
      });
    });
  }

  useEffect(async () => {
    try {
      const email = localStorage.getItem("name");
      const response = await axios.get(
        process.env.REACT_APP_BACKENDURL + `/ThreeScene/${email}/avatarurl`
      );
      avatarurl = await response.data.avatarurl;
      console.log(avatarurl);
    } catch (error) {
      console.error(error);
    }

    TWEEN.autoPlay(true);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
    camera.position.set(-0.07, 0.36, 1.9);
    scene.add(camera);

    //add white light
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 1, 1);
    scene.add(light);

    const loader = new GLTFLoader();

    if (avatarurl == "") {
      console.log("avatarurl is null");
    }

    const query = avatarurl + "?morphTargets=ARKit";

    loader.load(
      query,
      (gltf) => {
        scene.add(gltf.scene);

        scene.getObjectByName("Armature").position.set(0, -1.2, 1.2);

        mixer = new THREE.AnimationMixer(gltf.scene);

        const animLoader = new FBXLoader();
        animLoader.load(
          "/assets/BreathingIdle.fbx",
          (animation) => {
            const clip = animation.animations[0];
            mixer.clipAction(clip).play();
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% animation loaded");
          },
          (error) => {
            console.log(error);
          }
        );

        const animate2 = async function () {
          const morphTargetParams = {
            key: "eyeBlinkRight",
            key2: "eyeBlinkLeft",
            targetValue: 1,
            transition: 100,
            duration: 200,
          };

          const mesh = scene
            .getObjectByName("Armature")
            .getObjectByName("Wolf3D_Avatar");

          const morphTargetIndex =
            mesh.morphTargetDictionary[morphTargetParams.key];
          const morphTargetIndex2 =
            mesh.morphTargetDictionary[morphTargetParams.key2];

          if (morphTargetParams) {
            const { transition, targetValue, duration } = morphTargetParams;

            const currentValue = {
              v: mesh.morphTargetInfluences[morphTargetIndex],
              v1: mesh.morphTargetInfluences[morphTargetIndex2],
            };

            tween = new TWEEN.Tween(currentValue)
              .to({ v: targetValue, v1: targetValue }, transition)
              .on("update", () => {
                mesh.morphTargetInfluences[morphTargetIndex] = currentValue.v;
                mesh.morphTargetInfluences[morphTargetIndex2] = currentValue.v1;
              })
              .on("complete", async () => {
                //sleep for duration
                await new Promise((resolve) => setTimeout(resolve, 3000));
                animate2();
              })
              .repeat(1)
              .delay(duration)
              .yoyo(true)
              .easing(TWEEN.Easing.Cubic.InOut)
              .start();
          }
        };

        animate2();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% model loaded");
      },
      (error) => {
        console.log(error);
      }
    );

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    renderer.setSize(600, 400);

    // Load the background
    loadBackground(
      "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/blue_photo_studio_4k.hdr",
      renderer
    ).then((envMap) => {
      scene.background = envMap;
      // scene.environment = envMap;
    });

    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      if (mixer) {
        mixer.update(0.01);
      }
    };
    animate();
  }, []);

  return (
    <>
      <canvas
        id="canvas"
        ref={canvasRef}
        style={{ width: "600px", height: "400px" }}
      />
    </>
  );
};

export default MyThreeScene;
