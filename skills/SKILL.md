---
name: architecture-diagram
description: 'Generate self-contained HTML architecture diagrams using the Contoso design system. Use when: creating architecture diagrams, system topology visuals, cost breakdowns, capacity plans, infrastructure layouts, flow diagrams, or any technical documentation that needs a polished visual HTML artifact. Triggers: architecture, diagram, visual, topology, flow, layout, infrastructure map.'
argument-hint: 'Describe the architecture or system you want to visualize'
---

# Architecture Diagram Generator

Generate self-contained, single-file HTML architecture diagrams using the Contoso design system. Every output is a standalone `.html` file with all styles inlined — no external dependencies.

## When to Use

- Creating architecture diagrams for Azure or cloud infrastructure
- Visualizing system topology, data flows, or service interactions
- Building cost breakdown or capacity analysis visuals
- Documenting multi-region, multi-service deployments
- Any technical diagram that needs a polished, presentation-ready HTML artifact

## Design System Reference

### Color Palette (CSS Custom Properties)

Always define these CSS custom properties in `:root`. This is the canonical color system — use semantic variable names, never hardcode hex values in components.

```css
:root {
  --azure: #0078D4;        /* Primary brand — headers, default card borders, links */
  --azure-dk: #005A9E;     /* Dark accent — section headers, header text */
  --azure-lt: #DEECF9;     /* Light fill — Azure-themed card backgrounds */
  --cyan: #50E6FF;         /* Accent — highlights, decorative elements */
  --green: #107C10;        /* Success / PTU / upgrades / positive metrics */
  --green-lt: #E6F4E6;     /* Light green fill — success banners, PTU cards */
  --orange: #FF8C00;       /* Warning / caution — rate limits, alert items */
  --orange-lt: #FFF4E5;    /* Light orange fill — warning banners */
  --purple: #5C2D91;       /* Orchestration / change indicators */
  --purple-lt: #F0E6FA;    /* Light purple fill — change banners */
  --gold: #FFB900;         /* Client / user-facing — cost metrics, client nodes */
  --gold-lt: #FFF8E1;      /* Light gold fill — client cards */
  --red: #D13438;          /* Critical / risk / error — risk badges, critical metrics */
  --red-lt: #FDE7E9;       /* Light red fill — error banners */
  --teal: #008272;         /* Networking / search — Front Door, AI Search, edge */
  --teal-lt: #E0F7F4;      /* Light teal fill — network cards */
  --gray: #505050;         /* Neutral text, secondary elements */
  --gray-lt: #F2F2F2;      /* Background fill for neutral areas */
  --shadow: 0 2px 8px rgba(0,0,0,.12);  /* Standard card shadow */
}
```

### Color Semantics — When to Use Each Color

| Color | Use For | Examples |
|-------|---------|---------|
| `--azure` | Default / primary / Azure services | APIM, generic cards, section lines |
| `--green` | Success, PTU, upgrades, positive outcomes | PTU badges, success banners, upgraded items |
| `--orange` | Warnings, rate limits, caution | Content Safety, Service Bus, rate warnings |
| `--purple` | Orchestration, change deltas, coordination | Session Orchestrator, change banners |
| `--gold` | Client-facing, cost, user elements | Browser clients, cost metrics |
| `--red` | Critical risk, errors, failures | Risk badges, critical metrics, Redis |
| `--teal` | Networking, search, global edge | Front Door, AI Search, edge services |

### Typography

```css
body {
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #F4F6F8;
  color: #1A1A1A;
}
```

Font sizes follow a strict scale:
- Page title (`h1`): `21px`, `font-weight: 600`, color `var(--azure-dk)`
- Section headers (`h2`): `16px`, `font-weight: 700`, color `var(--azure-dk)`
- Panel headers (`h3`): `14px`, `font-weight: 700`
- Card names: `12px`, `font-weight: 700`
- Card detail text: `10-11px`, color `#666`
- Card resource tags: `10px`, `font-weight: 600`, colored by category
- Metric values: `24px`, `font-weight: 700`
- Metric labels: `10px`, `font-weight: 600`, uppercase, `letter-spacing: .4px`
- Metric sublabels: `9px`, color `#AAA`
- Badges: `9px`, `font-weight: 700`
- Footer: `10px`, color `#AAA`
- Code inline: `font-family: 'Cascadia Code', Consolas, monospace; font-size: 9px; background: #EEE; padding: 1px 3px; border-radius: 2px;`

