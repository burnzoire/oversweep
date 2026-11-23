# AGM-65 Maverick seeker video: ChatGPT image prompts

These are the prompts for the final art behind the Maverick WPN format. Each placeholder in `src/data/cockpit/f16c/maverick-video.ts` (constant named below) is drawn to scale by `scripts/maverick-placeholders.py`: every unit is a box the size it projects to from the jet. Give ChatGPT the placeholder image (PNG copies are in the project files under `cockpit/maverick/`) with its prompt, then replace the constant with the result as a 768 px square WebP, the same framing.

Shared geometry: the jet is 8,000 ft above the target area, 4 NM (7.4 km) slant range from the crossroads, looking north and down at 19° below the horizon. The seeker fields of view are assumed (the DCS guide gives no figure): 5° wide and 2.5° narrow. Each image spans 1.6 times its field of view (8° or 4°) so the picture can be slewed; the MFD shows the middle 62%.

## tv-wide (`MAV_TV_WIDE`)

Wide field of view, the seeker slaved to steerpoint 5: the crossroads is just above and left of the image centre (under the WPN crosshair). The armoured column is on the road coming from the upper right toward the crossroads.

Prompt:

```
Make a 768 x 768 px square image that exactly matches the layout of the attached placeholder: the same camera, the same perspective (looking down at 19 degrees from 8,000 ft, 8 degree wide view, telephoto, so there is almost no perspective convergence), the same roads in the same places. Style: a black-and-white daylight TV seeker image from an AGM-65H Maverick missile (CCD camera), low resolution and slightly soft, mild sensor noise, high contrast between dark vehicles and the lighter dry ground, Syrian farmland in summer: dusty fields, field boundaries, a few trees and low walls, two narrow asphalt roads. No text, no numbers, no grid, no crosshairs or symbology: those are drawn on top later. Replace each numbered box with the object named below, filling the box exactly (same position and size: they are to scale, so the vehicles are tiny), seen from above and slightly behind at 19 degrees, facing the heading given (0 = up the image, 90 = right):
- Box 1: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 225, at x 464-470, y 346-349 px
- Box 2: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 225, at x 485-490, y 339-342 px
- Box 3: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 225, at x 505-510, y 332-336 px
- Box 4: BMP-2 (6.72 x 3.15 m, 2.45 m tall), heading 225, at x 525-530, y 326-329 px
- Box 5: Ural-4320 (7.37 x 2.5 m, 2.87 m tall), heading 225, at x 545-550, y 319-322 px
- Box 6: House (12.0 x 8.0 m, 5.0 m tall), heading 0, at x 353-359, y 366-372 px
- Box 7: House (12.0 x 8.0 m, 5.0 m tall), heading 90, at x 403-412, y 380-385 px
```

## tv-bore (`MAV_TV_BORE`)

Wide field of view, the seeker on the jet's boresight: open farmland about 13 km ahead of the jet, beyond the target area. No units are in view; the road and the crossroads are below the bottom edge.

Prompt:

```
Make a 768 x 768 px square image that exactly matches the layout of the attached placeholder: the same camera, the same perspective (looking down at 19 degrees from 8,000 ft, 8 degree wide view, telephoto, so there is almost no perspective convergence), the same roads in the same places. Style: a black-and-white daylight TV seeker image from an AGM-65H Maverick missile (CCD camera), low resolution and slightly soft, mild sensor noise, high contrast between dark vehicles and the lighter dry ground, Syrian farmland in summer: dusty fields, field boundaries, a few trees and low walls, two narrow asphalt roads. No text, no numbers, no grid, no crosshairs or symbology: those are drawn on top later. Replace each numbered box with the object named below, filling the box exactly (same position and size: they are to scale, so the vehicles are tiny), seen from above and slightly behind at 19 degrees, facing the heading given (0 = up the image, 90 = right):
```

## tv-narrow (`MAV_TV_NARROW`)

Narrow field of view, centred on the lead T-72 (box 1, just above and left of the image centre). The rest of the column is up the road to the right.

Prompt:

```
Make a 768 x 768 px square image that exactly matches the layout of the attached placeholder: the same camera, the same perspective (looking down at 19 degrees from 8,000 ft, 4 degree wide view, telephoto, so there is almost no perspective convergence), the same roads in the same places. Style: a black-and-white daylight TV seeker image from an AGM-65H Maverick missile (CCD camera), low resolution and slightly soft, mild sensor noise, high contrast between dark vehicles and the lighter dry ground, Syrian farmland in summer: dusty fields, field boundaries, a few trees and low walls, two narrow asphalt roads. No text, no numbers, no grid, no crosshairs or symbology: those are drawn on top later. Replace each numbered box with the object named below, filling the box exactly (same position and size: they are to scale, so the vehicles are tiny), seen from above and slightly behind at 19 degrees, facing the heading given (0 = up the image, 90 = right):
- Box 1: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 225, at x 374-385, y 372-379 px
- Box 2: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 225, at x 414-425, y 358-365 px
- Box 3: T-72B (6.95 x 3.59 m, 2.23 m tall), heading 225, at x 455-466, y 345-352 px
- Box 4: BMP-2 (6.72 x 3.15 m, 2.45 m tall), heading 225, at x 495-505, y 332-338 px
- Box 5: Ural-4320 (7.37 x 2.5 m, 2.87 m tall), heading 225, at x 535-545, y 318-325 px
- Box 6: House (12.0 x 8.0 m, 5.0 m tall), heading 0, at x 151-163, y 413-426 px
- Box 7: House (12.0 x 8.0 m, 5.0 m tall), heading 90, at x 252-270, y 441-452 px
```
