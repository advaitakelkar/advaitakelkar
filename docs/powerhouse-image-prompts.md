# The Powerhouse — image prompts, all four chapters

One prompt per image slot on `/projects/the-powerhouse`, in four batches, one per chapter, so a
whole chapter can be re-rendered to one look. The Chapter 3–4 renders of 1–2 November 2026 are
the standard; Chapters 1–2 are re-rendered to match them. **Site-agnostic throughout:** no city,
landmark, street, station or brand may be named or recognisable.

## Rendering brief (same for every batch)

- **Model:** OpenAI `gpt-image-2`, quality `high`, size `1536×1024` (3:2), one image per prompt.
- **Style anchors.** Before a batch, look at two of the kept renders on the Desktop
  (`Powerhouse Ch3-4 Images/Originals/`): `3-1-b.png` for every SKETCH prompt and `3-1-a.png`
  for every REAL prompt. New renders should sit beside them without a visible change of hand.
- **No text anywhere in the image.** No lettering, labels, signs, logos or watermarks. If a
  render carries text, re-render it.
- **Deliver** one file per slot, named by the slot id (`1-2-a.png`, `ch2.png` …), into the same
  Desktop folder. `node scripts/place-powerhouse-ch34-images.mjs "<folder>"` converts to webp
  and places them; the page reads them from `src/data/powerhouse-image-slots.json`.
- **Do not render** the four archival slots in 2.3 (`2-3-a` … `2-3-d`): those are historical
  photographs with their own credits and stay as they are.
- **Same building, throughout.** Wherever a prompt says "the Powerhouse", it is one family:
  timber and steel, a visible solar roof over a deep canopy, charging bays as stalls on the edge
  of an open court, rooms wrapping the court as a U open to the street, planted ground, a warm
  lamp-lit public room. "Today" scenes are cool, grey and bleak; Powerhouse scenes are warm.

Style prefixes, pasted in front of each prompt:

- **SKETCH:** Architectural concept illustration drawn as a fine pencil line drawing with a light
  watercolour wash: thin grey linework, warm pale timber and stone tones, muted greens, mostly
  white paper background, small simplified human figures, soft overcast light. No text, no
  lettering, no labels, no logos.
- **REAL:** Photorealistic architectural visualisation, overcast soft daylight, muted natural
  colours, eye-level camera, documentary feel. No text, no lettering, no signs, no logos, no
  watermark.

---

## Batch 1 — Chapter 1, Introduction (17 images)

