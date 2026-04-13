# VoteChain - Frontend + Backend

Ce repository contient deux projets :

- `votechains` : frontend React (Vite)
- `votechain-backend` : backend API FastAPI

## Structure du projet

```text
VoteChain/
├── votechains/           # Application frontend React
└── votechain-backend/    # API backend FastAPI
```

## Prerequis

- Node.js 18+ et npm
- Python 3.10+ (ou version compatible avec votre environnement)

## 1) Lancer le frontend (`votechains`)

```bash
cd votechains
npm install
npm run dev
```

Commandes utiles :

- `npm run build` : build de production
- `npm run preview` : previsualiser le build
- `npm run lint` : verifier le lint

## 2) Lancer le backend (`votechain-backend`)

Depuis la racine du repository :

```bash
cd votechain-backend
python3 -m venv env
source env/bin/activate
pip install fastapi uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Test rapide de l'API :

- Ouvrir `http://localhost:8000/`
- Reponse attendue : `{"message":"VoteChain API is running 🚀"}`

## Lancer les deux projets ensemble

Terminal 1 (frontend) :

```bash
cd votechains
npm install
npm run dev
```

Terminal 2 (backend) :

```bash
cd votechain-backend
source env/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
