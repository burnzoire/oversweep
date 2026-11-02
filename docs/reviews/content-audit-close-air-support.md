# Editorial audit — Close Air Support

- Source: `src/pages/manual/air-to-ground-operations/_CloseAirSupport.astro` (revision 1, PR #164)
- Reviewed: 2026-11-02
- Type: Editorial / learning design, not a technical SME validation
- Applied: in the same PR as this audit (module revision 2). Each finding below says what was changed.

## 1. Is it too long?

**Yes, for a first read.** Revision 1 has 18 contents entries in one flat list and about 8,100 words of rendered text (measured from the built page), almost all of it in long paragraphs of up to about 170 words that combine a rule, its exceptions, an example call and a citation. It reads like the publication reorganised, not like a lesson. Specific problems:

- **No first-pass path.** The reader meets authority, the FAC(A)'s four duties and the three types of control before seeing what a CAS attack actually sounds like. The mission flow, which is the natural spine of the topic, is section 7 of 18.
- **The 9-line is explained twice.** The table already gives each line's units and example; a nine-item bullet list then repeats every line in prose with the extra detail mixed in.
- **Lists that are really comparisons.** BOT versus BOC, the clearance calls, the marks, the check-in items and the three helicopter firing modes are written as paragraphs or bullets where a side-by-side table would let the reader compare at a glance.
- **Radio calls buried in prose.** The laser handoff and IR sequences are a chain of calls inside one paragraph each, which is hard to follow and impossible to scan.
- **Verbal tics.** "The publication says", "the publication's examples", "the publication warns" recur through the page; the citation already says where it comes from.
- **Opening.** The status panel runs a 70-word sentence listing every topic, and the objectives paragraph lists fifteen skills in one sentence.

**Applied:**

- Split the page into **The core sequence** (what CAS is, who controls, the flow, check-in, game plan, the 9-line, readback, correlation, the attack) and **Reference** (marks in depth, talk-on technique, fratricide protections, aircraft and services, the 5-line, the sim). The contents list shows the split.
- Open with **one attack, start to finish**: the invented Figure 1 example as a radio exchange from check-in to battle damage assessment, with each call linked to the section that explains it.
- Keep the 9-line table as the primary explanation and move the per-line detail into a collapsible "More on each line" block, so nothing is lost but it is out of the first-pass path.
- Convert comparisons to tables: roles, FAC(A) duties, BOT versus BOC, clearance calls, the check-in, marks, and hovering/running/diving fire.
- Write call sequences (laser handoff, IR, abort, reattack) as exchanges in the existing `ul.exchange` style.
- Add a one-line **Key point** at the end of each core section and a short recap before the questions.
- Remove the "the publication says" phrasing where the citation already does the job.

Technical depth kept: every sourced fact in revision 1 is still on the page, either in the core path or in Reference.

**Measured result** (built page, desktop, visible text): total length is about the same (8,100 words before and after, since nothing was cut and the opening exchange and sim panel were added), but the core sequence a first-time reader needs is about 4,100 words, ending at Key points. Tables went from 2 to 10, and no prose paragraph is now over about 105 words.

## 2. Imagery and interactivity

**Existing components are good and stay.** Figure 1 (the 9-line drawn to scale, step by step) is the strongest learning aid on the page; the three quizzes (control and clearance, which line, terms) check the right things. No new mini-games are needed.

- Figure 1 sat after a long prose block. It now follows the 9-line table directly, and the opening exchange tells the reader the figure draws the same brief.
- The new opening exchange is static text, not a new interactive component.
- A static diagram of the attack-heading geometry (parallel to the FLOT, bomb-fall error along the heading) would help the fratricide section. **Not added in this revision**: Figure 1 already draws the heading window, and a new figure should be traced from a source figure rather than invented, per the project's figure rule.

## 3. Learning outcomes

A reader should be able to:

1. Say who may control a CAS attack and what a FAC(A) can take over.
2. Distinguish the type of control (how risk is reduced) from the method of attack (BOT or BOC).
3. Give a check-in in order and copy a 9-line, knowing each line's units.
4. Give the mandatory readback.
5. Explain correlation, and the laser and IR call sequences.
6. Use the clearance calls correctly, and know who can abort.
7. Explain danger close and why attack headings run parallel to friendly lines.
8. Recognise how helicopter CAS (the 5-line) and Army close combat attack differ.

Revision 1's objectives covered all of these in one sentence. **Applied:** they are now a numbered list, and the "Check your understanding" questions are mapped to them (each outcome has at least one question; outcome 3 is covered by the "which line" quiz and Figure 1, outcome 8 gains a new question).

## 4. Important omissions or opportunities

- **Simulator crossover was missing.** The page had no "In the sim" section, though CAS with an AI JTAC is one of the most common things DCS pilots do. **Applied:** a sim panel based on the Eagle Dynamics DCS: A-10C II Tank Killer flight manual (July 2023), see section 5.
- **No sense of what a whole attack sounds like.** Applied, as the opening exchange.
- **Army and Navy-specific sources** are still missing (ATP 3-04.1 and CNATRA instructions could not be read; see the evidence record). Not changed; the applicability note still says so.
- **Cross-links.** Weapons Delivery, Radio Procedures and the glossaries were already linked. Kept.

## 5. Flight-simulator relevance and differences

Source: Eagle Dynamics, *DCS: A-10C II Tank Killer Flight Manual* (EN, PDF dated 11 July 2023), "F4 JTAC", printed pp. 784–788. This is the only sim source read; it describes DCS's AI JTAC as used from the A-10C II. Other DCS aircraft and Falcon BMS were **not checked**, and nothing here claims they behave the same or differently.

| Real-world procedure (JP 3-09.3) | DCS AI JTAC, per the A-10C II manual | Status |
| --- | --- | --- |
| Check-in: mission number, number and type, position and altitude, ordnance, playtime, capabilities, abort code | Automatic check-in sends mission number, position from the IP and altitude, weapons and playtime | **Simplified** (no capabilities or abort code in the manual's list) |
| Game plan gives type of control and method of attack | JTAC replies with the type of control (1, 2 or 3), then asks if you are ready for the 9-line | **Partly modelled** (method of attack not mentioned) |
| No risk level is attached to a type of control | Manual calls Type 1 "the most common and restrictive" and says it is "most often used when friendly forces are danger close" | **Differs**: the page says plainly that the joint publication does not rank them this way |
| 9-line, then remarks and restrictions | 9-line read in order, then remarks on request | **Modelled** |
| Mandatory readback: lines 4 and 6 and every restriction | Read back location and elevation, and other data such as final attack heading | **Modelled** |
| Digital aids | Digital 9-line arrives on the MSG page and a target symbol on the TAD after readback | **Sim-specific** to the A-10C II's data link |
| Marks: smoke, laser, IR | Coordinate only, white smoke (within 10 NM), laser (default code 1688), IR pointer (with "Pulse" and "Rope") | **Modelled**, simplified menu calls |
| Calls: IP inbound, CONTACT the mark, IN, CLEARED HOT, off | Menu calls "IP Inbound", "Contact the Mark", "In", "Off"; JTAC clears you hot or aborts | **Modelled** |
| Laser: TEN SECONDS, LASER ON, SPOT | "Laser On", then "Spot" once the LST finds it | **Simplified** |
| Type 3: CLEARED TO ENGAGE, ENGAGEMENT COMPLETE | Coordinate-only designation: JTAC "will clear you to engage"; you call "Attack Complete" | **Simplified** (different wording) |
| BDA | "Request BDA" menu item | **Modelled** on request |

Not stated in the manual and therefore **unverified** (no claim made either way): FAC(A) duty splits, danger close initials, abort codes, the 5-line, and whether helicopters get a BP-based brief. The page keeps real-world procedure primary and puts the sim material in a visually distinct panel, following the `.sim-panel` convention from the encyclopedia.

## Priority

**P1 — structure and first-pass path (applied). P1 — sim crossover (applied, one sourced module). P2 — a traced attack-heading figure (not applied).** All technical content still needs independent SME review; this audit does not validate it.