| Slot | Medium | Prompt |
| --- | --- | --- |
| `ch1` | REAL | One electric car charging at the far edge of an otherwise empty forecourt under a flat white sky: a row of charging posts, painted bays, a shuttered kiosk, no people, nowhere to sit. The infrastructure provides power and nothing else. |
| `1-1-a` | REAL (landscape, wide) | A new road system: a highway and a line of high-voltage transmission pylons crossing the same open landscape, the conductors drawn against a pale overcast sky, a few electric trucks and cars on the road, a substation in the middle distance. Calm, documentary, no landmark. |
| `1-2-penn` | SKETCH | A great railway waiting hall of the early twentieth century, seen from inside: a vaulted stone room with tall windows, benches full of people waiting, reading and meeting, cafés and shops along its edges, and no train in sight. Interpretive, not a named building. |
| `1-2-a` | SKETCH | The road's answer: a mid-century filling station as a diagram of itself, a flat canopy over two fuel islands, a small pay booth, a car at the pump and a driver standing beside it. Five minutes, no waiting room. |
| `1-2-b` | SKETCH | The same forecourt with charging posts in place of the pumps: the stop is longer but the layout is unchanged; one driver waits inside the car, one leans against the door, one sits on the kerb with a phone. Nothing to do. |
| `1-3-a` | REAL | Twenty minutes: a woman drinking a takeaway coffee standing beside her charging car at a highway charging stop, a cable in the ground, a grass verge, traffic passing. |
| `1-3-b` | REAL | One to two hours: a delivery driver eating lunch on the step of an electric van while it charges, nowhere to sit, a warehouse wall behind, mid-day. |
| `1-3-c` | REAL (early morning) | A night: electric trucks parked in a row after an overnight rest, charging cables in, a driver with a towel crossing the lot to a low shower block, dawn light. |
| `1-4-a` | SKETCH | A charger is not a place: a mostly empty parking lot drawn from above with charging bays along one edge, two cars plugged in, and nothing else on the ground, no building, no bench, no tree. |
| `1-4-b` | SKETCH | Programme makes the place: the same lot from the same viewpoint, now with a two-storey timber public building along one side, a market and a clinic opening onto the ground, shared workspace and community rooms above with balconies, the bays kept, people arriving on foot. |
| `1-5-a` | SKETCH (early morning) | Freight corridor Powerhouse: truck charging bays under a deep timber canopy at early morning, and behind them a quiet block of drivers' rooms, showers and a kitchen with a terrace; one driver walking across with a bag. |
| `1-5-b` | REAL | City Powerhouse: chargers at ground level along a street, a gym and workspace on the floors above seen through glass, a small public corner plaza with trees and seating, cyclists and pedestrians. |
| `1-5-c` | SKETCH | Town Powerhouse: a low market hall and a clinic around an open courtyard with a few cars charging along one side, market stalls, locals on foot, an older couple at a bench. |
| `1-6` | SKETCH (no figures) | The proposition as an unresolved drawing: a loose circular field on white paper in pencil and wash, a charger marked at the centre, rings of programme suggested around it, and open ground at the edge; the architecture deliberately not yet drawn. |
| `1-7-a` | SKETCH | Sustainability, its ground and energy: a solar roof over the charging bays, battery storage behind a slatted timber screen, rain gardens between the bays. |
| `1-7-b` | REAL (low sun) | Phenomenology, the pause itself: a quiet timber room looking out through glass onto the charging bays, one person reading in a chair in low evening sun, a cup on the sill. |
| `1-7-c` | REAL | Social theory, who the place is for: long shared tables in an open courtyard of the Powerhouse, visible from the street through a wide opening, people of all ages eating and talking, a bicycle leaning on a post. |

## Batch 2 — Chapter 2, The conditions of the pause (9 images)

| Slot | Medium | Prompt |
| --- | --- | --- |
| `ch2` | REAL (aerial) | The ground built for standing: a suburban commercial edge seen from directly above, far more tarmac than building, big-box stores at the edge of one shared parking lot, a highway alongside, a few cars scattered on the lot. Overcast, no brand, no lettering. |
| `2-1-a` | REAL (summer heat) | The ground as found: cracked, unshaded asphalt in mid-day summer heat, a row of charging posts, heat shimmer, no tree, no bench, a white glare of sky. |
| `2-1-b` | REAL | The ground re-made: the same view and the same bays, now with timber canopies, rows of trees, permeable paving, planted rain gardens and a protected path between the bays, people walking on it. |
| `2-2-a` | REAL (early morning) | Charging where life happens: a car finishing an overnight charge in a home garage at early morning, the cable on the floor, a bicycle and tools on the wall, a kitchen light on through the door. |
| `2-2-b` | REAL (early morning) | Nowhere to charge at home: an apartment street at early morning, cars parked kerb to kerb on both sides, five-storey walk-ups, no charger anywhere, a resident looking for a space. |
| `2-4` | SKETCH | Every vehicle, a different pause: an e-bike, a motorcycle, a car, a van, a bus and a truck plugged in side by side in one row under one canopy, drawn to scale against each other, their charging cables to posts of matching size. |
| `2-5` | REAL (early morning) | The rules of the stop: a truck driver resting in the cab with the curtain half drawn and a mug of coffee, the electric truck charging outside at dawn, a rest area with a few other trucks. |
| `2-6-a` | SKETCH (no figures needed) | The literal powerhouse as one architectural study: a solar roof, a battery room behind a screen, charging bays and public rooms shown together in one cutaway axonometric on white paper, the flow of energy from roof to store to bay to room suggested by the drawing, no labels. |
| `2-6-b` | REAL (night) | Lights on when the grid fails: a neighbourhood in a blackout at night, streets and windows dark, and at the end of the street the Powerhouse lit, its public room full of people charging phones, a child asleep on a bench, a generator-free calm. |

