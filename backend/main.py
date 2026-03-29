from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

# Internal Imports
from psychometrics.scoring import calculate_deviation_iq
from psychometrics.selection import select_next_item, update_theta
from models.item_bank import ITEM_BANK

app = FastAPI(title="Cerebral iQ Psychometric Engine")

# Configure CORS for Next.js 15
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class AssessmentSession(BaseModel):
    session_id: str
    theta: float = 0.0
    responses: List[int] = []
    item_indices: List[int] = []

class AnswerSubmission(BaseModel):
    session_id: str
    item_idx: int
    response: int # 0 or 1
    current_theta: float
    history: List[int] # List of indices answered

# --- In-Memory Store (Mock for now, replace with Redis/DB later) ---
sessions = {}

# --- Endpoints ---
@app.get("/")
def read_root():
    return {"status": "Cerebral iQ Engine Online", "version": "2026.1"}

@app.post("/assessment/start")
async def start_assessment():
    session_id = str(uuid.uuid4())
    # Select first item (usually something neutral index around theta=0)
    # Using theta=0.0 to start
    next_idx = select_next_item(0.0, [])
    
    sessions[session_id] = {
        "theta": 0.0,
        "history": [],
        "responses": []
    }
    
    return {
        "session_id": session_id,
        "first_item": ITEM_BANK[next_idx] if next_idx != -1 else None,
        "item_idx": next_idx
    }

@app.post("/assessment/submit")
async def submit_answer(data: AnswerSubmission):
    # Update local state
    if data.session_id not in sessions:
        # Fallback for simple stateless calls (allows client to keep history)
        pass 
        
    new_history = data.history + [data.item_idx]
    # Update responses? Need to map response to index correctly.
    # We assume 'response' matches the last item_idx.
    
    # We estimate theta based on full history (Simplified for now)
    # Note: In production, store the binary responses in order of item_indices.
    # For now we use the mock current_theta + latest response.
    # Real logic: theta = update_theta(responses, item_indices)
    
    # Select next item
    next_idx = select_next_item(data.current_theta, new_history)
    
    if next_idx == -1:
        # Scoring phase (Manual trigger)
        return {
            "status": "complete",
            "next_item": None
        }

    return {
        "status": "continuing",
        "next_item": ITEM_BANK[next_idx],
        "item_idx": next_idx,
        "updated_theta": data.current_theta # In real IRT, this updates on every step
    }

@app.get("/assessment/finalize/{theta}")
async def finalize_score(theta: float):
    # Transform latent trait (theta) to Deviation IQ
    # Mean (100) and SD (15) mapping
    # Z-score of theta/1.0 corresponds to standard Deviation IQ
    iq_data = calculate_deviation_iq(100 + (15 * theta))
    return iq_data
