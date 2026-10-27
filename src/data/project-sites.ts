export interface ProjectSite {
  title: string;
  place: string;
  center: [number, number];
  pinNote: string;
  reading: string;
  sources: {title: string; url: string}[];
}
export const projectSites: Record<string, ProjectSite> = {
  'tower-of-the-quiet-witness': {
    title: 'Ground, river, memory',
    place: 'Chattahoochee Brick Company · Atlanta, Georgia',
    center: [-84.487066912412, 33.808925981839],
    pinNote: 'Reference pin at 3195 Brick Plant Road NW, geocoded to the address. It marks the site vicinity, not a surveyed boundary or the proposed tower footprint.',
    reading: 'Read the former brickworks in relation to the Chattahoochee River, Proctor Creek, the road network and the surrounding industrial landscape.',
    sources: [{title:'Chattahoochee Brick site',url:'https://parkpride.org/event/chattahoochee-brick-sacred-site-celebration-service-project/'},{title:'Address geocoder',url:'https://geocoding.geo.census.gov/'}],
  },
  'union-pier-charleston': {
    title: 'City meets waterfront',
    place: 'Union Pier · Charleston, South Carolina',
    center: [-79.9255881, 32.7843360],
    pinNote: 'Reference pin identifies Union Pier Terminal. Existing context is shown; the redevelopment masterplan and its exact project boundary are separate drawing layers to be added.',
    reading: 'Read the relationship between the historic street fabric, the port edge and the Cooper River. Switch to figure–ground to compare the terminal with the city’s smaller blocks.',
    sources: [{title:'Union Pier · City of Charleston',url:'https://www.charleston-sc.gov/2767/Union-Pier'},{title:'Union Pier Terminal',url:'https://scspa.com/facilities/union-pier-terminal/'}],
  },
  skadoogee: {
    title: 'Learning within the landscape',
    place: 'Dahlonega · Lumpkin County, Georgia',
    center: [-83.97303499793635, 34.55047325623666],
    pinNote: 'Exact reference pin supplied by Adi: 34.550473, −83.973035. The pin locates the project; it does not define the parcel boundary or proposed building footprint.',
    reading: 'Read the site against the surrounding road network, mapped woodland and water. The landscape view isolates the natural context around the wellness and learning programme.',
    sources: [{title:'Dahlonega · Lumpkin County',url:'https://www.lumpkincounty.gov/'}],
  },
  'habersham-hall': {
    title: 'Historic fabric, new gathering',
    place: 'Habersham Hall · Savannah, Georgia',
    center: [-81.0892701, 32.0744346],
    pinNote: 'OSM building reference for Habersham Hall at 235 Habersham Street, cross-checked against SCAD’s official address.',
    reading: 'Existing buildings, streets and landscape around Habersham Hall.',
    sources: [{title:'Habersham Hall · SCAD',url:'https://www.scad.edu/life/buildings-and-facilities/habersham-hall'}],
  },
  'karshid-resort-and-homestay': {
    title: 'Project location',
    place: 'Karshid Beach Resort · Alibag, India',
    center: [72.9061639969247, 18.44055106031501],
    pinNote: 'Exact project reference supplied by Adi on 26 October 2026. It identifies the location, not a surveyed plot boundary.',
    reading: 'Existing buildings, streets, water and landscape around the project.',
    sources: [],
  },
  'siddharth-municipal-general-hospital': {
    title: 'Project location',
    place: 'Siddharth Nagar · Goregaon, Mumbai',
    center: [72.84020363855329, 19.15943318972379],
    pinNote: 'Exact project reference supplied by Adi on 26 October 2026. It identifies the location, not a surveyed plot boundary.',
    reading: 'Existing buildings, streets, water and landscape around the project.',
    sources: [],
  },
  'mumbai-masshousing': {
    title: 'Project location',
    place: 'Siddharth Nagar · Goregaon, Mumbai',
    center: [72.84020363855329, 19.15943318972379],
    pinNote: 'Exact project reference supplied by Adi on 26 October 2026. It identifies the location, not a surveyed plot boundary.',
    reading: 'Existing buildings, streets, water and landscape around the project.',
    sources: [],
  },
};
