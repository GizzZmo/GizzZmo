# 🔗 How to Fix Dead Links - Quick Start Guide

Welcome! This guide will help you fix the dead links found in your repository.

## 🎯 What You Need to Do

Your repository has **1 main dead link** that needs your decision:

### VST3-Public-SDK Repository (404 Error)

This link appears in your README.md and returns a 404 error, meaning the repository doesn't exist.

## 🚀 Quick Fix - Interactive Mode

The easiest way to fix this is using the interactive mode:

```bash
npm run fix-links
```

This will:
1. Show you each dead link
2. Ask what you want to do with it
3. Automatically update all files

### What You'll See:

```
Dead Link 1/1:
https://github.com/GizzZmo/VST3-Public-SDK
Reason: HTTP 404

Found in:
  - README.md

Action? (f)ix / (s)kip / (q)uit: 
```

**Your Options:**

- Type **`f`** to fix it
- Type **`s`** to skip this link
- Type **`q`** to quit

## 💡 Recommended Solutions

### Option 1: Link to Official Steinberg SDK (Recommended)

If you don't have your own VST3 SDK fork, link to the official one:

```
Enter the correct URL: https://github.com/steinbergmedia/vst3sdk
```

### Option 2: Remove the Reference

If you no longer work with VST3 or don't want this link:

Type **`s`** to skip, then manually remove line 79 from README.md

### Option 3: Update to Your Fork

If you moved the project to another repository:

```
Enter the correct URL: https://github.com/YourUsername/your-vst3-repo
```

## ✅ Verify Your Fix

After making changes, verify everything works:

```bash
npm run check-links
```

You should see:
```
✗ Dead links: 0
```

## 📋 Step-by-Step Example

Here's a complete fix session:

```bash
# 1. Start the interactive fixer
$ npm run fix-links

# 2. You'll see the dead link
Dead Link 1/1:
https://github.com/GizzZmo/VST3-Public-SDK
Reason: HTTP 404
Found in:
  - README.md

# 3. Choose to fix it
Action? (f)ix / (s)kip / (q)uit: f

# 4. Enter the new URL
Enter the correct URL: https://github.com/steinbergmedia/vst3sdk

# 5. Confirm it updated
✓ Updated 1 file(s)

# 6. Verify no more dead links
$ npm run check-links
✗ Dead links: 0

# 7. Commit your changes
$ git add README.md
$ git commit -m "Fix VST3 SDK link"
$ git push
```

## 🛠️ All Available Commands

```bash
# Check for dead links
npm run check-links

# Check with detailed output
npm run check-links:verbose

# Fix links interactively
npm run fix-links
```

## 📝 Manual Fix (Alternative)

If you prefer to edit files manually:

1. Open README.md
2. Find line 79 (search for "VST3-Public-SDK")
3. Replace the entire line with one of these:

**Option A - Link to official SDK:**
```markdown
| 🎚️ **[VST3 SDK](https://github.com/steinbergmedia/vst3sdk)** | Official Steinberg VST3 SDK | ![C++](https://img.shields.io/badge/C++-00599C?style=flat-square&logo=c%2B%2B&logoColor=white) | ![Stars](https://img.shields.io/github/stars/steinbergmedia/vst3sdk?style=flat-square) |
```

**Option B - Remove it:**
```markdown
(Delete the entire line 79)
```

4. Save the file
5. Run `npm run check-links` to verify

## 📚 More Help

- **Detailed report**: See `DEAD_LINKS_REPORT.md`
- **Script docs**: See `scripts/README.md`
- **Full summary**: See `LINK_CHECKER_SUMMARY.md`

## 🎉 That's It!

You're just one command away from fixing all dead links:

```bash
npm run fix-links
```

Choose option 1 (Link to official Steinberg SDK) if you're not sure what to do.

---

*The link checker will be available for future use - run `npm run check-links` anytime to keep your links healthy!*
