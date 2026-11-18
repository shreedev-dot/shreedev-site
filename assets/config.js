/* Shree Dev — site config.
   THIS IS THE ONLY FILE YOU EDIT TO GO LIVE.
   Everything else reads from here. Empty string = not configured yet. */

window.SHREEDEV = {
  // Business contact shown in the footer and on the contact page.
  // Dedicated public inbox (owner, 19 Nov 2026) — NOT a personal inbox.
  // It is public and will be scraped; do not use a personal address here.
  email: "shreedev.jaipur@yahoo.com",
  phone: "",            // e.g. "+91 98XXX XXXXX"  (display only)
  whatsapp: "",         // digits only, e.g. "9198XXXXXXXX"

  // Where the "Start a project" form posts.
  // Leave empty until Supabase (or any endpoint) exists:
  // the form saves to localStorage and shows a visible DEV banner,
  // so it can never silently pretend to have saved.
  formEndpoint: "",     // e.g. "https://xxxx.supabase.co/rest/v1/intake_submissions"
  formApiKey: "",       // Supabase anon key (public/RLS-protected only)

  // Launch scope, used in copy. Locked 19 Nov 2026: All over Rajasthan
  // (corrects Jaipur-only). Footer reads "in Rajasthan, India".
  city: "Rajasthan",
  cityRegion: "India"
};
