# Event Announcement System (Local Version)

This project now runs fully on your local machine without AWS services.

## Local Architecture

- **Backend**: Node.js + Express
- **APIs**:
  - `POST /subscribe`
  - `POST /create-event`
- **Email**: Nodemailer + Gmail SMTP
- **Storage**:
  - `backend/events.json`
  - `backend/subscribers.json`
- **Frontend API URL**: `http://localhost:5000`

## Folder Structure

```text
EAS/
├─ backend/
│  ├─ server.js
│  ├─ package.json
│  ├─ .env.example
│  ├─ events.json
│  └─ subscribers.json
├─ frontend/
│  ├─ index.html
│  ├─ style.css
│  ├─ app.js
│  └─ config.js
└─ README.md
```

## Functionality

1. User enters email and clicks **Subscribe**.
2. Backend validates email, blocks duplicates, and saves it to `subscribers.json`.
3. Admin creates an event.
4. Backend stores event in `events.json`.
5. Backend sends email notification to all subscribers using Gmail SMTP.

## Required npm Packages

Installed in `backend/package.json`:
- `express`
- `cors`
- `nodemailer`
- `dotenv`

## Gmail App Password Setup (Required for Email Sending)

1. Open your Google Account security settings.
2. Enable **2-Step Verification** for your Gmail account.
3. Go to **App passwords**.
4. Create an app password (Mail / Other custom name).
5. Copy the generated 16-character password.

You will use:
- `SMTP_USER` = your Gmail address
- `SMTP_APP_PASSWORD` = generated app password

## Backend Setup

From project root:

```bash
cd backend
npm install
```

Create/update `backend/.env` (already scaffolded):

```env
PORT=5000
SMTP_USER=your-gmail@gmail.com
SMTP_APP_PASSWORD=your-16-char-app-password
```

Then run:

```bash
npm start
```

Backend runs at `http://localhost:5000`.

### Development mode (auto-restart with nodemon)

```bash
npm run dev
```

### Start backend from project root

From `EAS/`:

```bash
npm run start-local
```

For auto-restart from root:

```bash
npm run dev-local
```

## Frontend Setup

`frontend/config.js` is already configured:

```js
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:5000"
};
```

Open `frontend/index.html` directly in browser, or serve it with a simple local server.

## API Integration Details

### `POST /subscribe`

Request:

```json
{
  "email": "user@example.com"
}
```

Behavior:
- Validates email format
- Rejects duplicates
- Saves to `subscribers.json`

### `POST /create-event`

Request:

```json
{
  "title": "AWS Meetup",
  "date": "2026-05-20",
  "description": "Hands-on session"
}
```

Behavior:
- Validates required fields
- Saves event in `events.json`
- Sends email notification to all subscribers (if SMTP configured)
- Returns email delivery summary

## Validation and Error Handling Included

- Email format validation
- Required field validation for event creation
- Duplicate subscriber handling (`409`)
- JSON file read/write error handling
- Email send result handling (success count vs total)
- Friendly API error responses

## How to Run Locally (End-to-End)

1. Start backend:
   - `cd backend`
   - `npm install`
   - Update `backend/.env`
   - `npm start`
2. Open `frontend/index.html`.
3. Subscribe one or more emails.
4. Create an event.
5. Check subscriber inboxes for notification emails.

## Quick API Tests

### Subscribe

```bash
curl -X POST "http://localhost:5000/subscribe" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your-email@example.com\"}"
```

### Create Event

```bash
curl -X POST "http://localhost:5000/create-event" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Cloud Bootcamp\",\"date\":\"2026-06-01\",\"description\":\"Serverless deep dive\"}"
```
