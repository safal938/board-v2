# Google Meet Add-on Deployment Guide

## 🚨 Critical Setup Steps

### 1. Get Your Google Cloud Project Number

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **Settings** → **Project Settings**
4. Copy the **Project Number** (NOT the Project ID)

### 2. Configure Vercel Environment Variables

1. Go to your Vercel Dashboard
2. Select your project: `patientcanvas-ai`
3. Go to **Settings** → **Environment Variables**
4. Add the following environment variable:
   - **Name**: `REACT_APP_GCP_PROJECT_NUMBER`
   - **Value**: Your GCP project number from step 1
   - **Environment**: Select "Production", "Preview", and "Development"
5. Click **Save**

### 3. Deploy to Vercel

```powershell
cd d:\Office_work\EASL\demofinal\board
vercel --prod
```

### 4. Verify Deployment

After deployment, verify these URLs are accessible:

- ✅ Manifest: `https://patientcanvas-ai.vercel.app/manifest.json`
- ✅ Side Panel: `https://patientcanvas-ai.vercel.app/meet/Sidepanel`
- ✅ Main Stage: `https://patientcanvas-ai.vercel.app/meet/Mainstage`

### 5. Configure Google Meet Add-on

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Google Workspace Add-ons API**
3. Go to **Google Workspace Add-ons** → **Meet**
4. Create a new add-on:
   - **Add-on Name**: MedForce AI - Patient canvas
   - **Manifest URL**: `https://patientcanvas-ai.vercel.app/manifest.json`
5. Save and deploy

## 🔍 Troubleshooting

### "Add-on could not open" Error

This usually means one of these issues:

1. **GCP Project Number not set**: Check Vercel environment variables
2. **URL mismatch**: Ensure manifest.json URLs match your deployed routes
3. **CORS issues**: Check that your app allows framing from meet.google.com
4. **Wrong manifest URL**: Verify the manifest.json is accessible

### Check Console Errors

Open Chrome DevTools in Google Meet and check for errors:
- Right-click in Meet → **Inspect** → **Console** tab
- Look for errors related to iframe loading or SDK initialization

### Verify Environment Variables

After deploying, check that the environment variable is set:
1. In Vercel Dashboard, go to **Deployments**
2. Click on your latest deployment
3. Go to **Functions** tab
4. Check **Environment Variables**

## 📋 Current Configuration

- **Side Panel URL**: `https://patientcanvas-ai.vercel.app/meet/Sidepanel`
- **Main Stage URL**: `https://patientcanvas-ai.vercel.app/meet/Mainstage`
- **Add-on Origin**: `https://patientcanvas-ai.vercel.app`
- **Manifest URL**: `https://patientcanvas-ai.vercel.app/manifest.json`

## ✅ Key Files Fixed

1. **Route paths**: Added both `/meet/Sidepanel` and `/meet/sidepanel` routes
2. **Environment variables**: Added GCP project number requirement
3. **CORS headers**: Updated vercel.json to allow Google Meet iframe embedding
4. **Manifest**: Corrected all URLs and added `httpOptions`
