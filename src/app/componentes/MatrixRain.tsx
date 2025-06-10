"use client";
import { useEffect } from "react";

export default function MatrixRain() {
  useEffect(() => {
    const canvas = document.getElementById("matrixRain") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Tamanho da tela
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = ["<_Flash>/", ".bootcamp>_"];
    const fontSize = 32; // AUMENTADO
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Mais visível e suave
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff9f";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset aleatório da coluna
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 120); // MAIS LENTO
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      id="matrixRain"
      className="fixed top-0 left-0 w-full h-full z-10  pointer-events-none"
    />
  );
}
