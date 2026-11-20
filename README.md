# Moonlit 🌙 - dating app with a Node.js, Express and Supabase back end

Moonlit connects strangers. The React front end you already had now talks to a real back end:

- **Registration and login** (passwords are hashed, logins use a signed token)
- **Saving user information** in Supabase (profile, interests, swipes, matches, messages)
- **Database connection** with Supabase (PostgreSQL) through `@supabase/supabase-js`
- **Processing app requests** through a REST API under `/api`

One server does everything: it serves the website **and** the API, so there is nothing else to start.

---

## How to run it (Windows, step by step)

### Step 1. Install Node.js
Download the **LTS** version from https://nodejs.org and install it. Then open a new terminal and check:

```
node -v
```

You should see a version number such as `v22.x.x`.

### Step 2. Create your Supabase project (free)
1. Go to https://supabase.com, sign up, and click **New project**. Choose a name (for example `moonlit`), set a **database password** (write it down) and pick the region closest to you. Wait about a minute while it is created.
2. In the left menu open **SQL Editor** -> **New query**. Open the file `supabase/schema.sql` from this project, copy everything, paste it into the editor and click **Run**. You should see "Success". This creates the 4 tables (`users`, `swipes`, `matches`, `messages`).
3. Open **Project Settings -> API** (in newer dashboards: **Settings -> API Keys**). You need two values:
   - **Project URL**, like `https://abcdxyz.supabase.co`
   - the secret **service_role** key (click "Reveal"). In the newer dashboard this is the **secret** key.

   The service_role key is a master key. It lives only in your `.env` file on the server. Never put it in the front end or on GitHub.

### Step 3. Open the project
1. Unzip `moonlit-backend.zip`. You get a folder called `moonlit`.
2. Open VS Code -> **File -> Open Folder** -> choose `moonlit`.
3. Open the terminal: **Terminal -> New Terminal**.

### Step 4. Install the packages
```
npm install
```

### Step 5. Create your settings file
In the terminal:
```
copy .env.example .env
```
(Mac/Linux: `cp .env.example .env`)

Open the new `.env` file and set:

- `SUPABASE_URL` = the Project URL from Step 2.
- `SUPABASE_SERVICE_ROLE_KEY` = the service_role (secret) key from Step 2.
- `JWT_SECRET` = a long random text. Make one with:
  ```
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
  Copy the output and paste it after `JWT_SECRET=`.

### Step 6. Start the app
```
npm run dev
```
You should see:
```
[db] Connected to Supabase
[seed] Added 8 demo people
Moonlit is running:  http://localhost:5000
```
Open **http://localhost:5000** in Chrome. Sign up, swipe right on a few people, and chat.

To stop the server press `Ctrl + C`.

### Try it on your phone
Phone and laptop on the same Wi-Fi. Find your laptop IP with `ipconfig` (for example `192.168.1.20`), then open `http://192.168.1.20:5000` on the phone. If it does not load, allow Node.js through Windows Firewall when Windows asks.

---

## Common problems

| Message | What to do |
|---|---|
| `Could not use your Supabase database` + "tables are missing" | Run `supabase/schema.sql` in the Supabase SQL Editor (Step 2). |
| `Could not use your Supabase database` + "Invalid API key" | Check `SUPABASE_URL` and that you pasted the **service_role** key, not the anon key. |
| Supabase project "paused" | Free projects pause after a week with no use. Open the dashboard and click **Restore**. |
| `EADDRINUSE: port 5000 already in use` | Change `PORT=5001` in `.env`, then open `http://localhost:5001`. |
| `'npm' is not recognized` | Install Node.js (Step 1), then close and reopen the terminal. |
| Page opens but is blank | Check you are online (React loads from the internet), then press `Ctrl + Shift + R`. |
| "Your session has expired" | You changed `JWT_SECRET` or restarted without one. Just log in again. |

---

## Project structure

```
moonlit/
  package.json          scripts and packages
  .env.example          copy to .env and fill in
  server/
    index.js            starts everything (database, demo people, web server)
    app.js              Express setup: security, rate limits, routes, static files
    config.js           reads .env
    db.js               Supabase connection (supabase-js)
    seed.js             the 8 demo people
    routes/             auth, users, discover (swipes), matches (chat)
    middleware/         auth.js (login check), errors.js (clean error replies)
    utils/              validate.js (input checks), serialize.js (what we send out)
  client/
    app.jsx             the React app (edit this one)
    build.js            turns app.jsx into public/app.js
  public/               what the browser loads: index.html, styles.css, app.js, images
  supabase/schema.sql   the database tables: run this once in the Supabase SQL Editor
  test/api.test.js      automated tests for the API
```

