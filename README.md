# 🚍 Winnipeg Transit Pulse (Frontend)

**Transit Pulse** is a modern, real-time analytics dashboard for the Winnipeg Transit network. It serves as the visual interface for exploring On-Time Performance (OTP), ridership trends, and service bottlenecks using interactive charts and geospatial maps.

Built with **Svelte** and **Vite** for lightning-fast rendering.

## ⚡ Features

* **📊 Performance Dashboard:** Real-time view of OTP scores, delay probabilities, and deviation trends.
* **🗺️ Interactive Maps:**
    * **Route Trace:** Visualizes specific route performance.
    * **Heatmaps:** Identifies "Late" vs "Early" hotspots across the city.
* **📈 Trend Analysis:** Beautiful, gradient-filled charts for historical data analysis (30-day views).
* **🌓 Adaptive UI:** Fully responsive design with built-in **Dark/Light mode**.
* **📱 Mobile Ready:** Responsive layout that works on desktop, tablets, and mobile devices.

## 🛠️ Tech Stack

* **Framework:** [Svelte](https://svelte.dev/) (via [Vite](https://vitejs.dev/))
* **Styling:** Tailwind CSS + Custom CSS Variables
* **Visualization:** Chart.js (Trends), Leaflet (Maps)
* **Icons:** Lucide-Svelte
* **State Management:** Svelte Stores

## 🚀 Getting Started

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn
* A running instance of the **Transit Pulse API** (Backend)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/HarshvardhanGadhvi/winnipeg-transit-svelte-viz.git
    cd winnipeg-transit-svelte-viz
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory to point to your backend API.
    
    ```env
    # .env
    # Point this to your backend server IP/URL
    VITE_API_BASE_URL=http://localhost:5001/api/v1
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

5.  Open your browser at `http://localhost:5173` (or the Network IP shown in the terminal).

## 📂 Project Structure

```text
src/
├── components/
│   ├── OTP/          # OTP Dashboard Widgets (Scorecards, Charts)
│   ├── Map/          # Leaflet Map Wrappers
│   ├── Passups/      # Pass-up Logic
│   └── Ridership/    # Ridership Graphs
├── stores/           # Global State (otpStore, ridershipStore)
└── App.svelte        # Main Application Layout