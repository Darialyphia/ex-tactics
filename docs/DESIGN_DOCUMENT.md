# PvP Tactics Game — Design Document (Draft 0.1)

---

## 1) Game Overview

A competitive, turn‑based, squad tactics game where two players field squads of **3 heroes** on an **isometric square grid** with **elevation** and varied **terrain** (e.g., water, walls). Players earn **Victory Points (VP)** by **KO’ing enemy heroes (+1 VP)** and by **destroying enemy shrines (+1 VP)**. A player who loses **all 3 shrines** immediately **loses the match**.

---

## 2) Core Concepts & Vocabulary

- **Round:** Each hero (that can act) gets **one activation** in initiative order.
- **Turn:** A **single hero’s activation**.
- **KO:** A hero’s HP is reduced to 0. Triggers respawn timer and awards VP to the opponent.
- **Shrine:** A player‑owned structure that serves as **spawn location** and **VP objective**; has HP and can be destroyed.
- **Facing:** A hero’s **orientation** on the grid (N/E/S/W diagonals as implied by iso), which can affect or be affected by actions.

---

## 3) Board & Terrain

- **Grid:** Isometric **square tiles** with **integer elevation** (e.g., height levels).
- **Terrain Types:**
  - **Normal** (no special effect).
  - **Water** (movement penalty or restriction — _TBD_).
  - **Wall** (impassable; blocks line of sight and movement).
  - **Hazards/Fields** (e.g., **Burning Ground**, **Ice Field**) that apply status effects on entry/turn start — see §12.
- **Map Layout:** Symmetric competitive maps with **3 fixed shrine locations per player**.

---

## 4) Heroes & Squad Building

- **Squad Size:** 3 unique heroes per player (**no duplicates**).
- **Acquisition & Progression:** Heroes are **acquired over time**; **weekly free rotation** (LoL‑style).
- **Out‑of‑Match Progression:** **Talent points** unlock/augment abilities to create build diversity. (Ensure competitive modes can **normalize/curate** for fairness.)
- **Roles/Archetypes:** _TBD_ (e.g., Bruiser, Assassin, Support, Controller, Skirmisher).

---

## 5) Initiative & Turn Order

- **Base Initiative:** Fixed per hero.
- **Dynamic Changes:** If a hero’s initiative changes **mid‑round**, reorder the **remaining** turn sequence accordingly (dynamic priority queue).
- **Tie‑Breaker:** At the **start of each round**, each hero rolls an **internal tie‑break seed** used to order heroes that share the same initiative. (Deterministic per round once rolled.)

---

## 6) Actions, Movement, and Facing

- **Activation Budget:** On its **turn**, a hero may **Move** and/or **perform 1 Action** (Attack or Ability).
- **Order Constraint:** **Move → Action** is allowed; **Action → Move** is **not** allowed under normal circumstances (unless a skill/effect explicitly allows it).
- **Movement Range:** _TBD_ baseline (e.g., 4 tiles) with elevation/water modifiers.
- **Elevation:** Moving **up** a level may cost extra or require a ramp; moving **down** is cheaper but may risk fall effects (_TBD_).
- **Facing Rules:**
  - After performing an **action**, the hero’s facing updates to the **action’s direction**.
  - If the hero does **no action**, the player selects facing **before ending the turn**.
  - (Optional future: Facing may interact with abilities—e.g., cones or backstrike modifiers.)

---

## 7) Combat Model

- **Determinism:** **No accuracy**/hit‑chance RNG for standard attacks.
- **Damage Variance:** _TBD_ (fixed vs small range).
- **Crits:** _TBD_. Consider **conditional crits** (e.g., from back/flank or status) to avoid random frustration.
- **Targeting & Patterns:** Each attack/ability defines **range** and **pattern** (single‑target, line, cone, cross, radius, ring, dash, pull/push).

---

## 8) Abilities & Resources

- **Model:** Abilities are **mana‑based** (each hero regenerates mana each round). Some abilities may also have **cooldowns**.
- **Ability Taxonomy:**
  - **Projectors:** line/arc shots that check LoS.
  - **Zones:** place a template (e.g., 3×3, diamond‑2) that persists for N rounds (burning/ice).
  - **Mobility:** dash/blink, jump (height check), reposition (pull/push, swap).
  - **Control:** stun, root, slow, disarm, silence, knockback.
  - **Defense:** barrier/shield, cleanse, guard/redirect, taunt (_if added later_).

---

## 10) Shrines & Respawn