### Global Reset

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { overflow-x: auto; }
.page { padding: 28px 36px; min-width: 1580px; }
```

## Component Library

### 1. Header

The page header with logo tile and title/subtitle.

```html
<div class="header">
  <div class="header-logo">C</div>  <!-- Single character logo in azure square -->
  <div>
    <h1>Page Title — Subtitle</h1>
    <div class="sub">Descriptor • Descriptor • Descriptor</div>
  </div>
</div>
```

```css
.header { display: flex; align-items: center; gap: 16px; margin-bottom: 10px; }
.header-logo { width: 44px; height: 44px; background: var(--azure); border-radius: 10px;
  display: flex; align-items: center; justify-content: center; color: #fff;
  font-size: 22px; font-weight: 700; }
.header h1 { font-size: 21px; font-weight: 600; color: var(--azure-dk); }
.header .sub { font-size: 12px; color: #888; margin-top: 2px; }
```

### 2. Banner

Full-width callout banner for key messages. Use `.green` for positive/success, `.purple` for change/delta info.

```html
<div class="banner green">
  <div class="banner-icon green">✓</div>
  <div class="banner-body">
    <h2>Banner Title</h2>
    <p>Descriptive text with <strong>bold highlights</strong> for key data points.</p>
  </div>
</div>
```

```css
.banner { margin: 14px 0 12px; border-radius: 10px; padding: 16px 24px;
  display: flex; align-items: center; gap: 16px; }
.banner.green  { background: var(--green-lt); border: 2px solid var(--green); }
.banner.purple { background: var(--purple-lt); border: 2px solid var(--purple); }
.banner-icon { width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 26px; flex-shrink: 0; }
.banner-icon.green  { background: var(--green); }
.banner-icon.purple { background: var(--purple); }
.banner-body h2 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.banner.green .banner-body h2  { color: var(--green); }
.banner.purple .banner-body h2 { color: var(--purple); }
.banner-body p { font-size: 12px; color: #555; line-height: 1.5; }
```

### 3. Metric Tiles Row

Horizontal row of KPI tiles with colored top borders. Each tile shows a value, label, and optional sublabel.

```html
<div class="metrics-row">
  <div class="metric-tile green">
    <div class="metric-val">5,400+</div>
    <div class="metric-label">Max Concurrent</div>
    <div class="metric-sub">with 8% headroom</div>
  </div>
  <!-- Add color classes: green, teal, purple, orange, red, gold, or none for azure -->
</div>
```

```css
.metrics-row { display: flex; gap: 12px; margin-bottom: 20px; }
.metric-tile { flex: 1; background: #fff; border-radius: 10px; padding: 14px 16px;
  box-shadow: var(--shadow); text-align: center; border-top: 4px solid var(--azure); }
.metric-tile.green  { border-top-color: var(--green); }
.metric-tile.teal   { border-top-color: var(--teal); }
.metric-tile.purple { border-top-color: var(--purple); }
.metric-tile.orange { border-top-color: var(--orange); }
.metric-tile.red    { border-top-color: var(--red); }
.metric-tile.gold   { border-top-color: var(--gold); }
.metric-val { font-size: 24px; font-weight: 700; line-height: 1.1; }
/* Color the value text to match the tile's border color */
.metric-tile .metric-val        { color: var(--azure-dk); }
.metric-tile.green .metric-val  { color: var(--green); }
.metric-tile.teal .metric-val   { color: var(--teal); }
.metric-tile.purple .metric-val { color: var(--purple); }
.metric-tile.orange .metric-val { color: var(--orange); }
.metric-tile.red .metric-val    { color: var(--red); }
.metric-tile.gold .metric-val   { color: #8A6500; }
.metric-label { font-size: 10px; color: #888; margin-top: 3px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .4px; }
.metric-sub { font-size: 9px; color: #AAA; margin-top: 2px; }
```

### 4. Section Header

Divider between major sections with title and extending horizontal line.

```html
<div class="section-header">
  <h2>🏗️ Section Title</h2>
  <div class="line"></div>
</div>
```

```css
.section-header { display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px; margin-top: 28px; }
.section-header h2 { font-size: 16px; font-weight: 700; color: var(--azure-dk);
  white-space: nowrap; }
.section-header .line { flex: 1; height: 1px; background: #D2D2D2; }
```

### 5. Service Card

The primary building block. Each card represents a service, component, or resource. Left-colored border indicates category.

```html
<div class="card green">
  <div class="card-row">
    <div class="card-icon">📦</div>
    <div class="card-body">
      <div class="card-name">Service Name</div>
      <div class="card-res">SKU / Tier</div>
      <div class="card-det">Detail line 1<br>Detail line 2<br>Detail with <code>inline code</code></div>
      <div class="up-badge ptu">★ BADGE LABEL</div>
    </div>
  </div>
</div>
```

```css
.card { background: #fff; border-radius: 8px; padding: 12px 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08); border-left: 3px solid var(--azure);
  transition: transform .12s; font-size: 11px; }
.card:hover { transform: translateX(2px); box-shadow: 0 2px 8px rgba(0,0,0,.14); }
.card.green  { border-left-color: var(--green); }
.card.orange { border-left-color: var(--orange); }
.card.purple { border-left-color: var(--purple); }
.card.gold   { border-left-color: var(--gold); }
.card.teal   { border-left-color: var(--teal); }
.card.red    { border-left-color: var(--red); }
.card-row { display: flex; align-items: center; gap: 8px; }
.card-icon { font-size: 18px; flex-shrink: 0; }
.card-body { flex: 1; }
.card-name { font-weight: 700; font-size: 12px; color: #1A1A1A; }
.card-res  { font-size: 10px; color: var(--azure); font-weight: 600; }
.card-det  { font-size: 10px; color: #666; line-height: 1.4; margin-top: 2px; }
```

### 6. Badges

Small inline labels for status, upgrades, versions, or risk indicators.

```html
<div class="up-badge ptu">★ PTU — DEDICATED</div>
<div class="up-badge gs">GLOBALSTANDARD</div>
<div class="up-badge risk">⚠ CRITICAL</div>
<div class="up-badge new">NEW</div>
<div class="up-badge v4">V4 CHANGE</div>
```

```css
.up-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 9px;
  font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-top: 4px;
  letter-spacing: .3px; }
.up-badge.upgraded { background: var(--green); color: #fff; }
.up-badge.new      { background: var(--teal); color: #fff; }
.up-badge.v4       { background: var(--green); color: #fff; }
.up-badge.v3       { background: var(--purple); color: #fff; }
.up-badge.ptu      { background: var(--green); color: #fff; }
.up-badge.gs       { background: var(--azure); color: #fff; }
.up-badge.risk     { background: var(--red); color: #fff; }
```

### 7. Diff Row (Before → After)

Show changes between versions with strikethrough-to-new pattern.

```html
<div class="diff-row">
  <span class="diff-before">Old Value ($53,655/mo)</span>
  <span class="diff-arrow">→</span>
  <span class="diff-after">New Value ($8,000/mo)</span>
</div>
```

```css
.diff-row { display: flex; align-items: center; gap: 6px; font-size: 10px; margin-top: 3px; }
.diff-before { color: var(--red); text-decoration: line-through; font-weight: 600; }
.diff-arrow { color: #999; }
.diff-after { color: var(--green); font-weight: 700; }
```

### 8. Tier Labels

Colored category headers for grouping cards in a flow.

```html
<div class="tier-label compute">COMPUTE</div>
<div class="tier-label ai">AI SERVICES</div>
<div class="tier-label orch">ORCHESTRATION</div>
<div class="tier-label network">NETWORKING</div>
<div class="tier-label safety">SAFETY</div>
```

```css
.tier-label { font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; color: #fff;
  text-align: center; margin-bottom: 8px; }
.tier-label.compute  { background: var(--green); }
.tier-label.ai       { background: var(--azure); }
.tier-label.orch     { background: var(--purple); }
.tier-label.network  { background: var(--teal); }
.tier-label.safety   { background: var(--orange); }
```

### 9. Horizontal Flow (Architecture Layout)

Primary layout for end-to-end architecture. Services flow left-to-right connected by arrows.

```html
<div class="h-flow">
  <div class="col" style="min-width:140px;">
    <div class="tier-label compute">LABEL</div>
    <div class="card green"><!-- card content --></div>
  </div>

  <div class="arrow-col">
    <div class="arrow-line"><div class="line"></div><span class="head">→</span></div>
    <div class="arrow-label">Protocol<br>detail</div>
  </div>

  <div class="col" style="min-width:170px;">
    <div class="tier-label network">NEXT TIER</div>
    <div class="card teal"><!-- card content --></div>
  </div>
  <!-- Continue pattern: col → arrow-col → col → arrow-col → col -->
</div>
```

```css
.h-flow { display: flex; align-items: stretch; gap: 0; }
.arrow-col { display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-width: 58px; gap: 3px; padding-top: 20px; }
.arrow-line { display: flex; align-items: center; gap: 3px; white-space: nowrap; }
.arrow-line .line { width: 24px; height: 0; border-top: 2px solid var(--azure); }
.arrow-line .head { font-size: 14px; color: var(--azure); line-height: 1; }
.arrow-label { font-size: 8px; color: #888; text-align: center; line-height: 1.2; max-width: 70px; }
```

### 10. Region Box

Dashed or solid border container grouping per-region services. Use inside the horizontal flow.

```html
<div style="border:2px solid var(--azure);border-radius:14px;padding:22px 16px 16px;
  background:rgba(0,120,212,.03);position:relative;">
  <div style="position:absolute;top:-12px;left:18px;background:var(--azure);color:#fff;
    font-size:10px;font-weight:700;padding:3px 14px;border-radius:4px;letter-spacing:.8px;">
    REGION: East US 2 / West US 3 / Central US
  </div>
  <!-- Cards and flows inside -->
</div>
```

### 11. WebSocket / Flow Chain

Horizontal chain of styled nodes connected by arrows. Use for showing data flow, request paths, or processing pipelines.

```html
<div class="ws-section">
  <h3>🔌 Flow Title</h3>
  <div class="ws-chain">
    <div class="ws-node client">
      <div class="ws-node-name">Node Name</div>
      <div class="ws-node-det">Detail line<br>Detail line</div>
      <div class="ws-node-count orange">5,000</div>
    </div>
    <div class="ws-arrow">
      <span class="ws-arrow-head">→</span>
      <div class="ws-arrow-line"></div>
      <div class="ws-arrow-label">label</div>
    </div>
    <!-- More nodes and arrows -->
  </div>
</div>
```

Node color classes: `.client` (gold), `.front` (teal), `.agent` (green), `.orch` (purple), `.filter` (orange), `.openai` (green), `.result` (green).

```css
.ws-section { margin-top: 24px; background: #fff; border-radius: 10px; padding: 20px 24px;
  box-shadow: var(--shadow); border-top: 4px solid var(--green); }
.ws-section h3 { font-size: 14px; font-weight: 700; color: var(--green);
  margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.ws-chain { display: flex; align-items: center; gap: 0; flex-wrap: nowrap;
  overflow-x: auto; padding: 8px 0; }
.ws-node { border-radius: 8px; padding: 12px 16px; font-size: 11px; font-weight: 600;
  text-align: center; white-space: nowrap; flex-shrink: 0; min-width: 140px;
  box-shadow: var(--shadow); }
.ws-node.client { background: var(--gold-lt); border: 2px solid var(--gold); color: #8A6500; }
.ws-node.front  { background: var(--teal-lt); border: 2px solid var(--teal); color: var(--teal); }
.ws-node.agent  { background: var(--green-lt); border: 2px solid var(--green); color: var(--green); }
.ws-node.orch   { background: var(--purple-lt); border: 2px solid var(--purple); color: var(--purple); }
.ws-node.filter { background: var(--orange-lt); border: 2px solid var(--orange); color: #B86200; }
.ws-node.openai { background: var(--green-lt); border: 3px solid var(--green); color: var(--green); }
.ws-node.result { background: var(--green-lt); border: 2px solid var(--green); color: var(--green); }
.ws-node-name { font-size: 12px; font-weight: 700; margin-bottom: 3px; }
.ws-node-det { font-size: 10px; font-weight: 400; color: #666; }
.ws-node-count { font-size: 18px; font-weight: 700; margin-top: 4px; }
.ws-arrow { display: flex; flex-direction: column; align-items: center; padding: 0 4px; flex-shrink: 0; }
.ws-arrow-line { width: 30px; height: 0; border-top: 2px solid var(--green); }
.ws-arrow-head { font-size: 14px; color: var(--green); line-height: 1; }
.ws-arrow-label { font-size: 9px; color: #888; white-space: nowrap; margin-top: 2px; }
```

### 12. Subscription / Isolation Blocks

Grid of blocks showing account/subscription isolation patterns.

```html
<div class="sub-isolation">
  <div class="sub-block">
    <div class="sub-header sub1">Subscription 1 → Account 1</div>
    <div class="sub-body">
      <div class="deploy-slot ptu-slot">
        <span class="slot-name">deployment-name</span>
        <span class="slot-model">PTU</span>
        <span class="slot-rate">30/min</span>
      </div>
      <!-- More slots -->
    </div>
  </div>
</div>
```

```css
.sub-isolation { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
.sub-block { flex: 1; min-width: 200px; background: #fff; border-radius: 10px;
  box-shadow: var(--shadow); overflow: hidden; }
.sub-header { padding: 10px 14px; font-size: 11px; font-weight: 700; color: #fff;
  letter-spacing: .3px; }
.sub-header.sub1 { background: var(--azure-dk); }
.sub-header.sub2 { background: #1A6BB5; }
.sub-header.sub3 { background: #2B82CE; }
.sub-header.sub4 { background: #3C99E0; }
.sub-body { padding: 12px 14px; }
.deploy-slot { background: var(--azure-lt); border: 1px solid #C0D6EC; border-radius: 5px;
  padding: 5px 10px; margin-bottom: 4px; font-size: 10px;
  display: flex; align-items: center; justify-content: space-between; }
.deploy-slot.ptu-slot { background: var(--green-lt); border-color: var(--green); }
.deploy-slot .slot-name { font-weight: 600; color: #444; }
.deploy-slot .slot-model { font-size: 9px; color: var(--azure); font-weight: 700; }
.deploy-slot.ptu-slot .slot-model { color: var(--green); }
.deploy-slot .slot-rate { font-size: 9px; color: var(--orange); font-weight: 700; }
```

### 13. Changes / Cost Panel (Side-by-Side)

Two-column layout for showing what changed and the cost impact.

```html
<div class="changes-section">
  <div class="changes-panel v4">
    <h3>✓ What Changed</h3>
    <div class="change-item">
      <div class="change-num green">1</div>
      <div><strong>Title:</strong> Description of the change.</div>
    </div>
  </div>
  <div class="changes-panel cost">
    <h3>💰 Cost Impact</h3>
    <div class="change-item">
      <div class="change-num azure">$</div>
      <div><strong>Line item:</strong> Cost detail</div>
    </div>
  </div>
</div>
```

```css
.changes-section { display: flex; gap: 20px; margin-bottom: 24px; }
.changes-panel { flex: 1; background: #fff; border-radius: 10px; padding: 20px 24px;
  box-shadow: var(--shadow); }
.changes-panel.v4 { border-top: 4px solid var(--green); }
.changes-panel.v4 h3 { color: var(--green); }
.changes-panel.cost { border-top: 4px solid var(--azure); }
.changes-panel.cost h3 { color: var(--azure); }
.change-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0;
  border-bottom: 1px solid #F0F0F0; font-size: 12px; line-height: 1.5; color: #333; }
.change-item:last-child { border-bottom: none; }
.change-num { width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; }
.change-num.green { background: var(--green); }
.change-num.azure { background: var(--azure); }
```

### 14. Footer

Standard disclaimer and branding footer.

```html
<div class="footer">
  <p class="disclaimer">Disclaimer text — pricing, assumptions, caveats.</p>
  <br>
  Project Name — Document Title • Key Descriptors • Organization
</div>
```

```css
.footer { margin-top: 28px; text-align: center; font-size: 10px; color: #AAA;
  padding-bottom: 16px; line-height: 1.6; }
.footer .disclaimer { font-style: italic; max-width: 900px; margin: 0 auto; }
```

## Procedure

1. **Start with the HTML boilerplate**: `<!DOCTYPE html>`, charset, viewport meta, `<title>`
2. **Define all CSS in a single `<style>` block** in `<head>` — no external stylesheets
3. **Include `:root` variables first**, then global reset, then all component classes
4. **Build the page structure** inside `<div class="page">`:
   - Header (always)
   - Banners (1-2 for key messages)
   - Metrics row (5-8 KPI tiles)
   - Section headers between major sections
   - Horizontal flow for architecture topology
   - Additional sections as needed (isolation blocks, flow chains, changes panels)
   - Footer (always)
5. **Use emoji icons** in cards (`🌐 🧠 📦 🔍 🛡️ 🔌 🔑 💬 ⚡ 🎯 🖥️ 🌍 📬`) — they work cross-platform and keep the file self-contained
6. **Output a single `.html` file** in the `docs/` folder

## Design Principles

- **Self-contained**: Zero external dependencies. All CSS inline. No JavaScript required for static diagrams.
- **Information-dense**: Pack meaningful data into every component. Cards show service name, SKU, config details, and status badges.
- **Scannable hierarchy**: Banners → Metrics → Architecture flow → Detail sections → Footer. A reader gets the story at each level.
- **Color = meaning**: Never use color decoratively. Every color maps to a semantic category (see Color Semantics table).
- **Hover feedback**: Cards shift right 2px on hover for interactive feel.
- **Min-width layout**: Use `min-width: 1580px` on `.page` for consistent wide-format rendering. These are reference diagrams, not responsive web apps.
- **Version awareness**: When showing changes between versions, use diff-rows and change panels to make deltas explicit.
