/**
 * Union Pier — the narrative and the order every drawing is shown in.
 *
 * A chapter holds one or more sets; a set is a slider; a slide is one drawing
 * or a group of drawings that belong side by side (before / proposed, an
 * axonometric and its cut plan, existing / proposed). Ids are the render ids in
 * union-pier-renders.json. Every render appears exactly once — the component
 * fails the build if one is missing or repeated.
 */
export interface DocSet {
  /** Small label above the slider, when a chapter has more than one. */
  title?: string;
  slides: string[][];
  /** No viewport-height cap: the drawings take the full width whatever their height. */
  full?: boolean;
}
/** A row of short text columns under a chapter's drawings: timeline eras, a SWOT panel. */
export interface DocColumn { head: string; sub?: string; items: { label?: string; text: string }[] }
export interface DocChapter {
  id: string; number: string; label: string; title: string; text: string; sets: DocSet[];
  columns?: DocColumn[]; columnsNote?: string;
}

const pair = (codes: string[], a: string, b: string) => codes.map(code => [`${code}-${a}`, `${code}-${b}`]);
const each = (ids: string[]) => ids.map(id => [`${id}-view`]);

export const chapters: DocChapter[] = [
  {
    id: 'location', number: '01', label: 'Location', title: 'A port on the edge of the old city.',
    text: 'Union Pier lies on the Cooper River side of the Charleston peninsula, in South Carolina, between the historic district and the harbour. Three maps move from the state to the city to the site: about 70 acres of closed terminal, a few blocks from the Market and East Bay Street, where the street grid stops at a fence.',
    sets: [{ full: true, slides: [['l01-view']] }]
  },
  {
    id: 'history', number: '02', label: 'History', title: 'Three and a half centuries of building the edge.',
    text: 'Charleston made its own waterfront. The walled town of 1704 stood on a narrow ridge of high ground; wharves, fill and railways pushed the shore outward until the port covered it. The upper row shows the built city growing in black across five eras, with the site outlined; the lower row is a reconstructed view of the waterfront in each. The maps are an interpretation of historic surveys and of Alfred Halsey’s 1949 map of original high ground, and the views are generated images, not archive photographs.',
    sets: [{ full: true, slides: [['h01-view']] }],
    columnsNote: 'Dates from the Charleston County Public Library’s Charleston Time Machine, the South Carolina Ports Authority, the City of Charleston and the Preservation Society’s Halsey Map project.',
    columns: [
      { head: '1600s', sub: 'Colonial', items: [
        { label: '1670', text: 'Charles Towne founded on the Ashley River.' },
        { label: '1672', text: 'The Grand Model lays out the town on the peninsula; its north end reaches the site.' },
        { label: '1680', text: 'The settlement moves to the peninsula.' },
        { label: '1680–96', text: 'East Bay Street becomes the main street and first public wharf.' },
        { label: '1682', text: 'Charles Towne is made the colony’s port of entry.' }] },
      { head: '1700s', sub: 'Walled city to federal', items: [
        { label: '1704', text: 'The walled city is complete.' },
        { label: '1728', text: 'A footpath across the site is ruled a public way.' },
        { label: '1780', text: 'Siege of Charleston.' },
        { label: '1783', text: 'The city is incorporated as Charleston.' },
        { label: '1788', text: 'A canal is given to the city to become Market Street.' },
        { label: '1790s', text: 'East Bay Street is extended north past the site.' }] },
      { head: '1800s', sub: 'Antebellum to Victorian', items: [
        { label: '1801', text: 'Concord Street is made on reclaimed ground.' },
        { label: '1831', text: 'Freight and passenger rail to Hamburg.' },
        { label: '1840s', text: 'Bennett’s Rice Mill is built; its façade still stands.' },
        { label: '1861–65', text: 'Civil War.' },
        { label: '1886', text: 'Earthquake; damage is worst on made land.' },
        { label: '1887', text: 'East Shore Terminal Company chartered; rail reaches the wharves.' }] },
      { head: '1900s', sub: 'The modern port', items: [
        { label: '1913', text: 'Cruise ships begin calling at Union Pier.' },
        { label: '1922', text: 'The city buys Union Pier and the Cooper River wharves.' },
        { label: '1942', text: 'South Carolina State Ports Authority created.' },
        { label: '1947', text: 'The waterfront passes to the Ports Authority; windowless sheds follow.' },
        { label: '1949', text: 'Halsey maps the original high ground against made land.' },
        { label: '1973', text: 'Cruise terminal opens.' },
        { label: '1989', text: 'Hurricane Hugo.' }] },
      { head: 'Today', sub: 'After the port', items: [
        { label: '2010', text: 'A cruise ship is home-ported at Union Pier.' },
        { label: '2020', text: 'The state declares about 69 acres surplus.' },
        { label: '2023', text: 'A first redevelopment plan is withdrawn after public objection.' },
        { label: '2024', text: 'Sale agreed to a local buyer.' },
        { label: '2026', text: 'The last cruise ship leaves.' }] }
    ]
  },
  {
    id: 'analysis', number: '03', label: 'Site analysis', title: 'Read the ground the port left behind.',
    text: 'Six maps of the existing site, drawn from city and OpenStreetMap data with the harbour at the top. The terminal is outlined on each: where it sits, how streets and rail reach it, how little is planted, what the zoning allows around it, how much of it floods, and that all of it is made land. The site outline is approximate.',
    sets: [{ slides: [['e01-view', 'e02-view', 'e03-view'], ['e04-view', 'e05-view', 'e06-view']] }],
    columns: [
      { head: 'Strengths', items: [{ text: 'Beside the historic district and the Market.' }, { text: 'One large parcel with a deep-water edge.' }, { text: 'An existing wharf structure to build on.' }, { text: 'Open views across the harbour.' }] },
      { head: 'Weaknesses', items: [{ text: 'No public access to the water today.' }, { text: 'Paved from edge to edge, with no planting.' }, { text: 'Low made land that settles and floods.' }, { text: 'Cut off from the street grid.' }] },
      { head: 'Opportunities', items: [{ text: 'A continuous public waterfront.' }, { text: 'A central park for the peninsula.' }, { text: 'Streets extended to the river.' }, { text: 'Housing and a market close to downtown.' }] },
      { head: 'Threats', items: [{ text: 'Storm surge and rising sea level.' }, { text: 'Settlement of filled ground.' }, { text: 'Pressure on the scale of the old city.' }, { text: 'Rising land values pushing residents out.' }] }
    ]
  },
  {
    id: 'city', number: '04', label: 'The city', title: 'Read the city before drawing the site.',
    text: 'Union Pier sits where Charleston’s fine grain of narrow plots and close streets meets the broad paved surfaces of its port. Ten peninsula studies read that change of scale: figure-ground, high ground against made land, land use, green space against parking, the neighbourhoods and the battery wall. They give the design a starting point beyond its own boundary.',
    sets: [{ slides: [['c01-view', 'c02-view'], ['c03-view', 'c04-view'], ['c05-view', 'c06-view'], ['c07-view', 'c08-view'], ['c09-view', 'c10-view']] }]
  },
  {
    id: 'framework', number: '05', label: 'Masterplan', title: 'A network of streets, gardens and public edges.',
    text: 'The masterplan extends the city as connected spaces rather than one development parcel. All three plans are drawn with the harbour at the top. The first sets the site inside the peninsula street grid; the second moves in to the streets, blocks and the central park that gives the quarters a shared address; the third cuts the ground floor and colours it by use: houses in ochre, apartments in orange, shops with homes above in rose, the market in brick red, hotels in violet and civic buildings in slate blue, beside the same cut in black to set built footprint against open ground. The paired studies then separate figure-ground, building use, green space and movement, existing against proposed.',
    sets: [
      { title: 'Site plan in the city', slides: [['g03-view']] },
      { title: 'Site plan', full: true, slides: [['g01-view']] },
      { title: 'Site plan in its surroundings', full: true, slides: [['g07-view']] },
      { title: 'Ground floor plan with land use', full: true, slides: [['g06-view'], ['g02-view']] },
      { title: 'Existing and proposed', slides: [['k01-view', 'k02-view'], ['k03-view', 'k04-view'], ['k05-view', 'k06-view'], ['k07-view']] }
    ]
  },
  {
    id: 'blocks', number: '06', label: 'Blocks', title: 'Build the neighbourhood from the court outward.',
    text: 'Each block is a small piece of the public-space system. Nine axonometric studies sit beside a key plan of the same block, turned so its streets run square to the page: the axonometric gives volume, shade and the street edge; the plan returns to entrances, courts and circulation. The key plans explain the type of each block rather than record it exactly, so partitions describe an architectural idea, not resolved rooms.',
    sets: [
      { slides: pair(['b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09'], 'view', 'key') },
      { title: 'The quarters from the air', slides: each(['z01', 'z02', 'z03', 'z04', 'z05', 'z06', 'z07', 'z08', 'z09', 'z10', 'z11', 'z12']) }
    ]
  },
  {
    id: 'transformation', number: '07', label: 'Before / proposed', title: 'From port ground to a waterfront neighbourhood.',
    text: 'Three aerials set the port beside the proposal in the same frame. The existing view is the fixed one: the camera, the crop and every building outside the terminal stay as they are, and only the port ground changes. Streets lead into planted courts, the courts open onto a park, and the park reaches the harbour through market terraces and a timber platform. The harbour-side proposals are AI visualisations placed into the existing aerials. Below them, a satellite view sets the port and the proposal in one frame, an illustration drawn over a satellite image in which only the site changes. The last five aerials show the final model: each is an AI visualisation made over the model’s own view, so the buildings and streets are the model’s and the materials, trees and light are added.',
    sets: [
      { slides: [['a01-before', 'a01-frame'], ['a05-before', 'a05-frame'], ['a06-before', 'a06-frame']] },
      { title: 'Seen from above, existing and proposed', full: true, slides: [['k10-view'], ['k11-view'], ['k12-view']] },
      { title: 'The proposal from the air', slides: each(['f01', 'f02', 'f03', 'f04', 'f05']) }
    ]
  },
  {
    id: 'landscape', number: '08', label: 'Parks', title: 'Let the park connect the daily routes.',
    text: 'Two lawns give the neighbourhood a shared centre. The lake, the retained Rice Mill façade and the gateway make distinct places within it, and a walk under the trees ties them together. The church green and the port park carry the landscape south, where garden edges and a step-up meet the raised waterfront. These six views were rendered from an earlier stage of the model.',
    sets: [{ slides: each(['p01', 'p02', 'p03', 'p04', 'p05', 'p06']) }]
  },
  {
    id: 'sections', number: '09', label: 'Sections', title: 'The waterfront is a section as much as a plan.',
    text: 'The strongest changes happen across levels: street to planted slope, slope to market terrace, terrace to harbour platform. Street sections pair each cut with its plan strip. Two streets are then cut across in perspective, with the rooms on either side and the ground beneath shown; the interiors are indicative. The long site sections trace housing, lawns, civic buildings and the pier in one line: the first five are cut through the final model and rendered over it.',
    sets: [
      { title: 'Street sections with plan', slides: each(['sp01', 'r01', 'sp02', 'sp03', 'r02', 'rs04', 'r04']) },
      { title: 'Street sections in perspective', slides: each(['y01', 'y02']) },
      { title: 'Site sections', slides: each(['x06', 'x07', 'x08', 'x09', 'x10', 'sp04', 'sp05', 'sp06', 'r03']) }
    ]
  },
  {
    id: 'experience', number: '10', label: 'The walk', title: 'Follow the route from a front door to the water.',
    text: 'At eye level the project is a sequence of thresholds. A house street gives way to the park; a ramp climbs toward the market; the battery-wall platform carries the walk onto the pier, under shade pavilions and down steps to the water. Church street, the museum galleries and the port park step-up form the southern approach, which ends at the boat terminal. The first view is of the final model; the others were rendered from an earlier stage.',
    sets: [{ slides: [['s01-view'], ['s02-view'], ['s03-view'], ['s04-view'], ['s05-view'], ['s07-view'], ['s06-view', 's09-view', 's10-view'], ['s08-view']] }]
  },
  {
    id: 'details', number: '11', label: 'Details', title: 'Give the public edge a material character.',
    text: 'Three studies move close to the elements that give the route its identity: the Rice Mill façade, the museum roofs and tower, and the pier pavilion. Masonry holds the urban edges, metal roofs make shaded rooms, and timber marks the platform at the water. Connections, marine durability and assemblies belong to a later stage.',
    sets: [{ slides: [['d01-view', 'd02-view', 'd03-view']] }]
  }
];

/** One line under a block's pair of drawings. */
export const blockNotes: Record<string, string> = {
  B01: 'Housing and planted interiors connect front doors to shared neighbourhood routes.',
  B02: 'Apartment buildings frame courts that mediate between the larger block and its streets.',
  B03: 'Shopfronts and passages give the block an active ground-level edge.',
  B04: 'Park terraces mediate between the open lawn and the built edge.',
  B05: 'The market links outdoor courts, covered space and the raised waterfront platform.',
  B06: 'The church green forms a civic room within the surrounding streets.',
  B07: 'The maritime museum connects its internal spaces to the public waterfront edge.',
  B08: 'The port park and building address the change in level toward the platform.',
  B09: 'The pier combines shaded places, open deck and cutouts at the water.'
};
