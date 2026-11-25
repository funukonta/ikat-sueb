# Ikat App
 
 ## Files
 - Code.gs: reads and writes the sheet: list sessions, open one session, save a step.
 - Index.html: the mobile screens, built to match the Figma design.
 - appsscript.json: sets the Jakarta timezone and publishes the app to anyone with the link.

 ## How it works
 - + opens "step 1" for a new session. The new tab (sesi 20-september-2026) is only created
   when the first step is saved, so a session you cancel leaves no empty tab. A second
   session on the same day gets " (2)" added to its name.
 - next saves one row (Step | Jumlah Ikat | Berat (kg) | Waktu) and moves to step X + 1,
   with no limit.
 - finish saves the current step if a weight is filled in, then goes back to the list. The
   new session shows a "Baru" badge.
 - Tapping an existing session continues it at the next step number.
 - Tabs whose names don't start with sesi  are ignored.

 ## To install:
 1. Create new Sheet, In the sheet, open Extensions → Apps Script.
 2. Paste Code.gs over the default code.
 3. Add an HTML file named Index and paste Index.html into it.
 4. In Project Settings, turn on "Show appsscript.json", then paste appsscript.json.
 5. Deploy → New deployment → Web app, with Execute as: Me and Who has access: Anyone.
    Authorize when asked, then open the URL on your phone.
