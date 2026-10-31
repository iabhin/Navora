# Navora Overseas Education

A single-page enquiry desk. A student fills in the hero form. The page opens WhatsApp to **+91 82817 18626** with the enquiry already written, and posts the same details into the admissions spreadsheet.

Spreadsheet: [Navora admissions sheet](https://docs.google.com/spreadsheets/d/1kORq_GdTGKmle2pjRyBWx43umELZl8PFTBXGIHgsQqE/edit?gid=0#gid=0)

## Run it

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:8741](http://127.0.0.1:8741).

`npm run build` writes a static site to `dist/` (the page plus the logo). Host that folder anywhere that serves static files.

## Put it on your Git host, then Vercel

This project does not have your repository yet. In Cursor, click the **Create repo** pill and choose the GitHub account or organization that should own it. That copies this project, including `main`, into that repository.

Then import it on Vercel:

1. Open [vercel.com/new](https://vercel.com/new) and authorize the same Git host if Vercel asks.
2. Import the repository you just created.
3. Deploy. `vercel.json` already sets the framework to Vite, the build to `npm run build`, and the output to `dist`. Leave those as they are.
4. Each push to `main` publishes a new deployment.

Paste the Apps Script `/exec` URL into `sheetWebAppUrl` in `index.html` and push before you rely on the live site to file rows. WhatsApp works on the deployed site either way.

## Connect the Google Sheet

The spreadsheet is private, so a browser cannot write to it until you publish a small script that runs as you. Do this once:

1. Open the [spreadsheet](https://docs.google.com/spreadsheets/d/1kORq_GdTGKmle2pjRyBWx43umELZl8PFTBXGIHgsQqE/edit?gid=0#gid=0).
2. **Extensions → Apps Script**. Delete the placeholder and paste in `apps-script/Code.gs`.
3. In the spreadsheet, set **File → Settings → Time zone** to `(GMT+05:30) India`.
4. **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the web app URL (it ends in `/exec`).
6. Paste it into `sheetWebAppUrl` near the top of the script in `index.html`.
7. Restart the dev server, or rebuild.

Leave the first sheet empty, or give row 1 these headers:

`Timestamp (IST)`, `Name`, `Phone`, `Email`, `City`, `Country`, `Intake`, `Course`, `Message`, `Source`

An empty sheet gets that header row on the first enquiry. Rows are appended to the tab with `gid=0`. The phone column is stored as text.

Anyone who can read the website source can post a row to that web app URL. They cannot edit the rest of the spreadsheet. That is the usual tradeoff for a public form with no server of its own.

WhatsApp works before this step. Until the URL is pasted in, the page does not claim that a sheet copy was saved.

## What the form sends

Name, mobile, email, city, country, intake, course, and a short note. A honeypot field is ignored when it is filled in, so simple bots do not open a chat or write a row.
