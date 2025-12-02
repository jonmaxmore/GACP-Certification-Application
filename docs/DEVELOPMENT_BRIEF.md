# Development Brief – Team Guidelines

**Last Updated:** November 4, 2025  
**Purpose:** Establish development standards, workflow, and policies for the GACP Platform team  
**Audience:** All developers, architects, and contributors

---

## 🎯 Project Mission

Build a **production-ready GACP certification platform** for **cannabis and 5 Thai medicinal plants** (turmeric, ginger, black galingale, plai, kratom) with:

- Complete digital certification workflow
- IoT-enabled smart farming
- AI-powered recommendations
- Full traceability and compliance
- Multi-portal architecture (Farmer, Admin, Certificate)

---

## 📋 Core Development Principles

### 1. **Check Existing Systems FIRST** 🔍

Before implementing any new feature:

1. **Review** `docs/EXISTING_MODULES_INVENTORY.md` – comprehensive module documentation
2. **Search** the codebase for similar functionality (`grep`, file search)
3. **Ask yourself:** "Does this system already exist?"
4. **Decision tree:**
   - ✅ **System exists & works** → Use it, document integration
   - 🔧 **System exists but incomplete** → Enhance/fix existing code first
   - ⚠️ **System exists but broken** → Refactor/repair, don't rebuild
   - 🆕 **System doesn't exist** → Proceed with new development

**Why:** Prevents duplicate code, maintains consistency, reduces technical debt

---

### 2. **Enhance Before Building New** 🛠️

**Priority order for development:**

1. **Fix** broken functionality in existing modules
2. **Enhance** incomplete features in current codebase
3. **Refactor** poorly structured code for maintainability
4. **Document** existing systems that lack documentation
5. **Build new** features only when truly needed

**Example workflow:**
```
❌ BAD: "Let's build a new notification system"
✅ GOOD: "The notification system exists in modules/notification-service. 
         Let's add SMS support to the existing architecture."
```

---

### 3. **Cannabis-First Policy** 🌿

**Cannabis (กัญชา) must ALWAYS be the first option** in:

- Crop selection dropdowns/menus
- Dashboard filters
- Report categories
- Analytics displays
- Search results (when sorted by crop)

**Complete 6-plant support:**
1. **Cannabis (กัญชา)** ← PRIMARY
2. Turmeric (ขมิ้น)
3. Ginger (ขิง)
4. Black Galingale (กระชาย)
5. Plai (ไพล)
6. Kratom (กระท่อม)

**Implementation example:**
```typescript
// ✅ CORRECT
const crops = ['กัญชา', 'ขมิ้น', 'ขิง', 'กระชาย', 'ไพล', 'กระท่อม'];

// ❌ WRONG (alphabetical order)
const crops = ['กระชาย', 'กระท่อม', 'กัญชา', 'ขมิ้น', 'ขิง', 'ไพล'];
```

**Verification checklist:**
- [ ] All dropdown menus show cannabis first
- [ ] Dashboard default filter = cannabis
- [ ] Example data uses cannabis as primary
- [ ] Documentation mentions cannabis-first policy

---

### 4. **Research-Driven Development** 🌐

For major features, **research competitors and best practices FIRST**:

**Trusted sources for agricultural/certification platforms:**

- **Global Standards:** 
  - WHO Good Agricultural and Collection Practices (GACP)
  - GLOBALG.A.P. Certification
  - USDA Organic Certification System
  - EurepGAP (EU standards)
  
- **Asian/Regional Platforms:**
  - Thai FDA (Food and Drug Administration) systems
  - ACFS (National Bureau of Agricultural Commodity and Food Standards)
  - Singapore AVA (Agri-Food & Veterinary Authority)
  - Japan's JAS (Japanese Agricultural Standards)
  - Korea's GAP certification portal

- **Cannabis-Specific:**
  - Canada's Health Canada Cannabis Tracking System
  - Colorado's METRC (Marijuana Enforcement Tracking Reporting Compliance)
  - California's CCTT (Cannabis Track-and-Trace)

**Research process:**

1. **Document findings** in `docs/GLOBAL_COMPETITOR_RESEARCH_PLAN.md`
2. **Analyze** UI/UX patterns, workflow design, compliance features
3. **Extract** best practices (with references)
4. **Adapt** to Thai context and GACP requirements
5. **Implement** with improvements

**Research documentation template:**
```markdown
## Platform: [Name]
- **URL:** [link]
- **Region:** [Global/Asia/Country]
- **Focus:** [Organic/GAP/Traceability/etc.]

### Key Features:
- Feature 1 with screenshot/description
- Feature 2 with implementation notes

### Lessons Learned:
- What works well
- What to avoid
- How we can improve
```

