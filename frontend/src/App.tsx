import {
  WebcamComponent,
  WebcamComponentHandle,
} from "./components/Webcam.tsx";
import { styles } from "./styles.ts";
import { useEffect, useRef, useState } from "react";
import "./global.css";
import { PROMPTS, SYSTEM_PROMPT } from "./prompts.ts";
import { AutoScroll } from "./components/Autoscroll.tsx";

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
      <AutoScroll style={{ width: "40%", padding: "2rem" }}>
        <b>Reasoning:</b> {thinking}
      </AutoScroll>
      <AutoScroll style={{ width: "40%", padding: "2rem" }}>
        {webcamImage && (
          <div>
            <img
              src={`data:image/[type];base64,${webcamImage}`}
              alt="Webcam"
              style={{ width: "100%" }}
            />
          </div>
        )}
        <b>Answer:</b> {answer}
      </AutoScroll>
      <div
        style={{
          width: "20%",
          padding: "2rem",
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div>
          <WebcamComponent
            ref={webcamRef}
            onScreenshot={(imageSrc) => setWebcamImage(imageSrc)}
          />
        </div>
        {messages.map((msg, index) => (
          <div key={index}>
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
