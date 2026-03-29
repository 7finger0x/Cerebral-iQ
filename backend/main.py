from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Internal Imports
from psychometrics.scoring import calculate_deviation_iq
from psychometrics.selection import select_next_item, update_theta
from models.item_bank import ITEM_BANK, load_bank

load_dotenv()

app = FastAPI(title="Cerebral iQ Psychometric Engine")

# Supabase Client for Engine Persistance
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Configure CORS for Next.js 15
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class AnswerSubmission(BaseModel):
    session_id: str
    item_idx: int
    response: int # 0 or 1
    current_theta: float
    history: List[int]
    latency: Optional[float] = None

# --- Endpoints ---
@app.get("/")
def read_root():
    return {"status": "Cerebral iQ Engine Online", "version": "2026.1"}

@app.post("/assessment/start")
async def start_assessment():
    # Ensure bank is loaded
    if not ITEM_BANK:
        load_bank()
        
    # Select first item (usually something neutral index around theta=0)
    next_idx = select_next_item(0.0, [])
    
    # Create persistent session in Supabase
    try:
        response = supabase.table("sessions").insert({
            "theta": 0.0,
            "history": [],
            "responses": [],
            "latencies": []
        }).execute()
        
        session_data = response.data[0]
        session_id = session_data["id"]
        
        return {
            "session_id": session_id,
            "first_item": ITEM_BANK[next_idx] if next_idx != -1 else None,
            "item_idx": next_idx
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize session: {e}")

@app.post("/assessment/submit")
async def submit_answer(data: AnswerSubmission):
    # Fetch session to validate/update
    try:
        session_res = supabase.table("sessions").select("*").eq("id", data.session_id).single().execute()
        session = session_res.data
    except Exception:
        raise HTTPException(status_code=404, detail="Session not found")

    new_history = session["history"] + [data.item_idx]
    new_responses = session["responses"] + [data.response]
    new_latencies = session.get("latencies", []) + [data.latency if data.latency is not None else -1.0]
    
    # Update Theta based on full history
    new_theta = update_theta(new_responses, new_history)
    
    # Select next item
    next_idx = select_next_item(new_theta, new_history)
    
    # Persist update
    supabase.table("sessions").update({
        "theta": new_theta,
        "history": new_history,
        "responses": new_responses,
        "latencies": new_latencies,
        "updated_at": "now()"
    }).eq("id", data.session_id).execute()
    
    if next_idx == -1:
        return {
            "status": "complete",
            "next_item": None,
            "updated_theta": new_theta
        }

    return {
        "status": "continuing",
        "next_item": ITEM_BANK[next_idx],
        "item_idx": next_idx,
        "updated_theta": new_theta
    }

@app.get("/assessment/finalize/{session_id}/{theta}")
async def finalize_score(session_id: str, theta: float):
    # Fetch session for history/context (optional update)
    # Transform latent trait (theta) to Deviation IQ
    iq_data = calculate_deviation_iq(100 + (15 * theta))
    
    # Save profile results persistently
    try:
        supabase.table("profiles").insert({
            "full_scale_iq": iq_data["iq"],
            "classification": iq_data["classification"],
            # Simplified subtest scores for demo (in production calculate separately)
            "gf_score": iq_data["iq"] - 2, 
            "gwm_score": iq_data["iq"] + 1,
            "created_at": "now()"
        }).execute()
    except Exception as e:
        print(f"[Warn] Failed to save profile record: {e}")
        
    return iq_data
