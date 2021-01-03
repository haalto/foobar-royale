import React, { useEffect, useRef, useState } from "react";
import ReactNipple from "react-nipple";
import styled from "styled-components";
import io from "socket.io-client";

const Wrapper = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  align-items: center;
`;

const Controller: React.FC = () => {
  const [moveAngle, setMoveAngle] = useState<number | null>(null);
  const [aimAngle, setAimAngle] = useState<number | null>(null);

  const { current: socket } = useRef(
    io("http://localhost:4000", {
      autoConnect: false,
      query: {
        clientType: "player",
      },
    })
  );

  useEffect(() => {
    socket.open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    socket.emit("player-move", moveAngle);
  }, [moveAngle, socket]);

  useEffect(() => {
    socket.emit("player-aim", aimAngle);
  }, [aimAngle, socket]);

  interface JoystickData {
    angle: {
      radian: number;
      degree: number;
    };
    direction:
      | {
          x: "up" | "right" | "left" | "down";
          y: "up" | "right" | "left" | "down";
          angle: "up" | "right" | "left" | "down" | undefined;
        }
      | undefined;
  }

  const handleLeftMove = (event: any, data: JoystickData) => {
    const newAngle = data.angle.radian;
    setMoveAngle(newAngle);
  };

  const handleLeftEnd = () => {
    setMoveAngle(null);
  };

  const handleRightMove = (event: any, data: JoystickData) => {
    const newAngle = data.angle.radian;
    setAimAngle(newAngle);
  };

  const handleRightEnd = (event: any, data: JoystickData) => {
    //setAimAngle(null);
    console.log(data);
    socket.emit("player-shoot");
    console.log("shoot");
  };

  return (
    <Wrapper>
      <ReactNipple
        options={{ mode: "dynamic" }}
        style={{
          outline: "1px dashed red",
          width: "50%",
          height: "100vh",
          position: "relative",
        }}
        onMove={(evt: any, data: any) => handleLeftMove(evt, data)}
        onEnd={() => handleLeftEnd()}
      />

      <ReactNipple
        options={{ mode: "dynamic" }}
        style={{
          width: "50%",
          height: "100vh",
          position: "relative",
        }}
        onMove={(evt: any, data: any) => handleRightMove(evt, data)}
        onEnd={(evt: any, data: any) => handleRightEnd(evt, data)}
      />
    </Wrapper>
  );
};

export default Controller;
