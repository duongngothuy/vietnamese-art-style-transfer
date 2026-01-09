from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes.style_transfer import router as style_transfer_router

#Creating FastAPI instance of application
app = FastAPI(title = "Vietnamese Art Style Transfer API", version="1.0.0")

#front end communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://vietnamese-art-style-transfer.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(style_transfer_router)


#Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to Vietnamese Art Style Transfer API!", "status": "running"}

#Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Vietnamese Art Transfer Backend"}

#Testing endpoint for frontend connection
@app.get("/api/test")
def test_connection():
    return {
        "message": "Backend connection successful!",
        "available_styles": ["lacquer", "silk", "dongho"],
        "status": "ready"
    }

#Start the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port = 8000)