- **Count & Placement:** **3 shrines per player**, at **fixed map locations**.
- **Function:** Spawn points for that player’s heroes; they are solid, but heroes may be deployed on cells nearby it.
- **structures with HP** that can be **destroyed**.
- **Destroying a Shrine:** Awards **+1 VP** to the attacker; once destroyed, it **cannot** be used for deployment.
- **Instant Loss:** If a player has **0 shrines**, they **immediately lose**.
- **Respawn Timing:** When a hero is **KO’d in Round N**, they **respawn at the start of Round N+2** (i.e., **after one full round** off the board).
- **Respawn Location:** At the **start of the respawn round**, the owning player chooses **any owned shrine**.

---

## 11) Scoring & Victory Conditions

- **VP Sources:**
  - **Hero KO:** +1 VP.
  - **Enemy Shrine Destroyed:** +1 VP.
- **VP Target:** **Low (<10)** — _exact value TBD_ .
- **Alternate Endings:** **Immediate defeat** if all shrines destroyed.
- **Round/Time Limits:** _TBD_ (ladder timers, chess clock, or soft cap with sudden death).

---

## 12) Status Effects & Fields (Baseline Set)

> Exact numbers are placeholders; balance pass pending.

- **Stun:** Skip next action/turn; remove at end of next activation.
- **Root:** Movement = 0 (can still act).
- **Slow:** −X movement next move.
- **Disarm:** Cannot use basic attack (abilities OK).
- **Silence:** Cannot use abilities (basic attack OK).
- **Burn (DOT):** Take Y damage at start of activation; may interact with **Burning Ground**.
- **Poison/Bleed (DOT):** Damage at end of round; stacks cap _TBD_.
- **Shield/Barrier:** Temporary HP that absorbs damage until depleted/expired.
- **Taunt/Guard:** Redirect targeting to the source (if adopted).
- **Terrain Fields:**
  - **Burning Ground:** Enter/stand → take damage; may **Ignite** (apply Burn).
  - **Ice Field:** Enter/leave → **Slow**; chance to **Slip** (skip move).

---

## 13) Match Flow & Timing

1. **Simultaneous Deployment:** Both players place their 3 heroes on their own shrines (or deploy zones) simultaneously.
2. **Start of Round:** Roll tie‑break seeds; apply start‑of‑round effects; mana regen.
3. **Turn Sequence:** Heroes act in **initiative order**. On a hero’s **turn**:
   - Optional **Move** (respect elevation/terrain).
   - **One Action** (Attack **or** Ability).
   - Facing updates or is selected if no action was taken.
4. **End of Round:** Resolve round‑end effects/fields; check VP and win conditions.
5. **Respawns:** At the **start** of the designated round, KO’d heroes **respawn** on an owned shrine.

**UX:** Fully **sequential** (no simultaneous planning), with clear previews for ranges, patterns, LoS, and predicted outcomes where deterministic.

---

## 14) UX & Competitive Features

- **Action Previews:** Range overlays, LoS rays, predicted damage (when deterministic).
- **Turn Order UI:** Live, dynamic order that re‑sorts if initiative changes mid‑round.
- **Combat Log:** Deterministic record for replay/spectator.
- **Accessibility:** Color‑safe tile highlights, clear iso depth cues.
- **Ladder/Ranked:** _TBD_ (timers, surrender, rematch block).

---

## 15) Balance Philosophy & RNG Policy

- Emphasis on **clarity and counterplay**: low random frustration, high tactical depth.
- **No accuracy RNG** by default.
- If **crits/damage ranges** are included, prefer **conditional or telegraphed** variants (e.g., **Backstrike**: attacks from the target’s rear gain +X damage or convert to a crit), or small damage icnrease (e.g., +25% instead of double damage).
- **Tie‑break seeds** per round provide minimal randomness without affecting tactical reliability.

---

## 16) Open Questions (TBD Decisions)

1. **Exact VP Target** (recommend 7–8 for ~15–20 min matches).
2. **Movement Baseline & Elevation Costs** (e.g., 4 move, +1 per height up).
3. **Damage Model:** fixed vs small range; **Crit policy** (none vs conditional).
4. **Mana Regen numbers** and whether a **hybrid cooldown** model is standard.
5. **Stealth**: adopt or skip; if adopted, choose **reveal radius & collision rule**.
6. **Spawn Protection** after respawn (none, DR, or displacement immunity).
7. **Additional VP Sources:** e.g., temporary control points, secondary objectives, or keep it pure (KOs + shrines).
8. **Terrain Catalog:** final list and effects (water rules, jump rules).
9. **Role Taxonomy** and team‑building constraints (e.g., 1 support min).
10. **Round/Time Limits** and tiebreakers for competitive play.

---
