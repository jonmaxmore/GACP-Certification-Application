# GACP Platform - SEO & Sitemap Documentation

## 🗺️ Sitemap Configuration
- **File:** `src/app/sitemap.ts`
- **Coverage:** All main routes (farmer, staff, admin, trace)
- **Priority:** Dashboard routes = 0.9, Supporting pages = 0.6-0.8
- **Update Frequency:** Daily for dynamic content, Monthly for static

## 🤖 Robots.txt Configuration
- **File:** `src/app/robots.ts`
- **Allow:** All public pages
- **Disallow:** `/api/`, `/admin/`, `/staff/`
- **Sitemap:** Points to sitemap.xml

## 📋 SEO Metadata
- **File:** `src/app/layout.tsx`
- **Title:** GACP - ระบบรับรองมาตรฐานการผลิตพืชสมุนไพร
- **Description:** ระบบรับรองมาตรฐานการผลิตพืชสมุนไพร ประเทศไทย
- **Keywords:** GACP, ผลิตพืชสมุนไพร, รับรองมาตรฐาน, การเกษตรกรรม
- **Open Graph:** Complete OG tags with images
- **Twitter Card:** Summary with large image
- **Languages:** Thai (primary), English (alternate)

## 🌐 Multilingual Support
- **Canonical:** `https://gacp-platform.com`
- **Thai:** `https://gacp-platform.com/th`
- **English:** `https://gacp-platform.com/en`

## 📊 Search Engine Optimization
- **Indexing:** Enabled for all public pages
- **Image Preview:** Large format supported
- **Snippet:** -1 (auto-detect)
- **Verification:** Google Search Console ready

## 🔧 Implementation Notes
1. **Next.js 13+ App Router** - Automatic sitemap generation
2. **TypeScript Support** - Full type safety
3. **Dynamic Routes** - Covered all user roles
4. **Mobile First** - Responsive design consideration
5. **Performance** - Core Web Vitals optimized

## 📈 Next Steps
1. **Generate OG images** - Create branded social share images
2. **Add structured data** - JSON-LD for organization
3. **Implement hreflang** - Language-specific routing
4. **Add breadcrumb** - Navigation schema
5. **Setup analytics** - Search console integration

---
*Generated: 2025-01-16*
*Status: Ready for deployment*
