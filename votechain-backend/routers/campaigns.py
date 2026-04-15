from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from dependencies import get_current_admin, get_current_user, get_db
from models import Campaign, Candidate, User, Vote
from schemas import (
    CampaignCreate,
    CampaignDetail,
    CampaignRead,
    CampaignResultItem,
    CampaignResults,
    CandidateCreate,
    CandidateRead,
)

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post("", response_model=CampaignRead, status_code=status.HTTP_201_CREATED)
def create_campaign(
    payload: CampaignCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    if payload.ends_at <= payload.starts_at:
        raise HTTPException(status_code=400, detail="ends_at must be after starts_at")

    campaign = Campaign(
        title=payload.title,
        description=payload.description,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        created_by=current_admin.id,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.post(
    "/{campaign_id}/candidates",
    response_model=CandidateRead,
    status_code=status.HTTP_201_CREATED,
)
def add_candidate(
    campaign_id: int,
    payload: CandidateCreate,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin),
):
    campaign = db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    candidate = Candidate(
        campaign_id=campaign_id,
        name=payload.name,
        bio=payload.bio,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.get("", response_model=list[CampaignRead])
def list_campaigns(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return db.scalars(select(Campaign).order_by(Campaign.created_at.desc())).all()


@router.get("/{campaign_id}", response_model=CampaignDetail)
def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    campaign = db.scalar(
        select(Campaign)
        .options(joinedload(Campaign.candidates))
        .where(Campaign.id == campaign_id)
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.get("/{campaign_id}/results", response_model=CampaignResults)
def campaign_results(
    campaign_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    campaign = db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    rows = db.execute(
        select(Candidate.id, Candidate.name, func.count(Vote.id))
        .select_from(Candidate)
        .outerjoin(Vote, Vote.candidate_id == Candidate.id)
        .where(Candidate.campaign_id == campaign_id)
        .group_by(Candidate.id, Candidate.name)
        .order_by(func.count(Vote.id).desc(), Candidate.name.asc())
    ).all()

    results = [
        CampaignResultItem(candidate_id=row[0], candidate_name=row[1], votes=row[2]) for row in rows
    ]
    total_votes = sum(item.votes for item in results)

    return CampaignResults(campaign_id=campaign_id, total_votes=total_votes, results=results)
