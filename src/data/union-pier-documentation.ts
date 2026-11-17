export const chapters = [
  {
    id: 'city', number: '01', title: 'Read the city before drawing the site.', label: 'Charleston',
    groups: ['C Charleston and peninsula studies'],
    paragraphs: [
      'Union Pier sits between the fine grain of Charleston and the broad working surfaces of its port. The project begins by reading that difference in scale: narrow plots and closely spaced streets inland, large sheds and paved yards at the water. The peninsula studies place the site within a wider pattern of neighbourhoods, open spaces and waterfront edges.',
      'Figure-ground, land-use and landscape drawings ask where the city is continuous and where it becomes difficult to cross. The distinction between high ground and made land introduces the coast as a changing ground condition. Together these readings locate the site within the peninsula and give the design a starting point beyond its own boundary.'
    ]
  },
  {
    id: 'transformation', number: '02', title: 'From port ground to a waterfront neighbourhood.', label: 'Before / after',
    groups: ['A Aerials', 'A Before - existing port'],
    paragraphs: [
      'The proposal makes a public sequence across the former port: streets lead into planted courts, the courts open onto a park, and the park reaches the harbour through market terraces and a timber platform. The aerials explain the project as a whole, showing how housing, civic buildings and open ground belong to the same urban structure.',
      'Five paired views compare the existing port with the proposed neighbourhood from corresponding directions. The existing-condition images are AI reconstructions informed by supplied Google Earth screenshots, with approximate camera matching. They show the port as depicted in those references, rather than a verified record of conditions today. The proposal views use the references to bring the surrounding city and water into a more grounded colour palette.'
    ]
  },
  {
    id: 'framework', number: '03', title: 'A network of streets, gardens and public edges.', label: 'Masterplan',
    groups: ['G Plans and axonometrics', 'K Site studies, existing and proposed'],
    paragraphs: [
      'The masterplan extends the city through a series of connected spaces rather than one uninterrupted development parcel. Streets organize the blocks; smaller passages connect their interiors; the central park provides a shared address. Along the harbour, the market and raised platform make the waterfront a destination that can also be crossed and occupied in everyday use.',
      'The site plan and ground cut plan show the relationship between built footprints and open ground. Existing-and-proposed studies then separate building use, green space and movement so that each decision can be read on its own. Together they describe a mixed-use neighbourhood in which smaller everyday routes connect to larger public spaces.'
    ]
  },
  {
    id: 'blocks', number: '04', title: 'Build the neighbourhood from the court outward.', label: 'Blocks / plans',
    groups: ['B Block studies', 'B Block plans'],
    paragraphs: [
      'Each block is a small piece of the larger public-space system. Houses gather around gardens and shared routes. Apartment courts make room for a larger residential scale. Shop blocks hold a more continuous street edge, while the market, church green, museum and port park create distinct civic rooms.',
      'Nine axonometric studies are paired with their corresponding cut plans. The axonometric explains volume, shade and the relationship to adjacent streets; the plan brings attention back to entrances, courts and circulation. The plans interpret simplified model masses, so internal partitions describe an architectural idea rather than resolved room layouts.'
    ]
  },
  {
    id: 'landscape', number: '05', title: 'Let the park connect the daily routes.', label: 'Parks',
    groups: ['P Parks'],
    paragraphs: [
      'Two principal lawns give the neighbourhood a generous shared centre. The lake, the retained Rice Mill façade and the gateway establish different places within that open ground. Trees, paths and terraces create smaller settings for movement and staying, allowing the park to work at the scale of a walk as well as the scale of the masterplan.',
      'The church green and port park extend this landscape sequence toward the southern civic buildings. Their garden edges and level changes connect quieter places to the busier waterfront. Canopy gives the routes shade and enclosure, while clearings keep the civic buildings and waterfront visible.'
    ]
  },
  {
    id: 'sections', number: '06', title: 'The waterfront is a section as much as a plan.', label: 'Sections',
    groups: ['Road sections - section and plan', 'Short road sections', 'X Section perspectives', 'Rendered additional sections'],
    paragraphs: [
      'The strongest changes occur across levels: from the street to the planted slope, from the slope to the market terrace, and from the terrace to the harbour platform. Sectional perspectives reveal the spaces behind the cut, including covered parking, building interiors, tree canopy and the depth of the public routes.',
      'The short studies examine a residential street, two apartment conditions, the park at its monument, the market beside parking and the wall, and the hotel at its garden. The wider site sections trace longer relationships across housing, lawns, civic buildings and the pier. Paired plan strips locate the same spatial sequence from above. The sequence makes the relationship between the occupied surface and the infrastructure beneath it legible.'
    ]
  },
  {
    id: 'experience', number: '07', title: 'Follow the route from a front door to the water.', label: 'Street life',
    groups: ['S Street and storey views'],
    paragraphs: [
      'At street level, the project is experienced through thresholds rather than diagrams. House fronts and apartment courts give way to the park; a ramp leads toward the market; covered edges and the battery-wall platform carry the walk to the pier. These views test the intended character of those transitions.',
      'Shade pavilions, steps and open deck spaces offer different ways of occupying the waterfront. The museum and southern terminal mark another approach from the harbour. People and boats give these scenes a sense of scale, bringing the larger urban proposal back to individual arrivals, crossings and pauses.'
    ]
  },
  {
    id: 'details', number: '08', title: 'Give the public edge a material character.', label: 'Details',
    groups: ['D Details'],
    paragraphs: [
      'The final studies move closer to the elements that give the route its identity: the Rice Mill façade, the museum roof and tower, and the pier pavilion. Masonry holds the urban edges, metal roofs make shaded rooms, and timber gives the water-facing platform a different texture.',
      'These details bring the project back to a human scale. They describe a family of architectural intentions across the neighbourhood while leaving connections, marine durability and construction assemblies to a later stage.'
    ]
  }
];

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
