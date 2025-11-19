# Roblox Pass Server (PLS-DONATE style)

Простой Express-сервер, который возвращает GamePass'ы, созданные пользователем (как у PLS DONATE).

## Endpoints
- `GET /` - health
- `GET /api/passes/:userId` - получить все GamePassы, созданные пользователем с id `userId`
- `POST /api/players` - body `{ "players":[123,456] }` -> возвращает массив игроков с passes и thumbnail

## Run locally
1. `npm install`
2. `npm start`
3. Открыть `http://localhost:3000/api/passes/USERID`

## Deploy
- Подключи репозиторий к Render/Heroku/Vercel и укажи `node server.js` или `npm start` как старт.
