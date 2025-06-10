"use client";

import React from "react";
import ConnectWalletButton from "./componentes/ConnectWalletButton";
import MatrixRain from "./componentes/MatrixRain";

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <MatrixRain /> {/* Background effect */}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-4">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Welcome to FlashBootcampApp
        </h1>
        <p className="text-lg mb-4 text-center">
          Your journey to mastering web development starts here!
        </p>

        <ConnectWalletButton />
      </div>
    </div>
  );
}
