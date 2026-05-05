# Vercel Troubleshooting Guide

## 🔍 Common Issues and Solutions

### ❌ Issue: Continuous Initializing / Loading
**Symptoms**: Page shows loading spinner forever

**Causes & Solutions**:
1. **Environment Variables Missing**
   - Check Vercel Environment Variables
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (optional)
   - Redeploy after setting variables

2. **Build Configuration Issues**
   - Fixed with simplified `vercel.json`
   - Uses standard Vite framework detection
   - No complex build commands

3. **Server-Side Rendering Issues**
   - Fixed with client-side checks
   - `typeof window !== 'undefined'` guards
   - No localStorage access during build

### ❌ Issue: Build Timeouts
**Symptoms**: Build takes too long or fails

**Solutions**:
```json
// vercel.json - Simplified configuration
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### ❌ Issue: Supabase Connection Errors
**Symptoms**: Console shows Supabase errors

**Solutions**:
```javascript
// Fixed supabaseClient.js
export const supabase = (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

## 🚀 Quick Fix Steps

### Step 1: Check Environment Variables
1. Go to Vercel Project Settings
2. Environment Variables tab
3. Add (optional): `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
4. Redeploy

### Step 2: Clear Cache and Redeploy
1. Go to Vercel Dashboard
2. Click "Redeploy" or push new commit
3. Wait for build to complete

### Step 3: Check Build Logs
1. Vercel Dashboard > Functions tab
2. Look for build errors
3. Check console in browser

## 🔧 Manual Build Test

### Test Locally:
```bash
npm install
npm run build
npm run preview
```

### Test Environment Variables:
```bash
# Create .env file
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
npm run build
```

## 📱 Browser Console Checks

### Expected Logs:
```
💾 Saving card for username: test-123
📝 Card data prepared: {...}
✅ Saved to localStorage (guaranteed)
🎉 Kartu berhasil dibuat dan disimpan!
```

### Warning Logs (OK):
```
Supabase configuration is missing. Share functionality will not work.
Background music unavailable in this environment.
```

### Error Logs (NOT OK):
```
Cannot read property 'VITE_SUPABASE_URL' of undefined
localStorage is not defined
window is not defined
```

## 🎯 Deployment Checklist

### ✅ Pre-Deployment:
- [ ] All imports are correct
- [ ] No TypeScript errors
- [ ] No console errors in development
- [ ] Local build works: `npm run build`
- [ ] Environment variables set (optional)

### ✅ Post-Deployment:
- [ ] Site loads without infinite loading
- [ ] Homepage displays correctly
- [ ] Custom URL navigation works
- [ ] Card creation works
- [ ] Data persists in localStorage

## 🚨 Emergency Fixes

### If Still Initializing:
1. **Clear Browser Cache**: Ctrl+F5 or Clear Storage
2. **Check Vercel Functions**: Look for runtime errors
3. **Simplify Environment**: Remove all env vars temporarily
4. **Fallback Mode**: App should work with localStorage only

### If Build Fails:
1. **Check Dependencies**: `npm install` locally
2. **Verify Imports**: No missing components
3. **Simplify Code**: Remove complex logic temporarily
4. **Use Standard Setup**: Basic Vite + React

## 📋 Vercel Configuration

### Working Configuration:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist", 
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Build Process:
1. Install dependencies
2. Run `npm run build`
3. Output to `dist/`
4. Deploy static files
5. Handle SPA routing

## 🎯 Expected Behavior

### ✅ Normal Operation:
1. **Loading**: Brief loading (850ms max)
2. **Homepage**: Custom URL input interface
3. **Custom URL**: Card creation/editing
4. **Persistence**: LocalStorage + optional Supabase
5. **No Errors**: Smooth user experience

### ⚠️ Acceptable Warnings:
- Supabase not configured (works with localStorage)
- Audio loading issues (non-critical)
- External image loading (has fallbacks)

### ❌ Critical Errors:
- Infinite loading
- Build failures
- Runtime JavaScript errors
- Navigation not working

## 🔍 Debug Tools

### Browser Console:
- Check for JavaScript errors
- Monitor network requests
- Verify localStorage usage

### Vercel Dashboard:
- Functions tab for runtime errors
- Logs tab for build issues
- Analytics for performance

### Local Development:
- `npm run dev` for testing
- `npm run build` for build verification
- Browser DevTools for debugging

---

**If issues persist after these fixes, check Vercel Functions tab for runtime errors and browser console for JavaScript issues.**
