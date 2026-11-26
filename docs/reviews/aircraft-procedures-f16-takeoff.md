# F-16C Takeoff procedure — review notes

Procedure `takeoff` (13 steps), after Before Takeoff. Source: Eagle Dynamics DCS F-16C Early Access Guide, Takeoff p. 143 and p. 146 (steps 1–8, takeoff speed chart), crosswind p. 147.

## Drawn as assumptions (not in the guide)
- The scenario starts with NWS engaged after taxiing. On a DCS runway start it begins disengaged. In the walkthrough the learner presses the stick's NWS button and the AR/NWS light goes out (pp. 45, 83, 143, 146).
- 90% RPM: the run-up step is an explained confirm (the throttle is not drawn); engine readings at 90% (45 psi oil, 650 °C FTIT, 3,000 psi hydraulics, nozzle 30%) are illustrative.
- Roll model: 2.5 kt/s at 90% RPM for 4 s, then 9.5 kt/s in AB; rotation at 6°/s to 10.5°; climb angle building to 7°; gear up 3 s after liftoff, 6 s in transit. 28,000 lb, 156 KCAS takeoff speed, 141 kt rotation in AB.
- The final step plays three more seconds of the illustrative climb to show the altitude trend. The lesson gives no target climb speed or pitch for the remainder of the departure.
- Runway markings, lights, vehicles and building height (terminal 30 ft) are illustrative. Runway, taxiways, apron and terminal come from OpenStreetMap (`airfield-plans/batumi.json`); its runway is 8,145 ft, the DCS record says 6,793 ft. HUD heading is shown as 124, the DCS record's heading for runway 13 (the aerial imagery paints 12 and 30; the lesson follows the DCS record, 13 and 31).
- The HUD glass is about 15° wide, so the runway numbers and the terminal are out of view; the apron, lights and vehicles show.

## Not run
SME review (waiting for Nathan's say-so).

Source pages (physical PDF pages equal printed pages in this edition): 143-147 (takeoff, takeoff speed chart, crosswind takeoff), 45 and 83 (AR/NWS indicator, NWS button), 90-92 (HUD), 50, 55-57 and 61 (instruments, landing gear, hydraulics).
SME review run on 3dba41dd: one blocker (runway designator), fixed by naming the runway 13 and painting 13 and 31 to match the DCS record. The engine panel is not shown during the roll, so its readings are not updated after the run-up.
