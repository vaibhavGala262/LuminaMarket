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
| **Root Directory** | `.` (leave empty) |
| **Runtime** | **Node** |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### Step 3: Environment Variables
Scroll down to **Environment Variables** and add the following:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Optimizes for production |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-secret-key` | A long, random string for security |
| `GEMINI_API_KEY` | `AIza...` | Your Google Gemini API Key |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | URL of your deployed frontend (add this *after* deploying frontend) |

> **Note:** For `CLIENT_URL`, initially you can set it to `*` or wait until you deploy the frontend. Once the frontend is deployed, update this to the specific frontend URL for security.

### Step 4: Deploy
Click **Create Web Service**. Render will start building and deploying your backend.
Once finished, you will get a URL like `https://lumina-market-api.onrender.com`.

---

## 2️⃣ Deploying Frontend (Vercel/Netlify)

Since this is a Vite React app, it's best deployed on **Vercel** or **Netlify**.

### Option A: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign up.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. **Build Settings** should be automatically detected:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: Set this to your **Render Backend URL** (e.g., `https://lumina-market-api.onrender.com/api`)
   - *Important: Make sure to append `/api` if your backend routes are prefixed with it, or just the base URL if your api.js handles the `/api` part. In your code, `api.js` appends `/api` if it's not in the env var, or expects the env var to be the full base. Check `services/api.js`.*
   - *Correction:* Your `services/api.js` has: `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';`. So set `VITE_API_URL` to `https://lumina-market-api.onrender.com/api`.

### Option B: Netlify
1. Go to [netlify.com](https://netlify.com).
2. **Add new site** -> **Import an existing project**.
3. Connect GitHub and choose your repo.
4. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Environment Variables**:
   - Add `VITE_API_URL` with your Render backend URL (including `/api`).

---

## 3️⃣ Final Configuration

1. **Update Backend CORS**:
   - Go back to Render Dashboard -> Your Service -> Environment.
   - Update `CLIENT_URL` to match your **deployed frontend URL** (e.g., `https://lumina-market-frontend.vercel.app`).
   - This ensures only your frontend can access the API.

---

## ✅ Verification

1. Open your deployed frontend URL.
2. Try to log in or register.
3. Check if products load.
4. Verify that the browser console shows requests going to your **Render URL**, not localhost.

**Enjoy your live application!** 🚀
