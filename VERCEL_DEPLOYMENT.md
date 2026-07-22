# ERPFlow — Deploying to Vercel Guide

This repository is pre-configured for seamless 1-click deployment on **Vercel**.

## Step-by-Step Vercel Deployment Instructions

1. **Go to Vercel Dashboard**:
   - Open [Vercel Dashboard](https://vercel.com/dashboard) and log in.

2. **Import Project**:
   - Click **Add New...** -> **Project**.
   - Select your GitHub repository: `Saisradha/FundsERP`.

3. **Configure Project Settings**:
   - **Framework Preset**: Select `Vite` or `Other`.
   - **Root Directory**: `./` (Leave as default).
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `frontend/dist`

4. **Environment Variables**:
   Add the following environment variables in Vercel settings:
   - `JWT_SECRET`: `your_super_secret_jwt_key_2026`
   - `NODE_ENV`: `production`

5. **Click Deploy**:
   - Click **Deploy**. Vercel will build the frontend static assets and backend serverless endpoints automatically!