---

### 5. **File Management & Documentation** 📁

#### **Root Directory Rules** (STRICT)

**Keep in root:**
- `README.md` (project overview ONLY)
- `IMPROVEMENT_100_PERCENT_SUMMARY.md` (latest status)
- `package.json`, `docker-compose.yml` (infrastructure)
- Essential config files (`.eslintrc`, `tsconfig.json`, etc.)

**Archive to `archive/` with timestamp:**
- Old feature summaries → `archive/FEATURE_X_COMPLETE_2025-11-04.md`
- Outdated design docs → `archive/DESIGN_V1_2025-10-28.md`
- Superseded guides → `archive/OLD_DEPLOYMENT_GUIDE_2025-09-15.md`

**Never keep in root:**
- Duplicate `.md` files with similar names
- Old test reports (archive them)
- Personal notes or scratch files

**Archival process:**
```bash
# When replacing/updating documentation:
git mv OLD_DOCUMENT.md archive/OLD_DOCUMENT_2025-11-04.md
git add NEW_DOCUMENT.md
git commit -m "docs: Archive OLD_DOCUMENT, replace with NEW_DOCUMENT"
```

#### **README.md Guidelines**

**README should contain ONLY:**
- Project name and tagline
- High-level overview (2-3 paragraphs)
- Architecture diagram/summary
- Quick start commands
- Link to full documentation

**README should NOT contain:**
- Budget information
- Team member names/contacts
- Detailed API specifications
- Step-by-step tutorials (link to docs/ instead)
- Project history or changelogs

**Example structure:**
```markdown
# GACP Platform
> Enterprise certification platform for cannabis and Thai medicinal plants

## Overview
[2-3 paragraph summary]

## Quick Start
[Installation commands]

## Documentation
- Architecture: docs/ARCHITECTURE.md
- Developer Guide: docs/DEVELOPER_SETUP.md
- Deployment: docs/05_DEPLOYMENT/

## License
Proprietary
```

---

## 🔧 Technical Standards

### TypeScript & Code Quality

- **TypeScript:** Strict mode enabled, no `any` types
- **Linting:** ESLint + Prettier (run pre-commit hooks)
- **Testing:** 80%+ coverage for business logic
- **Pre-commit checks:**
  ```bash
  npm run type-check  # Must pass (0 errors)
  npm run lint:all    # Must pass (0 errors, warnings OK)
  npm run test        # Must pass (critical tests)
  ```

### Git Workflow

**Branch naming:**
- `feature/cannabis-dashboard` (new features)
- `fix/payment-validation` (bug fixes)
- `refactor/auth-module` (code improvements)
- `docs/api-specification` (documentation)

**Commit messages:**
```
feat(module): Add cannabis-first sorting to dropdowns
fix(auth): Resolve JWT token expiration issue
refactor(api): Simplify application workflow logic
docs(readme): Update quick start guide
chore(ci): Add TypeScript checks to GitHub Actions
```

**Before every commit:**
1. Run quality checks: `npm run type-check && npm run lint:all`
2. Update relevant documentation
3. Add/update tests for new functionality
4. Check cannabis-first ordering if UI changes

---

## 🚀 Development Workflow

### 1. **Planning Phase**

- [ ] Review existing modules inventory
- [ ] Research similar features in competitor platforms
- [ ] Document findings and proposed approach
- [ ] Get team review/approval

### 2. **Implementation Phase**

- [ ] Check existing code for reusable components
- [ ] Enhance existing systems before building new
- [ ] Implement with cannabis-first ordering
- [ ] Add TypeScript types (strict mode)
- [ ] Write tests (unit + integration)

### 3. **Quality Assurance Phase**

- [ ] Run type-check (0 errors required)
- [ ] Run lint (0 errors, warnings acceptable)
- [ ] Run tests (all critical tests pass)
- [ ] Manual testing in all 3 portals
- [ ] Verify cannabis-first ordering

### 4. **Documentation Phase**

- [ ] Update module inventory if new module
- [ ] Add/update API documentation
- [ ] Write inline code comments (TypeScript JSDoc)
- [ ] Update README if architecture changes
- [ ] Archive old documentation with timestamps

### 5. **Deployment Phase**

- [ ] Create feature branch and PR
- [ ] CI/CD checks pass (GitHub Actions)
- [ ] Code review approved
- [ ] Merge to main
- [ ] Deploy to staging → production

---

## 📚 Key Documentation Files

### Must-Read Before Development

