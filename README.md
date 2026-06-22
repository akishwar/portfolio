# Portfolio Site

A modern portfolio website built with React, TypeScript, and Vite.

## Admin CMS Setup

This project uses a Git-based Serverless CMS. The frontend Admin Panel communicates with Vercel Serverless Functions (`/api/update-content.ts` and `/api/upload-image.ts`), which use the GitHub REST API to commit changes directly to `public/portfolio-data.json` and `public/uploads/` in this repository. 

To configure the Admin Panel:

1. **Generate a GitHub Personal Access Token (PAT)**
   - Go to your GitHub Developer Settings and create a Fine-grained personal access token.
   - Restrict access to **Only this repository**.
   - Under Repository Permissions, grant **Contents: Read and write**.
   - No other scopes or permissions are required.

2. **Configure Vercel Environment Variables**
   - Navigate to your Vercel project's Settings → Environment Variables.
   - Add the following 5 variables:
     - `GITHUB_TOKEN` (The PAT generated in step 1)
     - `GITHUB_OWNER` (Your GitHub username or organization name)
     - `GITHUB_REPO` (This repository's exact name)
     - `GITHUB_BRANCH` (Usually `main`)
     - `ADMIN_PASSWORD` (Choose a strong password to secure the Admin Panel)
   - **IMPORTANT:** Do NOT prefix any of these variables with `VITE_`. They must remain strictly server-side to ensure your GitHub token is never exposed to the client.

3. **Logging In**
   - Once deployed, open the admin panel.
   - The username is `akish` (or whichever username is configured in AuthContext).
   - The password is the exact value you set for the `ADMIN_PASSWORD` environment variable in Vercel.

4. **Image Uploads & Commits**
   - Images uploaded through the admin panel are processed, compressed, and committed directly to the `public/uploads/` folder in the repository. 
   - These actions will appear as new commits in your Git repository's history (e.g., "Upload image 1234.jpg to hero"). This is the expected behavior for a Git-based CMS and serves as an automatic backup and version history of your content changes.
