# Facelit treatment landing page

This is a static HTML/CSS landing page and can be deployed from the repository root on Vercel with no build command or framework preset.

## Before using for ads

- Replace the temporary link to `facelittreatments.in/#contact` with the approved lead form or booking destination.
- Add the Google Ads conversion measurement ID and verify the conversion event after the lead form is connected.
- Add the clinic-approved privacy and consent information for the new site/domain.
- Review treatment copy, images, and claims with the clinic before publishing.

The page currently reuses the existing clinic's consultation form as a temporary destination. No lead data is collected by this static page.

## Medifacials lead form

`/medifacials/` posts its form to `/api/lead` (`api/lead.js`), which emails each lead through Resend. In Vercel (Project → Settings → Environment Variables) set:

- `RESEND_API_KEY` – your Resend API key
- `LEAD_TO_EMAIL` – where leads are sent (comma-separate for several)
- `LEAD_FROM` – optional sender, e.g. `Facelit Leads <leads@yourdomain.in>` (needs a verified Resend domain; the default `onboarding@resend.dev` only delivers to the Resend account owner's email)

Redeploy after adding them. The page also pushes a `lead_form_submit` event to `dataLayer` for ad conversion tracking.
