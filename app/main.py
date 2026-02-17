import smtplib
from email.message import EmailMessage

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from app.agents.graph import app_graph
from app.config import settings
from app.models.trade import TradeDecision
from app.utils.auth import validate_key, increment_usage

app = FastAPI(
    title="FinTeam",
    description="Multi-agent AI trading system powered by LangGraph",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    ticker: str


class AnalyzeResponse(BaseModel):
    decision: TradeDecision
    company_name: str


class KeyStatus(BaseModel):
    valid: bool
    remaining: int


def require_key(x_api_key: str = Header(...)) -> str:
    """FastAPI dependency that validates the API key and checks remaining usage."""
    info = validate_key(x_api_key)
    if not info["valid"]:
        raise HTTPException(
            status_code=403,
            detail="API key is invalid or has no remaining analyses",
        )
    return x_api_key


class KeyRequest(BaseModel):
    name: str
    email: EmailStr


class KeyRequestResponse(BaseModel):
    sent: bool


def _send_notification(name: str, email: str) -> None:
    """Send a key-request notification to the admin via Gmail SMTP."""
    msg = EmailMessage()
    msg["Subject"] = f"FinTeam key request from {name}"
    msg["From"] = settings.smtp_user
    msg["To"] = settings.notify_email
    msg.set_content(
        f"Name: {name}\nEmail: {email}\n\n"
        "To approve, run:\n"
        f"  python manage.py create-key\n\n"
        "Then reply to the requester with the key."
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/request-key", response_model=KeyRequestResponse)
async def request_key(req: KeyRequest):
    """Send an email notification so the admin can provision a key."""
    if not settings.smtp_user or not settings.notify_email:
        raise HTTPException(status_code=503, detail="Email notifications are not configured")
    _send_notification(req.name, req.email)
    return KeyRequestResponse(sent=True)


@app.get("/validate-key", response_model=KeyStatus)
async def check_key(key: str = Query(...)):
    """Check whether an API key is valid and how many analyses remain."""
    info = validate_key(key)
    return KeyStatus(**info)


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest, x_api_key: str = Header(...)):
    """Run the full agent pipeline for a given ticker."""
    # Validate key
    info = validate_key(x_api_key)
    if not info["valid"]:
        raise HTTPException(
            status_code=403,
            detail="API key is invalid or has no remaining analyses",
        )

    ticker = req.ticker.upper().strip()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker is required")

    result = await app_graph.ainvoke({"ticker": ticker})

    # Only count usage after a successful analysis
    increment_usage(x_api_key)

    return AnalyzeResponse(
        decision=result["decision"],
        company_name=result.get("company_name", ticker),
    )
