export const styles = {
  container: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    background: "#faf7f2",
  },
  gridItem: {
    position: "absolute",
    width: 500,
    height: 800,
    overflow: "auto",
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,.55)",
    borderRadius: 20,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.08)",
  },
  thinking: {
    color: "#32ff32",
  },
  answer: {
    color: "#84c1ff",
  },
  prompt: {
    fontSize: "34px",
    color: "#ffb86c",
    position: "relative",
    zIndex: 3,
    backgroundColor: "#0d1117",
    padding: "10px",
  },
} as const;
