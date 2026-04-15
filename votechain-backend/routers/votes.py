from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from dependencies import get_current_user, get_db
from models import Campaign, Candidate, User, Vote
from schemas import VoteCreate, VoteRead

router = APIRouter(prefix="/campaigns", tags=["Votes"])


def _extract_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


@router.post("/{campaign_id}/vote", response_model=VoteRead, status_code=status.HTTP_201_CREATED)
def cast_vote(
    campaign_id: int,
    payload: VoteCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    candidate = db.get(Candidate, payload.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if candidate.campaign_id != campaign_id:
        raise HTTPException(
            status_code=400,
            detail="Candidate does not belong to this campaign",
        )

    now = datetime.now(timezone.utc)
    if now < campaign.starts_at or now > campaign.ends_at:
        raise HTTPException(status_code=400, detail="Campaign is not active")

    client_ip = _extract_client_ip(request)

    existing_vote = db.scalar(
        select(Vote).where(Vote.campaign_id == campaign_id, Vote.voter_ip == client_ip)
    )
    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="This IP address has already voted in this campaign",
        )

    vote = Vote(
        campaign_id=campaign_id,
        candidate_id=payload.candidate_id,
        voter_id=current_user.id,
        voter_ip=client_ip,
    )
    db.add(vote)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="This IP address has already voted in this campaign",
        )
    db.refresh(vote)
    return vote
