# Deployment Guide - GitHub Pages

## Automatic Deployment with GitHub Actions

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Initial Setup

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MCP Badge Creator"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mcp-badge-creator.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to: Settings → Pages
   - Under "Build and deployment":
     - Source: Select "GitHub Actions"
   - Save the settings

3. **Configure Base Path**
   - Update `vite.config.ts` with your repository name:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/YOUR-REPO-NAME/', // Change this!
   })
   ```

4. **Update README**
   - Replace `YOUR_USERNAME` in README.md with your GitHub username
   - Update the live demo URL

5. **Push Changes**
   ```bash
   git add .
   git commit -m "Update configuration for deployment"
   git push
   ```

6. **Wait for Deployment**
   - GitHub Actions will automatically build and deploy
   - Check the "Actions" tab to monitor progress
   - Once complete, your site will be live at:
     `https://YOUR_USERNAME.github.io/YOUR-REPO-NAME/`

### Checking Deployment Status

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. You should see the "Deploy to GitHub Pages" workflow running
4. Click on the workflow to see detailed logs
5. Once complete (green checkmark), your site is live!

### Subsequent Deployments

After the initial setup, every push to the `main` branch will automatically trigger a new deployment.

```bash
# Make changes
git add .
git commit -m "Your change description"
git push

# GitHub Actions will automatically deploy
```

### Manual Trigger

You can also manually trigger a deployment:

1. Go to the "Actions" tab on GitHub
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## Alternative: Manual Deployment with gh-pages

If you prefer manual deployment or GitHub Actions isn't available:

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json** (already configured)
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages**
   - Go to: Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

## Troubleshooting

### 404 Error on Deployed Site

**Problem**: Site shows 404 or blank page after deployment

**Solution**: 
- Check that `base` in `vite.config.ts` matches your repository name
- Ensure the repository name is exactly correct (case-sensitive)
- Verify GitHub Pages is enabled in repository settings

### Actions Workflow Fails

**Problem**: GitHub Actions workflow shows errors

**Solution**:
- Check the workflow logs in the Actions tab
- Ensure you have Pages enabled in repository settings
- Verify the workflow has proper permissions:
  - Settings → Actions → General → Workflow permissions
  - Select "Read and write permissions"

### Assets Not Loading

**Problem**: Images, CSS, or JS files return 404

**Solution**:
- Verify `base` path in `vite.config.ts` is correct
- Ensure all asset imports use relative paths
- Check that the build completed successfully

### Permission Denied

**Problem**: Actions workflow fails with permission errors

**Solution**:
- Go to: Settings → Actions → General
- Under "Workflow permissions", select:
  - ✅ Read and write permissions
  - ✅ Allow GitHub Actions to create and approve pull requests

## Custom Domain (Optional)

To use a custom domain:

1. **Add CNAME file** in the `public/` directory:
   ```
   yourdomain.com
   ```

2. **Configure DNS** at your domain registrar:
   - Add a CNAME record pointing to: `YOUR_USERNAME.github.io`

3. **Update GitHub Pages Settings**:
   - Settings → Pages
   - Custom domain: Enter your domain
   - Save

4. **Update vite.config.ts**:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/', // Use root for custom domain
   })
   ```

## Environment Variables

If you need environment variables:

1. **For Build Time** (GitHub Actions):
   - Add secrets in: Settings → Secrets and variables → Actions
   - Add to workflow file:
     ```yaml
     env:
       VITE_API_KEY: ${{ secrets.API_KEY }}
     ```

2. **For Local Development**:
   - Create `.env.local` file (already in .gitignore)
   - Add variables: `VITE_API_KEY=your_key_here`

## Monitoring

- Check deployment status: Repository → Environments → github-pages
- View live site: Click "View deployment" button
- See deployment history: Actions tab

---

For more information, see:
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