1. **Module Inventory:** `docs/EXISTING_MODULES_INVENTORY.md`
   - Complete list of all backend modules
   - Feature descriptions and status
   - Routes and database models

2. **Architecture:** `docs/ARCHITECTURE.md`
   - System design overview
   - Technology stack decisions
   - Database schema

3. **API Documentation:** `docs/API_DOCUMENTATION.md`
   - Complete API reference
   - Authentication flow
   - Request/response examples

4. **Competitor Research:** `docs/GLOBAL_COMPETITOR_RESEARCH_PLAN.md`
   - Findings from global/Asian platforms
   - Best practices and lessons learned
   - Feature comparison matrix

### Reference During Development

- **Quick Start:** `docs/DEV_ENVIRONMENT_QUICK_START.md`
- **Deployment:** `docs/05_DEPLOYMENT/DEPLOYMENT_GUIDE.md`
- **System Status:** `IMPROVEMENT_100_PERCENT_SUMMARY.md`
- **Testing Guide:** `INTEGRATION_TESTING_CHECKLIST.md`

---

## ✅ Definition of Done

A feature is "done" when:

- [ ] Functionality works in all 3 portals (Farmer, Admin, Certificate)
- [ ] TypeScript type-check passes (0 errors)
- [ ] ESLint passes (0 errors, warnings tracked)
- [ ] Tests written and passing (unit + integration)
- [ ] Cannabis-first ordering verified (if applicable)
- [ ] Documentation updated (code + user docs)
- [ ] Code reviewed by at least 1 team member
- [ ] Merged to main and deployed to staging
- [ ] Manual QA testing passed
- [ ] Old/duplicate files archived with timestamps

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T:
- Build new modules without checking existing inventory
- Keep duplicate `.md` files in root directory
- Use alphabetical sorting for crop lists (cannabis must be first)
- Skip TypeScript strict mode checks
- Commit without running quality gates
- Leave outdated documentation in main directories
- Implement features without researching competitors
- Expose sensitive information in README

### ✅ DO:
- Check `docs/EXISTING_MODULES_INVENTORY.md` first
- Archive old files with timestamps
- Ensure cannabis is always first in lists
- Run `npm run type-check` before every commit
- Document all architectural decisions
- Move outdated files to `archive/`
- Research best practices from credible sources
- Keep README.md concise and professional

---

## 🌿 Cannabis & Medicinal Plant Specifics

### Supported Plants (in order)

| # | Plant Name (TH) | Plant Name (EN)    | Scientific Name          | GACP Code |
|---|-----------------|--------------------|--------------------------| --------- |
| 1 | กัญชา           | Cannabis           | *Cannabis sativa*        | GACP-CAN  |
| 2 | ขมิ้น           | Turmeric           | *Curcuma longa*          | GACP-TUR  |
| 3 | ขิง             | Ginger             | *Zingiber officinale*    | GACP-GIN  |
| 4 | กระชาย          | Black Galingale    | *Kaempferia parviflora*  | GACP-GAL  |
| 5 | ไพล             | Plai               | *Zingiber cassumunar*    | GACP-PLA  |
| 6 | กระท่อม         | Kratom             | *Mitragyna speciosa*     | GACP-KRA  |

### Cannabis-Specific Features

- **Cultivation Tracking:** Vegetative → Flowering → Harvest cycles
- **THC/CBD Monitoring:** Lab testing integration points
- **Compliance:** Thai FDA cannabis regulations (2022 Act)
- **Strain Management:** Sativa, Indica, Hybrid classifications
- **Yield Tracking:** Per plant and per square meter metrics
- **Quality Grading:** Premium, Standard, Below Standard

---

## 📞 Questions & Support

- **Code Questions:** Review `docs/EXISTING_MODULES_INVENTORY.md` first
- **Architecture Decisions:** Refer to `docs/ARCHITECTURE.md`
- **Deployment Issues:** Check `docs/05_DEPLOYMENT/`
- **API Integration:** See `docs/API_DOCUMENTATION.md`

---

## 📌 Summary Checklist

Before starting ANY new development:

- [ ] Read this Development Brief completely
- [ ] Check `docs/EXISTING_MODULES_INVENTORY.md` for existing systems
- [ ] Research competitors if building major feature
- [ ] Ensure cannabis-first ordering in all UI elements
- [ ] Run quality gates before committing
- [ ] Archive old files with timestamps (don't delete unless truly useless)
- [ ] Update documentation as you code
- [ ] Keep README.md professional and concise

---

**Remember:** Our platform is production-ready and comprehensive. The best code is code we don't have to write because it already exists. Always enhance before building new! 🚀🌿
