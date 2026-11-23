# AGM-65D boresight and TGP handoff: ChatGPT image prompts

Prompts for the final art behind the AGM-65D WPN format and the targeting pod (TGP) format in the boresight and TGP handoff procedure. Each placeholder in `public/images/cockpit/maverick/` (constant in `src/data/cockpit/f16c/maverick-video.ts`) is drawn to scale by `scripts/maverick-d-placeholders.py`: every unit is a box the size it projects to from the jet. Give ChatGPT the placeholder (PNG copies are in the project files under `cockpit/maverick-d/`) with its prompt, then save the result over the placeholder as a 768 px square WebP with the same framing.

Assumed fields of view (the DCS guide gives no figure): Maverick 5° wide and 2.5° narrow, pod NARO 1°. Each image spans 1.6 times its field of view so it can be slewed; the MFD shows the middle 62%. The image centre is the steerpoint in every picture. At true scale the vehicles are tiny in the Maverick views: like the PRE shot's art, they may be drawn two to three times larger, kept in the same places.

## ir-mav-wide-boresight (`MAV_IR_B_WIDE`)

Maverick, wide field of view, slaved to steerpoint 3: the road junction is the image centre; the brickworks (kiln, two drying sheds, the tall chimney) is just to its right. The kiln and chimney are warm.

Prompt:

```
Make a 768 x 768 px square image that exactly matches the layout of the attached placeholder: the same camera, the same perspective (the boresight scene: looking north and down at 7.6 degrees from 8,000 ft, 10 NM away, a 8 degree wide view, telephoto, so there is almost no perspective convergence), the same roads and buildings in the same places. Style: a black-and-white infrared (white-hot) seeker image from an AGM-65D Maverick missile, low resolution and soft, visible sensor noise and slight banding, warm things light and cool things dark, late afternoon in Syrian farmland: dusty fields cooling, field boundaries, a few trees, narrow roads. No text, no numbers, no grid, no crosshairs or symbology: those are drawn on top later.
- Box 1: Kiln (80 x 24 m, 10 m tall), heading 90, at x 378-402, y 379-383 px
- Box 2: Chimney (4 x 4 m, 40 m tall), heading 0, at x 403-404, y 370-382 px
- Box 3: Shed (40 x 12 m, 6 m tall), heading 90, at x 384-396, y 381-384 px
- Box 4: Shed (40 x 12 m, 6 m tall), heading 90, at x 384-396, y 379-381 px
- Box 5: House (12 x 8 m, 5 m tall), heading 0, at x 374-376, y 383-385 px
- Box 6: House (12 x 8 m, 5 m tall), heading 90, at x 372-375, y 381-383 px
```

## ir-mav-narrow-boresight (`MAV_IR_B_NARROW`)

Maverick, narrow field of view, the same scene: the junction at the centre, the brickworks to its right. The chimney (box 2) is the boresight point: make it a clear, hot, thin vertical shape.

Prompt:

```
Make a 768 x 768 px square image that exactly matches the layout of the attached placeholder: the same camera, the same perspective (the boresight scene: looking north and down at 7.6 degrees from 8,000 ft, 10 NM away, a 4 degree wide view, telephoto, so there is almost no perspective convergence), the same roads and buildings in the same places. Style: a black-and-white infrared (white-hot) seeker image from an AGM-65D Maverick missile, low resolution and soft, visible sensor noise and slight banding, warm things light and cool things dark, late afternoon in Syrian farmland: dusty fields cooling, field boundaries, a few trees, narrow roads. No text, no numbers, no grid, no crosshairs or symbology: those are drawn on top later.
- Box 1: Kiln (80 x 24 m, 10 m tall), heading 90, at x 372-420, y 374-381 px
- Box 2: Chimney (4 x 4 m, 40 m tall), heading 0, at x 422-424, y 357-381 px
- Box 3: Shed (40 x 12 m, 6 m tall), heading 90, at x 384-408, y 379-383 px
- Box 4: Shed (40 x 12 m, 6 m tall), heading 90, at x 384-408, y 374-379 px
- Box 5: House (12 x 8 m, 5 m tall), heading 0, at x 364-368, y 382-386 px
- Box 6: House (12 x 8 m, 5 m tall), heading 90, at x 360-367, y 378-382 px
```

## ir-tgp-boresight (`TGP_IR_B`)

Targeting pod, narrow field of view (NARO), the same scene, 2.5 times closer than the Maverick's narrow view: the junction at the centre, the kiln and the hot chimney (box 2) up and to the right.

Prompt:

