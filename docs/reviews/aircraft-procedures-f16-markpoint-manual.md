# F-16C manual markpoint entry

[Issue #527](https://github.com/burnzoire/oversweep/issues/527)

The exercise starts airborne in NAV with steerpoint 3 selected, the INS aligned and slot 26 available. The learner enters a navigation checkpoint using the shared ICP and DED, recalls it to correct its elevation, then selects it and checks the CNI and HSD indications. The Markpoints menu links to the full written sequence and interactive exercise.

## Source evidence

[Eagle Dynamics, DCS F-16C Viper Early Access Guide, English edition of 16 August 2026](https://www.digitalcombatsimulator.com/upload/iblock/e78/33zl8132hi71d3tv0194vvkzpzl3mrr6/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf), accessed 26 November 2026. Publisher documentation for the DCS F-16C Block 50. Page references below are printed page numbers. The walkthrough uses original illustrations and paraphrases.

| Pages | Behavior in the exercise |
| --- | --- |
| 103, 219–220 | MARK opens from CNI. The DCS switch moves the field asterisks. ENTR accepts each value. With the asterisks on the sensor field, M-SEL selects the displayed markpoint and highlights STPT. RTN returns to CNI. |
| 212–213, 225 | The same ICP coordinate entry applies to an empty or previously saved markpoint. Latitude uses two degree digits and longitude uses three. Elevation is entered in feet. The walkthrough follows p. 225 for manual entry using latitude and longitude. |
| 205, 358–359 | The small cyan X marks the ownship markpoint. The old route steerpoint loses its solid selected symbol when steering switches to 26. |

## Exercise assumptions

- The checkpoint position is the coordinate pair from the existing steerpoint-entry exercise. The original 892 ft elevation and correction to 982 ft are scenario inputs. The HSD scene uses illustrative range and bearing.
- The complete coordinate pair is 36.5970333° N, 36.5835667° E. PROJ transforms it to UTM zone 37N, 283847.306 m E and 4052889.874 m N, yielding MGRS 37S BA 83847 52889 at metre precision.
- The DED uses the existing steerpoint partial-entry formatting. It shows the computed MGRS value once both coordinate fields are accepted. The HSD exercise checks the fully entered point.
- Simulator checks pending for which slot MARK displays after manual entry, cursor focus after ENTR, coordinate and grid display during entry, and the cyan X presentation when selected. Page 220 describes automatic slot advance but does not distinguish manual entry from sensor storage. Its wording about the MGRS field also differs from the dedicated manual procedure on p. 225. DCS runtime and build verification remain pending.
