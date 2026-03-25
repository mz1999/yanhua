# Yanhua v2.0 Redesign - Implementation Plan

## Overview
This plan covers the redesign of Yanhua video creation system to v2.0 with simplified 2-step workflow, global cultural elements, and minimalist premium visual design.

## Key Changes
1. Remove audio mixing (auto soundtrack by Jimeng)
2. Simplify to 2-step flow: Generate 4 images → Select one → Generate video
3. Remove templates
4. Expand cultural elements globally
5. Richer configuration options
6. Minimalist premium visual design

## Task Breakdown

### Task 1: Database Schema Migration
- Update Prisma schema (remove fields, simplify model)
- Run migration
- Update types

### Task 2: Remove Unused Components
- Delete audio-related components
- Delete template-related components
- Delete prompt editor
- Clean up unused services

### Task 3: Simplify API Routes
- Remove merge-audio route
- Remove auto-run route
- Remove retry route
- Update generate-images
- Update generate-video

### Task 4: Update Global Styles
- New color system (minimalist)
- Typography system
- Spacing system
- Animation variables

### Task 5: Create UI Components
- Button (minimalist style)
- OptionCard
- GenerationCard
- CulturalSelector (with regions)
- StepIndicator

### Task 6: Update Pages
- Homepage redesign
- Create page with new config options
- Task detail page (2-step flow)
- Publish page

### Task 7: Update Configuration Data
- New styles (18 options)
- New scenes (16 options)
- New cultural elements (global)
- New lighting options

### Task 8: Testing & Verification
- TypeScript type checking
- Build verification
- Visual review