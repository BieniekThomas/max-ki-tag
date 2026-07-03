from fastapi import FastAPI, HTTPException

OLLAMA_BASE_URL = "http://localhost:11434"

app = FastAPI(title="Ollama Chatbots", version="1.0.0")


@app.get("/")
async def root():
    return {"message": "Ollama Chatbots API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
