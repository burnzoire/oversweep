# F-16C TGP markpoint

[Issue #526](https://github.com/burnzoire/oversweep/issues/526)

The exercise starts with the pod display already holding a runway checkpoint at a fictional airfield. The learner identifies the checkpoint, opens MARK, saves it using the exercise button, recalls slot 26, selects it and checks the CNI and HSD. The pod imagery and navigation data are illustrative.

## Source record

Eagle Dynamics, [DCS F-16C Viper Early Access Guide](https://www.digitalcombatsimulator.com/en/downloads/documentation/dcs-viper_early_access_manual_en/), English edition of 16 August 2026, accessed 27 November 2026. Page numbers are printed page numbers. Display artwork is original.

| Pages | What they support |
| --- | --- |
| 103, 219–220 | CNI steerpoint readout, MARK page fields, automatic advance of the displayed slot, recall and M-SEL selection. |
| 219–220, 224 | TGP sensor option is selected when opening MARK with the pod already in point track. |
| 205, 358–359 | Navigation presentation and the cyan markpoint X. |
| 341 | CZ appears with a cursor correction. |
| 495–499 | Shared TGP format and track box. |

## Exercise assumptions

- The generated white-hot-style still is a fictional airfield. The renderer reframes it around the taxiway junction, keeps the underlying still separate from the symbology and uses the existing TGP format.
- The prepared scene starts with no cursor correction, so CZ is absent. The still leaves the radar altitude, meterstick, slant range and time-to-go fields blank because it has no calibrated sensor or timing model.
- The DED reuses the manual exercise's illustrative coordinates at 892 ft. The HSD uses the shared teaching geometry with the point 4 NM ahead. The image is illustrative and its field of view is uncalibrated.
- The exercise models the MARK page advancing to 27 using the guide's p. 220 description. Confirm slot advance, recall, indications and the applicable DCS build in the simulator before recording runtime verification.
