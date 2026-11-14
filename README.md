# 🪙 Priyo SMP Auction House & Price History Tracker
> A DonutSMP-style live economy tracker, candlestick price history graphs, and flipping radar for **Priyo SMP** (`play.priyosmp.com`).

Built with **Node.js, Express, SQLite, Chart.js, Tailwind CSS**, and **Mineflayer**.

---

## 🚀 Features

- **📈 Price History Graphs:** Interactive line/area & volume graphs for items across 24h, 7d, and 30d timeframes (Minimum price, Average price, Volume).
- **🛒 Live Auction House Browser:** Search listings by item name, seller, category, or enchantments (Sharpness V, Mending, etc.), with sorting by lowest price or unit price.
- **⚡ Flipping Radar (Sniping Tool):** Algorithm comparing live listings to 7-day fair market value, instantly surfacing items listed at $\ge 15\%$ discounts for profit.
- **🤖 Headless Mineflayer Bot (`/ah` scraper):** Automatically connects to `play.priyosmp.com`, runs `/ah`, flips through chest GUI pages, parses lore & prices, and updates the database every 60 seconds.
- **🧪 Built-In Simulator Mode:** Test all graphs, charts, and snipes instantly without needing an alt Minecraft account logged in!

---

## 🛠️ Quick Start

### 1. Start the Web Dashboard & API Server
```bash
cd priyo-smp-tracker
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### 2. Run the Scraper Bot

#### Option A: Live Bot on Priyo SMP (`play.priyosmp.com`)
1. Edit `bot/config.json`:
```json
{
  "server": {
    "host": "play.priyosmp.com",
    "port": 25565
  },
  "bot": {
    "username": "YourAltAccount",
    "auth": "offline",              // or "microsoft"
    "autoLoginPassword": "your_server_password",
    "scanIntervalSeconds": 60,
    "maxPages": 10
  }
}
```
2. Start the bot:
```bash
npm run bot
```

#### Option B: Simulator / Mock Mode (Instant Test)
Generate realistic Priyo SMP market movements and scan listings without logging in a Minecraft account:
```bash
npm run bot:mock
```
*(Or click **"Scan AH Now"** directly on the web interface!)*

---

## 📁 Project Architecture

```
priyo-smp-tracker/
├── bot/
│   ├── config.json         # Server address, bot username, intervals
│   ├── scraper.js          # Mineflayer bot traversing /ah and posting data
│   └── loreParser.js       # Extracts prices, sellers, and enchants from item lore
├── server/
│   ├── db.js               # SQLite database, seed generator, and price queries
│   ├── index.js            # Express API & static web server
│   └── data/               # tracker.db (auto-created)
├── client/
│   ├── index.html          # DonutSMP-inspired dark gamer dashboard
│   ├── app.js              # Chart.js rendering, search, filters, and toasts
│   └── style.css           # Styling, glowing badges, and rarity accents
└── package.json
```

---

## 🌐 API Endpoints

- `GET /api/stats` - Total listings, market cap, and last scan timestamp.
- `GET /api/items` - List of all tracked items with 7-day stats.
- `GET /api/history?item=NAME&days=7` - Timeseries price points for Chart.js.
- `GET /api/listings?search=...&category=...&sort=cheapest` - Active AH listings.
- `GET /api/flips?minDiscount=15` - Active listings significantly below market average.
- `POST /api/ingest` - Endpoint receiving scraped listings from the bot.
