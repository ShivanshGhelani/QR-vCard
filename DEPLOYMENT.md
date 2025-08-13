# Deployment Guide - QR Code vCard Generator

## 🚀 Vercel Deployment

This project is optimized for deployment on Vercel. Follow these steps to deploy your QR Code vCard Generator:

### Prerequisites
- GitHub account with the repository
- Vercel account (free tier available)

### Step 1: Connect to Vercel

1. **Visit Vercel**: Go to [vercel.com](https://vercel.com) and sign in
2. **Import Project**: Click "New Project"
3. **Connect GitHub**: Select your GitHub account
4. **Select Repository**: Choose `ShivanshGhelani/QR-vCard`
5. **Configure Project**: Vercel will automatically detect it's a static site

### Step 2: Configure Deployment Settings

The project includes a `vercel.json` file with optimal settings for Node.js:

```json
{
  "version": 2,
  "name": "qr-vcard-generator",
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ]
}
```

**No additional configuration needed!** Vercel will automatically:
- Build and deploy the Node.js server
- Handle API endpoints for QR code generation
- Serve static files and handle SPA routing
- Apply security headers and optimizations

### Step 3: Deploy

1. **Review Settings**: Verify the configuration
2. **Deploy**: Click "Deploy"
3. **Wait**: Deployment takes 1-2 minutes
4. **Access**: Your app will be available at `https://your-project-name.vercel.app`

### Step 4: Custom Domain (Optional)

1. **Add Domain**: In your Vercel dashboard, go to Settings → Domains
2. **Configure**: Add your custom domain
3. **DNS**: Update your DNS records as instructed by Vercel

## 🔧 Environment Variables

No environment variables are required for this static application.

## 📱 PWA Features

The deployed application includes:
- **Offline Support**: Works without internet after first load
- **Installable**: Can be installed as a native app
- **Fast Loading**: Optimized caching and compression
- **Mobile Optimized**: Responsive design for all devices

## 🔄 Automatic Deployments

Vercel automatically deploys:
- **On Push**: Every push to the main branch triggers a new deployment
- **Preview Deployments**: Pull requests get preview URLs
- **Rollback**: Easy rollback to previous versions

## 📊 Performance

Expected performance metrics:
- **First Load**: < 2 seconds
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: All metrics in the green

## 🛠 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all files are committed to GitHub
   - Verify `vercel.json` is in the root directory
   - Check Vercel build logs for errors

2. **PWA Not Working**
   - Ensure HTTPS is enabled (automatic on Vercel)
   - Check that `manifest.json` is accessible
   - Verify service worker registration

3. **QR Codes Not Generating**
   - Check browser console for JavaScript errors
   - Verify CDN resources are loading
   - Test with different browsers

### Debug Mode

Enable debug logging in the browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 🔗 Useful Links

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Project URL**: `https://your-project-name.vercel.app`
- **GitHub Repository**: `https://github.com/ShivanshGhelani/QR-vCard`

## 📈 Analytics (Optional)

To add analytics to your deployed app:

1. **Google Analytics**: Add GA tracking code to `index.html`
2. **Vercel Analytics**: Enable in project settings
3. **Custom Analytics**: Implement in `script.js`

## 🔒 Security

The deployment includes security headers:
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer-when-downgrade

## 🎯 Next Steps

After deployment:
1. **Test**: Verify all features work correctly
2. **Share**: Share your live URL with users
3. **Monitor**: Check Vercel analytics for usage
4. **Update**: Push changes to GitHub for automatic deployment

---

**Need Help?** Check the [Vercel Documentation](https://vercel.com/docs) or create an issue in the GitHub repository. 