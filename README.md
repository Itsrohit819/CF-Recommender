# 📊 CF Recommender

A web-based platform that provides **smart Codeforces problem recommendations** based on your profile, submissions, and problem tags.
Live Demo → [cf-ka65.onrender.com](https://cf-ka65.onrender.com/)

---

## 🚀 Features

* 🔍 **Profile Analysis** – Enter your Codeforces username and get detailed insights.
* 📈 **Rating Analytics** – Interactive charts (Chart.js & Recharts) for rating progress.
* 🏷️ **Tag Strengths/Weaknesses** – Breakdown of problem tags you’re good at and those you need to improve.
* 🤖 **Smart Recommendations** – Personalized problem recommendations to practice next.
* 🎨 **Modern UI** – Smooth animations with **Framer Motion** and a clean React-based interface.

---

## 🛠️ Tech Stack

**Frontend**

* ⚛️ React 18 (CRA)
* 📊 Chart.js & Recharts (for analytics)
* 🎭 Framer Motion (animations)
* 📡 Axios (API requests)
* 🎨 Lucide Icons (UI icons)

**Deployment**

* 🌐 Hosted on [Render](https://render.com/)
* Build output served from `frontend/build`

---

## 📂 Project Structure

```
CF-Recommender/
├── frontend/                # React frontend
│   ├── src/                 # Components, pages, utils
│   ├── public/              # Static assets
│   ├── package.json         # Dependencies & scripts
│   └── ...
└── README.md
```

---

## ⚙️ Installation & Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/Divyanshu6928/CF.git
   cd CF/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run locally**

   ```bash
   npm start
   ```

   App will be available at: `http://localhost:3000`

4. **Build for production**

   ```bash
   npm run build
   ```

   This will generate a `build/` folder inside `frontend/`.

---

## 🚀 Deployment on Render

* **Build Command**:

  ```bash
  cd frontend && npm install && npm run build
  ```
* **Publish Directory**:

  ```
  frontend/build
  ```

---

## 📊 Usage

1. Open the app → [cf-ka65.onrender.com](https://cf-ka65.onrender.com/)
2. Enter your **Codeforces username**.
3. Explore:

   * Rating graph
   * Solved problems by tag
   * Recommended problems to practice next

---

## 🤝 Contributing

Contributions are welcome!

* Fork the repo
* Create a feature branch
* Submit a pull request 🚀

---
