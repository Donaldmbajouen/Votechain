from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from models import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.voter


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: UserRole
    created_at: datetime


class CampaignCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str | None = None
    starts_at: datetime
    ends_at: datetime


class CampaignRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    starts_at: datetime
    ends_at: datetime
    created_by: int
    created_at: datetime


class CandidateCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    bio: str | None = None


class CandidateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_id: int
    name: str
    bio: str | None = None
    created_at: datetime


class CampaignDetail(CampaignRead):
    candidates: list[CandidateRead] = Field(default_factory=list)


class VoteCreate(BaseModel):
    candidate_id: int


class VoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_id: int
    candidate_id: int
    voter_id: int | None
    voter_ip: str
    created_at: datetime


class CampaignResultItem(BaseModel):
    candidate_id: int
    candidate_name: str
    votes: int


class CampaignResults(BaseModel):
    campaign_id: int
    total_votes: int
    results: list[CampaignResultItem]
