# NBGwent

A mobile-first browser card game prototype inspired by Gwent, redesigned as a clean internal-office duel. Matches are best-of-three rounds, all card content is loaded from JSON, and the entire game runs frontend-only.

## Stack

- React 18
- TypeScript
- Vite
- CSS Modules

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Where to edit cards

All card content lives in [public/data/cards.json](/Users/artemijssafranko/Documents/GitHub/nbgwent/public/data/cards.json).

If you replace that JSON with a new card set that follows the same structure, the game will automatically render the new names, roles, images, power values, and abilities without changing the React code.

The validation schema is in [card.schema.json](/Users/artemijssafranko/Documents/GitHub/nbgwent/card.schema.json).

## Images

The JSON points to files inside `/public/images/`.

- If an image file does not exist, the card automatically renders a clean initials-based fallback.
- To add real portraits, place them in [public/images](/Users/artemijssafranko/Documents/GitHub/nbgwent/public/images) and update the `image` field in `cards.json`.

## Ability system

The effect system lives in [src/game/engine.ts](/Users/artemijssafranko/Documents/GitHub/nbgwent/src/game/engine.ts). Every card defines:

- `abilityType` for the effect kind
- `abilityValue` for the numeric payload
- `abilityText` for the UI description

Supported abilities:

- `none` for no effect
- `boost_self` to buff itself on play
- `boost_row_random` to buff a random allied card already on board
- `damage_enemy_random` to damage a random enemy card
- `double_if_last_card` to gain a bonus when it is the last card in hand
- `morale` to give +1 to the other allied cards on board
- `spy_light` to draw 1 extra card
- `comeback` to gain a bonus if its owner is behind on score
- `finisher` to gain a bonus if the opponent already has a high score
- `slay_strongest` to destroy the strongest enemy card on the board

Special match rule:

- `Lord Artūrs` is pulled out of the main deck and placed at the side for both players as a one-time bonus card
- once played, he joins the board and defeats the strongest enemy card currently in play

To add a new ability:

1. Add the type in [src/types/cards.ts](/Users/artemijssafranko/Documents/GitHub/nbgwent/src/types/cards.ts)
2. Add the resolver in `abilityResolvers` inside [src/game/engine.ts](/Users/artemijssafranko/Documents/GitHub/nbgwent/src/game/engine.ts)
3. Use the new `abilityType` in `cards.json`

## Project structure

- [src/components](/Users/artemijssafranko/Documents/GitHub/nbgwent/src/components) for match UI components
- [src/game](/Users/artemijssafranko/Documents/GitHub/nbgwent/src/game) for reducer flow, round rules, abilities, and AI
- [src/hooks/useAnimatedNumber.ts](/Users/artemijssafranko/Documents/GitHub/nbgwent/src/hooks/useAnimatedNumber.ts) for smooth score transitions

## AI behavior

The AI is intentionally simple but not random:

- it evaluates raw card power together with ability value
- it tries to preserve cards when it already has a safe lead
- if the player passes, it often looks for the most efficient winning play instead of wasting strength

## Vercel

This project is ready for Vercel as a standard Vite app.

Recommended Vercel settings:

- Framework Preset: `Vite`
- Root Directory: repository root
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Node.js Version: `20.x` recommended

No environment variables are required.
