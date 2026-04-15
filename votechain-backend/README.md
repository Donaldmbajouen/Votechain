# VoteChain Backend

API FastAPI pour la gestion d'un systeme de vote avec JWT, PostgreSQL et SQLAlchemy.

## Fonctionnalites

- Authentification JWT (`/auth/register`, `/auth/login`)
- Gestion des campagnes et candidats (admin)
- Vote authentifie avec limite de 1 vote par IP et par campagne
- Consultation des resultats agreges par candidat

## Installation

```bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```

## Configuration

Copier le fichier d'exemple et adapter les valeurs:

```bash
cp .env.example .env
```

Variables:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

## Demarrage

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Documentation API

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
