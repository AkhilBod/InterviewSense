"use client";
import React, { useEffect, useRef, useState } from "react";

export const ShootingStars = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#FFFFFF",
  trailColor = "#FFFFFF",
  starWidth = 10,
  starHeight = 1,
  className,
}: {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}) => {
  const [star, setStar] = useState<React.CSSProperties[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const createStar = () => {
      const yPos = Math.random() * 100;
      const xPos = Math.random() * 100;
      const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;

      const newStar: React.CSSProperties = {
        left: `${xPos}%`,
        top: `${yPos}%`,
        animationDuration: `${speed}s`,
        animationDelay: `${delay}ms`,
      };

      setStar((prevStars) => [...prevStars, newStar]);

      setTimeout(() => {
        setStar((prevStars) => prevStars.slice(1));
      }, (speed + delay / 1000) * 1000);
    };

    const interval = setInterval(createStar, maxDelay);

    return () => clearInterval(interval);
  }, [minSpeed, maxSpeed, minDelay, maxDelay]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {star.map((style, index) => (
        <div
          key={index}
          className="shooting-star absolute"
          style={style}
        >
          <svg
            ref={svgRef}
            width={starWidth}
            height={starHeight}
            viewBox={`0 0 ${starWidth} ${starHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute"
          >
            <rect
              x="0"
              y="0"
              width={starWidth}
              height={starHeight}
              fill={`url(#gradient-${index})`}
            />
            <defs>
              <linearGradient
                id={`gradient-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={trailColor} stopOpacity="0" />
                <stop offset="100%" stopColor={starColor} stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}
      <style jsx>{`
        .shooting-star {
          animation: shoot linear forwards;
        }
        @keyframes shoot {
          0% {
            transform: translate(0, 0) rotate(315deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translate(300px, 300px) rotate(315deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export const StarsBackground = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}: {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
}) => {
  const [stars, setStars] = useState<
    {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      twinkleSpeed: number | null;
    }[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateStars = (width: number, height: number) => {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      const generatedStars = [];

      for (let i = 0; i < numStars; i++) {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability;
        generatedStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed +
              Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
        });
      }

      return generatedStars;
    };

    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        setStars(generateStars(canvas.width, canvas.height));
      }
    };

    updateStars();

    const handleResize = () => {
      updateStars();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [
    starDensity,
    allStarsTwinkle,
    twinkleProbability,
    minTwinkleSpeed,
    maxTwinkleSpeed,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        if (star.twinkleSpeed !== null) {
          star.opacity =
            0.5 +
            Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
    />
  );
};
