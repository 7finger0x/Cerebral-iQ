from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import os
import httpx
from dotenv import load_dotenv

# Internal Imports
from psychometrics.scoring import calculate_deviation_iq, calculate_gs_metrics
from psychometrics.selection import select_next_item, update_theta
from models.item_bank import ITEM_BANK, load_bank

load_dotenv()

app = FastAPI(title="Cerebral iQ Psychometric Engine")

# Supabase Auth/DB Configuration
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

DEFAULT_HEADERS = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

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
    if not ITEM_BANK:
        load_bank()
        
    next_idx = select_next_item(0.0, [])
    
    # Store persistent session via PostgREST
    try:
        url = f"{supabase_url}/rest/v1/sessions"
        payload = {
            "theta": 0.0,
            "history": [],
            "responses": [],
            "latencies": []
        }
        with httpx.Client() as client:
            res_full = client.post(url, headers={**DEFAULT_HEADERS, "Prefer": "return=representation"}, json=payload)
            res_full.raise_for_status()
            session_data = res_full.json()[0]
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
    # Fetch session via PostgREST
    try:
        url = f"{supabase_url}/rest/v1/sessions?id=eq.{data.session_id}"
        with httpx.Client() as client:
            session_res = client.get(url, headers=DEFAULT_HEADERS)
            session_res.raise_for_status()
            session = session_res.json()[0]
    except Exception:
        raise HTTPException(status_code=404, detail="Session not found")

    new_history = (session.get("history") or []) + [data.item_idx]
    new_responses = (session.get("responses") or []) + [data.response]
    new_latencies = (session.get("latencies") or []) + [data.latency if data.latency is not None else -1.0]
    
    new_theta = update_theta(new_responses, new_history)
    next_idx = select_next_item(new_theta, new_history)
    
    # Update persistent session
    try:
        update_url = f"{supabase_url}/rest/v1/sessions?id=eq.{data.session_id}"
        update_payload = {
            "theta": new_theta,
            "history": new_history,
            "responses": new_responses,
            "latencies": new_latencies,
            "updated_at": "now()"
        }
        with httpx.Client() as client:
            update_res = client.patch(update_url, headers=DEFAULT_HEADERS, json=update_payload)
            update_res.raise_for_status()
    except Exception as e:
        print(f"[Error] Failed to persist submission: {e}")
    
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
async def finalize_score(session_id: str, theta: float, user_id: Optional[str] = None):
    # Fetch session to get latencies/domains
    try:
        url = f"{supabase_url}/rest/v1/sessions?id=eq.{session_id}"
        with httpx.Client() as client:
            session_res = client.get(url, headers=DEFAULT_HEADERS)
            session_res.raise_for_status()
            session = session_res.json()[0]
    except Exception:
        raise HTTPException(status_code=404, detail="Session not found for finalization")

    # Get domains for items in history (with bounds safety)
    domains = []
    for idx in session["history"]:
        if 0 <= idx < len(ITEM_BANK):
            domains.append(ITEM_BANK[idx]["domain"])
        else:
            domains.append("unknown")
    
    # Calculate Gs Metrics [CS-08]
    gs_metrics = calculate_gs_metrics(session["responses"], session["latencies"], domains)
    
    iq_data = calculate_deviation_iq(100 + (15 * theta))
    
    # Add Gs Metrics to final IQ payload
    iq_data.update(gs_metrics)
    
    # Save profile via PostgREST
    try:
        url = f"{supabase_url}/rest/v1/profiles"
        payload = {
            "user_id": user_id,
            "full_scale_iq": iq_data["iq"],
            "classification": iq_data["classification"],
            "gf_score": iq_data["iq"] - 2, 
            "gs_score": gs_metrics["gs_score"],
            "gwm_score": iq_data["iq"] + 1,
            "created_at": "now()"
        }
        with httpx.Client() as client:
            prof_res = client.post(url, headers=DEFAULT_HEADERS, json=payload)
            prof_res.raise_for_status()
    except Exception as e:
        print(f"[Warn] Failed to save profile record: {e}")
        
    return iq_data