## Batch 3 — Chapter 3, The place of the pause (11 images)

| Slot | Medium | Prompt |
| --- | --- | --- |
| `ch3` | REAL | The public hall of a new kind of station: a tall timber-and-steel concourse like a railway station, with a food hall, a small market of produce stalls, a café and long benches full of people of all ages, most of them without luggage or car keys. Along one glazed edge, electric cars and a delivery van sit at charging bays under a deep canopy, seen but secondary. Warm lamp-lit interior, cool grey exterior. |
| `3-1-a` | REAL | A large, empty fast-charging lot beside a highway: a row of charging posts on grey asphalt, one woman sitting on the concrete kerb beside her charging car with a paper cup, no bench, no shade, no toilet, no shop, a chain-link fence and a blank big-box wall behind. Lonely, exposed, slightly bleak. |
| `3-1-b` | SKETCH | A shaded public plaza beside electric charging bays: a timber canopy over long benches, a drinking fountain, a public toilet block with an open door, a small kiosk serving food, children on a low playground, people sitting and watching the life of the place, a couple talking, one person reading. The charging cars are at the edge, the people in the middle. |
| `3-2-a` | REAL | A Japanese roadside station in a rural valley: a low timber hall with deep eaves, a farmers' market of local produce under the eaves, a restaurant, public toilets, a free car park with a few cars and a bus, local families and elderly residents shopping on foot, a bicycle, mountains and rice fields behind. Everyday and calm. |
| `3-2-b` | SKETCH | A Powerhouse on a market day with not a single car charging: the charging bays under their canopy stand empty at the left, while the covered plaza is full of market stalls, a pharmacy and clinic with people queuing, a laundromat, a parcel room, a playground, a cooling hall with open doors. People arrive on foot and by bicycle. |
| `3-3-a` | REAL (flat grey light) | The visible face of the energy transition today: a row of identical electric charging posts in the corner of a supermarket car park, painted lines, bollards, a transformer cabinet behind a fence, no building, no people, a trolley bay, puddles. A technical object dropped into a landscape. |
| `3-3-b` | SKETCH | A recognisable figure seen from across the road: a timber-and-steel Powerhouse whose energy roof, a deep generating canopy, and lit public hall make the energy visible, like a civic building or a market hall rather than a petrol station. A public ground with trees, a playground and a plaza in front, open to anyone; charging bays under the canopy at one side. People walking in from the street, families, cyclists, a bus stop. |
| `3-4-a` | REAL (harsh noon sun) | A vast black asphalt parking lot at noon with a row of fast chargers and no shade: a man waits inside his charging car with the window down, another stands in the thin shadow of the charging post, heat shimmer over the tarmac, no tree, no bench, a glare of white sky. |
| `3-4-b` | SKETCH | Working ground: charging bays set between rows of trees and timber canopies that carry solar panels, permeable gravel and planted rain gardens taking the rain, a swale, a lawn with people lying and picnicking, a children's playground, a path winding between the bays, a timber pavilion with seating. Cool, green, comfortable. |
| `3-5` | REAL (night, slightly elevated wide camera) | A Powerhouse at 11 pm, planned as a U open to the street: the open court on the street side is lit and in use, with benches, a drinking fountain, a lit washroom and an automated kiosk on its open edge and a few people; the community hall and market wrapping the back are dark and shuttered; at the far side the operator-run rooms keep their own lit entrances, drivers' rooms and showers with trucks resting at the bays. |
| `3-6` | SKETCH (no figures needed) | Three small axonometric drawings of the same building type side by side on one white sheet: each has the same charging canopy and open court, with different rooms around it. Left: a long low building along a highway with truck bays and rooms for sleeping. Middle: a compact stacked building on a city block with a roof garden. Right: a low civic hall with a market and a clinic beside a small car park. Drawn as a comparative study. |

## Batch 4 — Chapter 4, A framework for the pause (10 images)

