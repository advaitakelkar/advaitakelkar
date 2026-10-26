/** A selected architectural chronology of Bombay through the thesis's 1995
 * cutoff. Periods overlap; opening and completion dates stay distinct. */
export interface ArchitectureMilestone {
  date: string;
  kind: 'Building' | 'Period' | 'Urban ensemble' | 'Conservation';
  title: string;
  style: string;
  note: string;
  detail?: string;
  source: string;
}
const ensembles='https://whc.unesco.org/en/list/1480/';
const museum='https://www.csmvs.in/history.html';
export const ARCHITECTURE: ArchitectureMilestone[] = [
  {date:'c. 5th–6th c.',kind:'Building',title:'Elephanta Caves',style:'Rock-cut architecture',note:'Excavated shrines on Gharapuri bring sculpture, columns and sacred space into the living rock of Mumbai Harbour.',source:'https://whc.unesco.org/en/list/244/'},
  {date:'1718',kind:'Building',title:'St Thomas Cathedral',style:'Early colonial church',note:'Inaugurated on Christmas Day. A place of worship within the fortified town, long before Bombay’s later monumental civic buildings.',detail:'Date marks inauguration.',source:'https://www.stthomascathedralmumbai.com/site/viewPage/7'},
  {date:'Late 19th c.',kind:'Period',title:'Victorian Gothic Revival',style:'The civic city',note:'Public buildings around the Oval Maidan combine Gothic forms with Indian craft and climatic adaptations such as verandas and balconies.',source:ensembles},
  {date:'1878',kind:'Building',title:'Bombay High Court',style:'English Gothic',note:'Completed in November after work began in 1871. J. A. Fuller’s basalt-faced building gives judicial administration a monumental civic presence.',detail:'Completion; court use followed in 1879.',source:'https://bombayhighcourt.gov.in/bhc/vmuseum/Architecture/BHCtour/bombayhc.html'},
  {date:'1878',kind:'Building',title:'Rajabai Tower + University Library',style:'Victorian Gothic',note:'The library and clock tower were completed in November. Premchand Roychand’s gifts helped turn higher education into a visible part of Bombay’s skyline.',detail:'Completion; library opened to readers in 1880.',source:'https://mu.ac.in/old/library.html'},
  {date:'1888',kind:'Building',title:'Victoria Terminus / CSMT',style:'Victorian Gothic Revival',note:'F. W. Stevens’s railway terminus merges Gothic planning and stonework with Indian architectural traditions. Built over ten years from 1878.',source:'https://whc.unesco.org/en/list/945/'},
  {date:'Early 20th c.',kind:'Period',title:'Indo-Saracenic public architecture',style:'A hybrid architectural language',note:'The museum’s domes and architectural composition introduce another language into Bombay’s public buildings. Its construction and public opening are separate milestones below.',source:museum},
  {date:'1903',kind:'Building',title:'The Taj Mahal Palace',style:'Grand hotel on the harbour',note:'Opened on 16 December. Jamsetji Tata’s hotel adds a major hospitality institution to the waterfront, before the later Gateway of India.',detail:'Date marks opening.',source:'https://www.tajhotels.com/en-in/hotels/taj-mahal-palace-mumbai/heritage'},
  {date:'1914',kind:'Building',title:'Prince of Wales Museum / CSMVS',style:'Indo-Saracenic',note:'The museum building was completed in 1914. Completion did not mean immediate public access: the institution opened eight years later.',detail:'Date marks building completion.',source:museum},
  {date:'1922',kind:'Building',title:'CSMVS opens to the public',style:'Architecture becomes a civic institution',note:'The museum opened on 10 January, bringing its galleries and collections into public use. This distinguishes the life of the institution from the date of its building.',detail:'Date marks public opening.',source:museum},
  {date:'1924',kind:'Building',title:'Gateway of India',style:'Waterfront monument',note:'Completed in 1924, the Gateway establishes a monumental threshold between the harbour and the city.',source:'https://maharashtratourism.gov.in/districts/mumbai-city/'},
  {date:'1930s–40s',kind:'Period',title:'Art Deco / Indo-Deco',style:'Apartments, cinemas and modern living',note:'Cinema halls and residential buildings combine Art Deco imagery with Indian design. The western side of the Oval Maidan offers a counterpart to its Gothic eastern edge.',source:ensembles},
  {date:'1933',kind:'Building',title:'Regal Cinema',style:'Art Deco picture palace',note:'Regal marks an early arrival of the Art Deco cinema in Bombay. The picture palace gives modern entertainment a distinct architectural presence.',source:'https://www.artdecomumbai.com/research/a-quest-for-w-m-namjoshi-the-designer-extraordinaire-of-picture-palaces/'},
  {date:'1930s–40s',kind:'Urban ensemble',title:'Marine Drive + Backbay',style:'The residential seafront',note:'Reclamation enables a new sea-facing urban edge. Apartment buildings make Art Deco part of the city’s everyday domestic landscape.',source:ensembles},
  {date:'1938',kind:'Building',title:'Eros Cinema',style:'Art Deco entertainment',note:'Inaugurated in 1938, Eros brings cinema and recreation into a prominent urban building at Churchgate.',source:'https://www.artdecomumbai.com/research/movies-cabarets-a-ladies-band-eros-theatre-and-the-recreational-promise-of-20th-century-bombay/'},
  {date:'1970–83',kind:'Period',title:'A climate-responsive modernism',style:'The bungalow translated vertically',note:'Kanchanjunga develops verandas, interlocking dwellings and terrace gardens as a high-rise response to Bombay’s sun, monsoon and sea breezes.',detail:'Project period; the completed building appears below.',source:'https://charlescorreafoundation.org/2022/03/13/kanchanjunga/'},
  {date:'1977',kind:'Building',title:'Nehru Planetarium',style:'Scientific and cultural infrastructure',note:'Inaugurated on 3 March. The planetarium makes public astronomy education a purpose-built urban destination at the Nehru Centre.',detail:'Date marks inauguration.',source:'https://www.nehrucentremumbai.in/planetarium-shows/'},
  {date:'1980',kind:'Building',title:'Tata Theatre, NCPA',style:'Architecture for performance',note:'Inaugurated on 11 October. The theatre adds a dedicated performance venue to the NCPA, distinct from the institution’s temporary home inaugurated in 1969.',detail:'Date marks theatre inauguration.',source:'https://www.ncpamumbai.com/timeline/'},
  {date:'1983',kind:'Building',title:'Kanchanjunga Apartments',style:'Charles Correa / high-rise housing',note:'Interlocking apartments and deep terrace gardens reinterpret the protective veranda of the bungalow within a residential tower.',detail:'End of the Foundation’s 1970–83 project period.',source:'https://charlescorreafoundation.org/2022/03/13/kanchanjunga/'},
  {date:'1995',kind:'Conservation',title:'Heritage enters the planning framework',style:'From building to precinct',note:'Heritage regulations establish a framework for protecting listed buildings and precincts, including the Fort and Marine Drive ensembles.',detail:'Historical milestone at the thesis’s cutoff.',source:ensembles},
];

// Indicative study windows for comparing coexistence, not exclusive style
// boundaries. Dates are rounded; later survival of a style is not excluded.
export const STYLE_PERIODS = [
  {name:'Rock-cut sacred architecture',start:450,end:600,label:'c. 450–600',color:'#7e7f82'},
  {name:'Early colonial architecture',start:1718,end:1880,label:'c. 1718–1880',color:'#93618f'},
  {name:'Victorian Gothic Revival',start:1860,end:1900,label:'c. 1860–1900',color:'#54b9cb'},
  {name:'Indo-Saracenic',start:1880,end:1930,label:'c. 1880–1930',color:'#88cbb2'},
  {name:'Art Deco / Indo-Deco',start:1930,end:1960,label:'c. 1930–1960',color:'#e2bc53'},
  {name:'Post-independence modernism',start:1947,end:1995,label:'1947–1995 study window',color:'#e78062'},
  {name:'Climate-responsive high-rise',start:1970,end:1995,label:'1970–1995 study window',color:'#7f98d4'},
];
export const MILESTONE_YEARS=[550,1718,1860,1878,1878,1888,1900,1903,1914,1922,1924,1930,1933,1935,1938,1970,1977,1980,1983,1995];
