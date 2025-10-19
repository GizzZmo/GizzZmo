# Dead Links Report

This document tracks broken links found in the repository and their corrections.

**Report Generated:** October 19, 2025

## Summary

The link checker script (`npm run check-links`) identified several broken or problematic URLs in the repository. Below is the detailed list with recommended corrections.

---

## 🔴 Critical Issues (404 Errors)

### 1. VST3-Public-SDK Repository ❌ CONFIRMED DEAD
- **Broken URL:** `https://github.com/GizzZmo/VST3-Public-SDK`
- **Status:** HTTP 404 (Repository not found - confirmed)
- **Found in:** README.md
- **Action Required:** User must decide whether to:
  - Remove this entry from the featured projects (if project no longer exists)
  - Update to link to the official Steinberg VST3 SDK: `https://github.com/steinbergmedia/vst3sdk`
  - Update to a different repository if the project was moved

### 2. Governance-System-Enhancement Repository ✅ FIXED
- **Broken URL:** `https://github.com/GizzZmo/Governance-System-Enhancement`
- **Status:** HTTP 404 (Repository was renamed)
- **Found in:** README.md
- **Fix Applied:** Updated to `https://github.com/GizzZmo/Governance-System-Enhancement-Strategy`

### 3. Twitter/X Profile
- **Broken URL:** `https://twitter.com/Jon_Arve`
- **Status:** Network/DNS issue or profile not found
- **Found in:** README.md
- **Suggested Fix:**
  - Verify Twitter/X username is correct
  - Update to `https://x.com/Jon_Arve` (Twitter is now X)
  - Or update username if changed

### 4. LinkedIn Profile ✅ FIXED
- **Broken URL:** `https://linkedin.com/in/jon-arve-gizzmo`
- **Status:** Missing www subdomain
- **Found in:** README.md
- **Fix Applied:** Updated to `https://www.linkedin.com/in/jon-arve-gizzmo`

### 5. Template Placeholder ✅ FIXED
- **Broken URL:** `https://github.com/YOUR_USERNAME/GizzZmo`
- **Status:** Template placeholder not replaced
- **Found in:** CONTRIBUTING.md
- **Fix Applied:** Updated to `https://github.com/GizzZmo/GizzZmo`

---

## ⚠️ External References (May require verification)

### 1. CommonMark
- **URL:** `https://commonmark.org/`
- **Status:** DNS resolution issue (may be temporary)
- **Found in:** CONTRIBUTING.md
- **Suggested Fix:**
  - Verify URL is correct (likely a temporary DNS issue)
  - Alternative: `https://spec.commonmark.org/`

### 2. GitHub Guides - Mastering Markdown ✅ FIXED
- **URL:** `https://guides.github.com/features/mastering-markdown/`
- **Status:** GitHub restructured their documentation
- **Found in:** CONTRIBUTING.md
- **Fix Applied:** Updated to `https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax`

### 3. EditorConfig
- **URL:** `https://editorconfig.org/`
- **Status:** DNS resolution issue (may be temporary)
- **Found in:** CONTRIBUTING.md
- **Note:** This is a valid URL, likely temporary DNS issue

### 4. VSCode Settings Reference
- **URL:** `https://code.visualstudio.com/docs/getstarted/settings`
- **Status:** DNS resolution issue (may be temporary)
- **Found in:** CONTRIBUTING.md
- **Note:** This is a valid URL, likely temporary DNS issue

### 5. GitHub API Placeholder
- **URL:** `https://api.github.com/users/{USERNAME}/repos?per_page=100&sort=updated`
- **Status:** HTTP 403 (Template with placeholder)
- **Found in:** REPO_INDEX_DOCUMENTATION.md
- **Note:** This is intentionally a template example, not a dead link

---

## 📝 Action Items

### Completed ✅
1. [x] Update Governance-System-Enhancement link
2. [x] Fix LinkedIn profile URL (add www)
3. [x] Replace YOUR_USERNAME placeholder
4. [x] Update GitHub Markdown guide link to new documentation

### Requires User Decision ⚠️
1. [ ] **VST3-Public-SDK reference** - User must decide:
   - Remove from featured projects if project no longer exists
   - Link to official Steinberg SDK
   - Or update if project moved to different repo
2. [ ] **Twitter/X profile link** - User should verify correct username and update if needed
   - Current: `https://twitter.com/Jon_Arve`
   - May need to update to `https://x.com/Jon_Arve` or verify username

### Low Priority (Likely Temporary Issues)
1. [ ] Verify external links when DNS is stable (CommonMark, EditorConfig, VSCode docs)

---

## 🔧 How to Fix

### Automated Fix
Run the interactive fix mode:
```bash
npm run fix-links
```

Then follow the prompts to correct each dead link.

### Manual Fix
Edit the files directly:
- `README.md` - Contains social media links and repository references
- `CONTRIBUTING.md` - Contains documentation links

---

## 🔄 Regular Maintenance

It's recommended to run the link checker regularly:

```bash
# Check links
npm run check-links

# Fix interactively
npm run fix-links

# Check with verbose output
npm run check-links:verbose
```

---

*This report should be updated after fixes are applied.*