| Slot | Medium | Prompt |
| --- | --- | --- |
| `ch4` | REAL (aerial drone view) | A Powerhouse seen from above as both node and place: a highway interchange and an arterial road feed its charging bays and a bus stop on one side, while on the other side its open court and planted ground join the streets of a dense residential neighbourhood, people walking in on foot. The building sits between the road network and the neighbourhood, a visible solar roof and timber structure. Any city, no landmark. |
| `4-1` | REAL (slightly elevated street camera) | A site waiting to be read, in no particular city: a wide arterial road meets the edge of a residential neighbourhood; an old multi-storey parking structure on the corner, a railway line on an embankment with a small station, an electrical substation with transformers behind a fence, a bus stop, apartment blocks and a park beyond, people crossing on foot, and no electric charger anywhere. |
| `4-2-a` | SKETCH | A freight-corridor Powerhouse beside an interstate highway: a long building spread along the road, a row of truck charging bays under a deep timber canopy at the front, and set back behind a planted strip a quiet two-storey block of drivers' rooms, showers and a food hall with a terrace, a lit waiting room open all night, a few trucks resting, a driver walking across to the rooms. |
| `4-2-b` | SKETCH | A city Powerhouse on a tight corner block: a compact stacked building with charging bays, a bike hub and a bus stop at street level, a reading room, gym and childcare on the floors above seen through glass, and a public roof garden with trees under a light timber lattice roof. Crowded sidewalk, cyclists, residents walking up an open stair to the roof. |
| `4-2-c` | SKETCH | A town Powerhouse like a civic hall on the edge of a small town: a low timber market hall with deep eaves holding a market, a clinic and pharmacy, and a community hall, with a village green and playground in front; a modest row of charging bays under a canopy alongside, treated as one service among others; locals arriving on foot, an older couple, a school bus. |
| `4-3` | SKETCH (no figures needed) | An exploded axonometric drawing of a Powerhouse on a white sheet, its layers lifted apart vertically: at the bottom the planted permeable ground with a vehicle loop along one side and a pedestrian route from the street that never crosses it; above it the charging bays as stalls along one edge of an open court; above that the rooms wrapping the court on the other sides as a U open to the street; at the top a solar roof and timber canopy floating over everything. Clean, diagrammatic, drawn by an architect. |
| `4-4-a` | REAL (early morning, long shadows) | A timber-and-steel Powerhouse at 7 am: commuters grabbing coffee at the café counter, delivery vans and a fleet of ride-hail cars at the charging bays, a market being set up under the canopy, a parent dropping a child at childcare, two people jogging across the planted ground. |
| `4-4-b` | REAL (2 am, dark blue sky, warm interiors) | The same timber-and-steel Powerhouse in the middle of the night: three trucks resting at their bays with curtains drawn, a lit and open waiting room with a night-shift worker drinking tea, a driver walking from the showers to his cab, the planted ground lit by low bollards, the market and hall dark and closed, the place quiet but watched and alive. |
| `4-5` | SKETCH | A bird's-eye view straight down onto the ground of a Powerhouse, drawn as a public-life observation plan: charging bays as stalls along one edge of an open court, benches under trees, a café terrace, a playground and winding paths, with small figures standing, sitting, walking and playing scattered across it; the sitting figures cluster where there is shade and a seat, while the open asphalt of the bays is almost empty of people. **Absolutely no text, labels or captions in the image.** |
| `4-6` | REAL (dusk, slightly elevated wide camera from across the street) | The Powerhouse as a finished building that people recognise and are proud of: a bold timber-and-steel civic building whose energy roof and exposed structure make the energy visible, shading the ground beneath; an open court at its centre full of people, with cars and a truck charging as stalls along its edge and the loop behind; green, permeable planted ground with trees; a market hall and reading room glowing warm; neighbours arriving on foot and by bike. |

## Checking a render

- No text in the image; no recognisable city or landmark; no brand.
- Sketches on near-white paper (the page shows them on white with `object-fit: contain`).
- Realistic images in the muted, overcast key; the Powerhouse interiors warm.
- One building family across every Powerhouse image: energy roof, stalls on the court, U open to the street.