```
Make a 768 x 768 px square image that exactly matches the layout of the attached placeholder: the same camera, the same perspective (the boresight scene: looking north and down at 7.6 degrees from 8,000 ft, 10 NM away, a 1.6 degree wide view, telephoto, so there is almost no perspective convergence), the same roads and buildings in the same places. Style: a sharp black-and-white infrared (white-hot) targeting pod image, much finer detail than a missile seeker, mild noise, warm things light and cool things dark, late afternoon in Syrian farmland: dusty fields, field boundaries, trees, narrow roads. No text, no numbers, no grid, no crosshairs or symbology: those are drawn on top later.
- Box 1: Kiln (80 x 24 m, 10 m tall), heading 90, at x 354-473, y 358-378 px
- Box 2: Chimney (4 x 4 m, 40 m tall), heading 0, at x 479-485, y 316-376 px
- Box 3: Shed (40 x 12 m, 6 m tall), heading 90, at x 384-443, y 370-382 px
- Box 4: Shed (40 x 12 m, 6 m tall), heading 90, at x 384-443, y 360-371 px
- Box 5: House (12 x 8 m, 5 m tall), heading 0, at x 333-345, y 380-390 px
- Box 6: House (12 x 8 m, 5 m tall), heading 90, at x 323-341, y 370-379 px
```

## ir-mav-wide-target (`MAV_IR_T_WIDE`)

Maverick, wide field of view, slaved to steerpoint 5: the farm-track junction is the image centre; to its right, by a tree line, two T-72 tanks and a BMP-2, engines warm. A barn and a house left of the junction.

Prompt:

```
Make a 768 x 768 px square image that exactly matches the layout of the attached placeholder: the same camera, the same perspective (the target scene: looking north and down at 15.3 degrees from 8,000 ft, 5 NM away, a 8 degree wide view, telephoto, so there is almost no perspective convergence), the same roads and buildings in the same places. Style: a black-and-white infrared (white-hot) seeker image from an AGM-65D Maverick missile, low resolution and soft, visible sensor noise and slight banding, warm things light and cool things dark, late afternoon in Syrian farmland: dusty fields cooling, field boundaries, a few trees, narrow roads. No text, no numbers, no grid, no crosshairs or symbology: those are drawn on top later.
- Box 1: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 10, at x 403-406, y 378-381 px
- Box 2: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 25, at x 415-418, y 374-377 px
- Box 3: BMP-2 (6.72 x 3.15 m, 2.45 m tall), heading 300, at x 391-395, y 374-376 px
- Box 4: Trees (120 x 12 m, 10 m tall), heading 90, at x 372-443, y 366-374 px
- Box 5: Barn (20 x 10 m, 7 m tall), heading 0, at x 357-363, y 375-382 px
- Box 6: House (12 x 8 m, 5 m tall), heading 90, at x 363-370, y 384-388 px
```

## ir-mav-narrow-target (`MAV_IR_T_NARROW`)

Maverick, narrow field of view, the same scene: the junction at the centre; box 1 (the nearer T-72) is the target the pod hands off.

Prompt:

```
Make a 768 x 768 px square image that exactly matches the layout of the attached placeholder: the same camera, the same perspective (the target scene: looking north and down at 15.3 degrees from 8,000 ft, 5 NM away, a 4 degree wide view, telephoto, so there is almost no perspective convergence), the same roads and buildings in the same places. Style: a black-and-white infrared (white-hot) seeker image from an AGM-65D Maverick missile, low resolution and soft, visible sensor noise and slight banding, warm things light and cool things dark, late afternoon in Syrian farmland: dusty fields cooling, field boundaries, a few trees, narrow roads. No text, no numbers, no grid, no crosshairs or symbology: those are drawn on top later.
- Box 1: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 10, at x 423-428, y 372-377 px
- Box 2: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 25, at x 445-453, y 365-370 px
- Box 3: BMP-2 (6.72 x 3.15 m, 2.45 m tall), heading 300, at x 397-406, y 363-368 px
- Box 4: Trees (120 x 12 m, 10 m tall), heading 90, at x 360-502, y 348-364 px
- Box 5: Barn (20 x 10 m, 7 m tall), heading 0, at x 331-343, y 365-379 px
- Box 6: House (12 x 8 m, 5 m tall), heading 90, at x 341-355, y 385-393 px
```

## ir-tgp-target (`TGP_IR_T`)

Targeting pod, NARO, the same scene: the junction at the centre, the two T-72s and the BMP-2 by the tree line to the right, clearly recognisable as tanks and an infantry vehicle.

Prompt:

```
Make a 768 x 768 px square image that exactly matches the layout of the attached placeholder: the same camera, the same perspective (the target scene: looking north and down at 15.3 degrees from 8,000 ft, 5 NM away, a 1.6 degree wide view, telephoto, so there is almost no perspective convergence), the same roads and buildings in the same places. Style: a sharp black-and-white infrared (white-hot) targeting pod image, much finer detail than a missile seeker, mild noise, warm things light and cool things dark, late afternoon in Syrian farmland: dusty fields, field boundaries, trees, narrow roads. No text, no numbers, no grid, no crosshairs or symbology: those are drawn on top later.
- Box 1: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 10, at x 481-495, y 355-367 px
- Box 2: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 25, at x 537-556, y 336-348 px
- Box 3: BMP-2 (6.72 x 3.15 m, 2.45 m tall), heading 300, at x 417-439, y 332-344 px
- Box 4: Trees (120 x 12 m, 10 m tall), heading 90, at x 325-679, y 295-333 px
- Box 5: Barn (20 x 10 m, 7 m tall), heading 0, at x 250-280, y 337-372 px
- Box 6: House (12 x 8 m, 5 m tall), heading 90, at x 277-313, y 386-407 px
```
