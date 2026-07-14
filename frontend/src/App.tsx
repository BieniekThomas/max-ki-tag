import {
  WebcamComponent,
  WebcamComponentHandle,
} from "./components/Webcam.tsx";
import { styles } from "./styles.ts";
import { useEffect, useMemo, useRef, useState } from "react";
// import io from "socket.io-client";
import { PROMPTS, SYSTEM_PROMPT } from "./prompts.ts";
import { AutoScroll } from "./components/Autoscroll.tsx";
import { motion } from "framer-motion";

const OLLAMA_BASE_URL = "http://localhost:11434";

export default function App() {
  const webcamRef = useRef<WebcamComponentHandle>(null);
  const [thinking, setThinking] = useState("");
  const [answer, setAnswer] = useState("");
  const [prompt, setPrompt] = useState<string>(
    PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
  );
  const [webcamImage, setWebcamImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const RandomPositionsArray = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      x1: Math.floor(Math.random() * 1920),
      y1: Math.floor(Math.random() * 1080),
      x2: Math.floor(Math.random() * 1920),
      y2: Math.floor(Math.random() * 1080),
      x3: Math.floor(Math.random() * 1920),
      y3: Math.floor(Math.random() * 1080),
      x4: Math.floor(Math.random() * 1920),
      y4: Math.floor(Math.random() * 1080),
      x5: Math.floor(Math.random() * 1920),
      y5: Math.floor(Math.random() * 1080),
      x6: Math.floor(Math.random() * 1920),
      y6: Math.floor(Math.random() * 1080),
    }));
  }, []);

  function generateRandomPrompt() {
    const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(randomPrompt);
  }

  const handleCapture = () => {
    const base64 = webcamRef.current?.capture();
    console.log(base64);
    return base64;
  };

  async function chatWithOllama() {
    const base64 = handleCapture();

    if (!base64) return;

    setWebcamImage(base64);
    setThinking("");
    setAnswer("");
    generateRandomPrompt();

    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
        images: [base64],
      },
    ];
    setMessages([
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3.5",
        stream: true,
        messages: messages,
      }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const json = JSON.parse(line);
          if (json.message?.thinking) {
            setThinking((prev) => prev + json.message.thinking);
          }

          if (json.message?.content) {
            setAnswer((prev) => prev + json.message.content);
          }

          if (json.done) {
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      while (!cancelled) {
        try {
          await chatWithOllama();

          // Wait one second before the next capture
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (err) {
          console.error(err);

          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={styles.container}>
      <AutoScroll style={{ width: "50%" }}>Thinking: {thinking}</AutoScroll>
      <AutoScroll style={{ width: "50%" }}>Answer: {answer}</AutoScroll>
      <motion.div
        animate={{
          x: RandomPositionsArray.map((pos) => pos.x1),
          y: RandomPositionsArray.map((pos) => pos.y1),
          rotate: [0, 1, -1, 0.5, 0],
        }}
        transition={{
          duration: 500,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={styles.gridItem}
      >
        <AutoScroll>
          <WebcamComponent
            ref={webcamRef}
            onScreenshot={(imageSrc) => setWebcamImage(imageSrc)}
          />
        </AutoScroll>
      </motion.div>
      {/* <motion.div
        animate={{
          x: RandomPositionsArray.map((pos) => pos.x2),
          y: RandomPositionsArray.map((pos) => pos.y2),
          rotate: [0, 1, -1, 0.5, 0],
        }}
        transition={{
          duration: 213,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={styles.gridItem}
      >
        <AutoScroll style={styles.gridItem}>
          <div style={styles.prompt}>Prompt: {prompt}</div>
        </AutoScroll>
      </motion.div> */}
      {/* <motion.div
        animate={{
          x: RandomPositionsArray.map((pos) => pos.x3),
          y: RandomPositionsArray.map((pos) => pos.y3),
          rotate: [0, 1, -1, 0.5, 0],
        }}
        transition={{
          duration: 201,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={styles.gridItem}
      >
        <AutoScroll style={styles.gridItem}>
          <img
            src={`data:image/jpeg;base64,${webcamImage}`}
            alt="Webcam Capture"
          />
        </AutoScroll>
      </motion.div> */}
      {/* <motion.div
        animate={{
          x: RandomPositionsArray.map((pos) => pos.x4),
          y: RandomPositionsArray.map((pos) => pos.y4),
          rotate: [0, 1, -1, 0.5, 0],
        }}
        transition={{
          duration: 193,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={styles.gridItem}
      >
        <AutoScroll style={styles.gridItem}>
          <div style={styles.thinking}>Thinking: {thinking}</div>
        </AutoScroll>
      </motion.div> */}
      {/* <motion.div
        animate={{
          x: RandomPositionsArray.map((pos) => pos.x5),
          y: RandomPositionsArray.map((pos) => pos.y5),
          rotate: [0, 1, -1, 0.5, 0],
        }}
        transition={{
          duration: 240,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={styles.gridItem}
      >
        <AutoScroll style={styles.gridItem}>
          <div style={styles.answer}>Answer: {answer}</div>
        </AutoScroll>
      </motion.div> */}
      {/* <motion.div
        animate={{
          x: RandomPositionsArray.map((pos) => pos.x6),
          y: RandomPositionsArray.map((pos) => pos.y6),
          rotate: [0, 1, -1, 0.5, 0],
        }}
        transition={{
          duration: 234,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={styles.gridItem}
      >
        <AutoScroll style={styles.gridItem}>
          {JSON.stringify(messages, null, 2)}
        </AutoScroll>
      </motion.div> */}
    </div>
  );
}
