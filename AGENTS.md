# AGENTS.md — Facts Archive

Static site showing sourced facts. Each reload shows a random fact.
Users can share specific facts via URL hash (e.g., `index.html#5`).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup, loads external resources in order |
| `styles.css` | All styling, responsive @ 480px |
| `facts.js` | `facts` array: `{id, text, sources[]}` |
| `app.js` | Render, random select, share URL, QR, clipboard |

## Script Loading Order (Globals)

1. QR library (`qrcode` global)
2. `facts.js` (`facts` global)
3. `app.js` (consumes both)

Keep this order. No modules.

## Key Behaviors

- **Reload** → random fact
- **Hash link** (e.g., `#5`) → specific fact
- `showFact()` uses `history.replaceState()` to update URL

## Data Format

```javascript
{
  id: 1,
  text: "Fact text...",
  sources: [{name: "Site", url: "https://..."}]
}
```

## Common Tasks

**Add fact**: Append to `facts.js` with next `id`.

**Edit styles**: Modify `styles.css` directly.

**Change init logic**: Edit `init()` in `app.js`. Uses
`performance.getEntriesByType('navigation')` to detect reloads.

**Add features**: Add HTML → JS functions → CSS. Uses globals.

## Testing

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Static files. Works on any host (GitHub Pages, Netlify, S3, etc.).
