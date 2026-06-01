# Vietnam Trip Site v3

Static GitHub Pages site.

## Pages
- `index.html` - home dashboard
- `map.html` - interactive map with filters, Google Maps links, and local comments
- `itinerary.html` - itinerary generated from the CSV spreadsheet

## Deploy on GitHub Pages
1. Upload all files to your repo.
2. Go to Settings -> Pages.
3. Choose Deploy from branch.
4. Select `main` and `/root`.
5. Visit the published URL.

## Notes
- Marker comments use browser `localStorage`, so they save only for the current user/browser/device.
- Shared comments require a backend like Firebase/Supabase or a GitHub Issues-based comment system.
- Google Maps photos cannot be pulled automatically without using the Google Places API and an API key.
- Some lodging and restaurant coordinates are approximate. Use the Google Maps link in each popup to verify exact locations.