**Editing the front end:** change `client/app.jsx`. While `npm run dev` is running it rebuilds `public/app.js` automatically. Do not edit `public/app.js` by hand.

---

## The database (Supabase tables)

| Table | What it stores |
|---|---|
| `users` | name, email, hashed password, age, city, bio, interests |
| `swipes` | who liked or passed on whom (one per pair) |
| `matches` | two people who liked each other (`user_a`, `user_b`) |
| `messages` | chat messages inside a match |

Ids are UUIDs. Deleting a user automatically deletes their swipes, matches and messages. You can look at the data any time in Supabase -> **Table Editor**.

**Why the server uses the service_role key:** the browser only talks to this Express server, and the server does the login checks. All four tables have Row Level Security turned on with no policies, so Supabase's public `anon` key cannot read or change anything. Only your server (with the secret key) can.

---

## API reference

All routes start with `/api`. Routes marked 🔒 need the header `Authorization: Bearer <token>` (the front end does this for you).

| Method | Route | What it does |
|---|---|---|
| POST | `/auth/register` | Create an account. Body: `name, email, password, age, city, interests[]`. Returns `token` and `user`. |
| POST | `/auth/login` | Log in. Body: `email, password`. Returns `token` and `user`. |
| GET | `/auth/me` 🔒 | The logged-in user. |
| PUT | `/users/me` 🔒 | Edit profile: `name, age, city, bio, interests[]`. |
| DELETE | `/users/me` 🔒 | Delete account and all its data. Body: `password`. |
| GET | `/discover` 🔒 | Up to 20 people you have not swiped on (most shared interests first). |
| POST | `/swipes` 🔒 | Body: `userId, action` (`like` or `pass`). Returns `matched` and, if true, `matchId` and `person`. |
| POST | `/swipes/reset` 🔒 | Start the demo people over. |
| GET | `/matches` 🔒 | Your matches (with last message) and the people you liked who have not answered. |
| GET | `/matches/:id/messages?after=<ms>` 🔒 | Messages in a match; `after` returns only newer ones. |
| POST | `/matches/:id/messages` 🔒 | Send a message. Body: `text`. |
| GET | `/health` | Is the server and database up? |

---

## How the security works

- Passwords are hashed with **bcrypt**. The real password is never stored and never sent back.
- Login gives a **JWT token** (valid 7 days). The server checks it on every protected request.
- Every input is checked on the server (18+ rule, email format, length limits, allowed interests). Values must be real text and numbers, and Supabase sends them to Postgres as parameters, so SQL injection is not possible.
- Wrong email and wrong password give the **same** message, so nobody can find out which emails have accounts.
- Only people in a match can read or write its chat.
- Other people's profiles never include email or password data.
- **helmet** adds safe HTTP headers, and **rate limiting** slows password guessing and spam.
- `.env` is in `.gitignore`, so your Supabase key and secret never go to GitHub.

---

## Tests

The tests **erase all rows** in the four tables, so never point them at your real project. Create a second free Supabase project just for testing, run `supabase/schema.sql` in it, and add to `.env`:
```
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_SERVICE_ROLE_KEY=the-test-project-service-role-key
```
Then:
```
npm test
```
It runs 19 checks (registration, login, token checks, swipes, matches, chat, privacy, account deletion).

---

## Putting it online later

1. Push the project to GitHub (`.env` stays out because of `.gitignore`).
2. Create a Web Service on Render, Railway or similar. Build command `npm install`, start command `npm start`.
3. Add the environment variables `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` and `NODE_ENV=production` in the host's settings.
4. Nothing to allow-list: Supabase is reachable from any host.

---

## What to build next

1. **Real-time chat** with Socket.IO instead of checking every 3 seconds.
2. **Photo upload** (Cloudinary or S3) in place of the emoji avatars.
3. **Report and block** users, plus email verification and password reset.
4. **Distance and age filters** in `/discover`.
5. Move the front end to **Vite + React** when you want a bigger app.
