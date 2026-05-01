---
name: Campanita
colors:
  surface: '#f9faf5'
  surface-dim: '#dadad6'
  surface-bright: '#f9faf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4ef'
  surface-container: '#eeeeea'
  surface-container-high: '#e8e8e4'
  surface-container-highest: '#e2e3de'
  on-surface: '#1a1c1a'
  on-surface-variant: '#424942'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f1f1ec'
  outline: '#727971'
  outline-variant: '#c1c8bf'
  surface-tint: '#406749'
  primary: '#406749'
  on-primary: '#ffffff'
  primary-container: '#8fb996'
  on-primary-container: '#244a2f'
  inverse-primary: '#a6d1ad'
  secondary: '#59579a'
  on-secondary: '#ffffff'
  secondary-container: '#b7b4fe'
  on-secondary-container: '#464385'
  tertiary: '#944748'
  on-tertiary: '#ffffff'
  tertiary-container: '#f49595'
  on-tertiary-container: '#712c2e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1edc8'
  primary-fixed-dim: '#a6d1ad'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#284f33'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#150f53'
  on-secondary-fixed-variant: '#413f80'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#ffb3b2'
  on-tertiary-fixed: '#3d050b'
  on-tertiary-fixed-variant: '#763032'
  background: '#f9faf5'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3de'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  margin-page: 24px
  gutter: 16px
  stack-sm: 12px
  stack-md: 20px
  stack-lg: 32px
---

## Brand & Style

This design system is built to evoke the warmth of a personal caregiver and the precision of a health professional. The brand personality balances "cute" and "professional" by utilizing a high-end minimalist aesthetic reminiscent of modern productivity tools, infused with the soft, approachable organic shapes of a pet-focused product.

The design style is **Corporate Modern with a Tactile twist**. It prioritizes extreme clarity and whitespace (Apple Health influence) but softens the edges with generous corner radii and a cozy, cream-based palette. The goal is to reduce the cognitive load for pet owners, replacing the anxiety of medical tracking with a sense of calm, organized companionship.

## Colors

The palette is anchored in a soft cream background to eliminate the clinical coldness of pure white. 

- **Sage Green (#8FB996)** is the primary driver, used for positive actions, health indicators, and "completed" states.
- **Soft Lavender (#B8B5FF)** acts as a secondary accent for categorization, scheduling, and nurturing-related features.
- **Light Coral (#FF9E9E)** is reserved strictly for urgent notifications, missed medications, or health alerts.
- **Deep Charcoal (#2D2D2D)** provides high-contrast legibility for typography, ensuring the "professional" side of the brand is maintained through crisp text.

## Typography

This design system uses **Plus Jakarta Sans** for its friendly yet geometric structure, which perfectly bridges the gap between a playful pet app and a serious health tracker. 

Hierarchy is established through significant size stepping and weight variations. Headlines use a tighter letter-spacing and heavier weights to feel "grounded." Body text is given ample line height to ensure readability while on the go. Labels are occasionally uppercase or semi-bold to differentiate them from prose.

## Layout & Spacing

The layout follows a **fluid grid model** optimized for PWA usage on mobile devices. A strict 8px spacing rhythm ensures vertical consistency. 

Page margins are set to a wide 24px to create a premium, spacious feel that complements the large corner radii of the components. Content is organized into "stacks"—vertical groupings of related information—with generous 32px gaps between major sections to prevent the UI from feeling cluttered. Elements within a card or group use 12px or 20px spacing to maintain a clear visual relationship.

## Elevation & Depth

Visual hierarchy is achieved through **ambient shadows and tonal layering**. Surfaces do not use harsh borders; instead, they rely on soft, diffused shadows (Blur: 20px, Y: 4px, Opacity: 6%) tinted slightly with the Deep Charcoal color to lift elements off the cream background.

A three-tier elevation system is used:
1.  **Level 0 (Base):** The Cream background.
2.  **Level 1 (Cards):** Pure white surfaces with soft shadows for primary content.
3.  **Level 2 (Modals/Popovers):** Higher contrast shadows to indicate immediate priority and interactivity.

Backdrop blurs (10px–15px) are used behind fixed navigation bars and floating buttons to maintain a sense of context and depth.

## Shapes

The shape language is the defining characteristic of this design system. It uses **Pill-shaped (Level 3)** roundedness to create an ultra-friendly and safe environment. 

All primary containers and cards must have a corner radius of at least 24px. Smaller elements like chips or input fields use a fully rounded (pill) radius. This organic approach mimics the soft curves associated with pets and comfort, differentiating the app from more rigid, traditional medical software.

## Components

- **Buttons:** Large, high-affordance pill shapes. Primary buttons use Sage Green with white text. Secondary buttons use a ghost style with a subtle 1px Sage Green border or a Soft Lavender fill at 15% opacity.
- **Cards:** White containers with 24px+ corners and soft ambient shadows. Cards should be used to group pet "profiles" or health events.
- **Chips:** Small, fully rounded pill shapes used for status tags (e.g., "Vaccinated," "Upcoming").
- **Input Fields:** Soft cream-tinted backgrounds (slightly darker than the page background) with no borders, relying on 16px internal padding and 24px corner radius.
- **Progress Bars:** Thick, rounded tracks (8px-12px height) using Sage Green to indicate health goals or treatment completion.
- **Navigation:** A simplified bottom bar with large, clear iconography and active states highlighted by a Soft Lavender glow or a small dot indicator.
- **Pet Profile Avocados:** Circular or super-elliptical (squircle) frames for pet photos to maintain the soft aesthetic.