# 🚀 Deployment Guide - Lumina Market

This guide explains how to deploy the **Lumina Market Backend** to [Render.com](https://render.com) and the **Frontend** to Vercel or Netlify.

---

## 📦 Prerequisites

1. **GitHub Account**: Your code must be pushed to a GitHub repository.
2. **Render Account**: Sign up at [render.com](https://render.com).
3. **MongoDB Atlas**: You need a cloud-hosted MongoDB database (e.g., MongoDB Atlas).

---

## 1️⃣ Deploying Backend to Render

### Step 1: Create New Web Service
1. Log in to your Render dashboard.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select the **Lumina Market** repository.

### Step 2: Configure Service
Fill in the following details:

| Field | Value |
|-------|-------|
| **Name** | `lumina-market-api` (or your choice) |
| **Region** | Choose the one closest to you |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `.` (Keep this as `.` or empty) |
| **Runtime** | **Node** |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

> **Important:** Do **NOT** set Root Directory to `server`. Your `package.json` is in the main folder, so Render needs to build from the root to find dependencies.

### Step 3: Environment Variables
Scroll down to **Environment Variables** and add the following:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Optimizes for production |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-secret-key` | A long, random string for security |
| `GEMINI_API_KEY` | `AIza...` | Your Google Gemini API Key |
| `CLIENT_URL` | `https://lumina-market.vercel.app` | **Updated:** Your specific frontend URL |

### Step 4: Deploy
Click **Create Web Service**. Render will start building and deploying your backend.
Your backend URL is: `https://luminamarket.onrender.com`

---

## 2️⃣ Deploying Frontend (Vercel)

### Step 1: Configure Environment Variables
1. Go to your **Vercel Project Dashboard**.
2. Click **Settings** -> **Environment Variables**.
3. Add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://luminamarket.onrender.com/api`
   - *(Note: You MUST add `/api` at the end)*

### Step 2: Redeploy
1. Go to **Deployments**.
2. Click the three dots (`...`) on your latest deployment.
3. Select **Redeploy**.
4. This ensures the new environment variable is picked up.

---

## 3️⃣ Final Configuration (Render)

1. Go back to **Render Dashboard** -> **lumina-market-api** -> **Environment**.
2. Ensure `CLIENT_URL` is set to `https://lumina-market.vercel.app`.
3. This allows your Vercel frontend to communicate with the backend (CORS).

---

## ✅ Verification

1. Open your deployed frontend URL.
2. Try to log in or register.
3. Check if products load.
4. Verify that the browser console shows requests going to your **Render URL**, not localhost.

**Enjoy your live application!** 🚀
