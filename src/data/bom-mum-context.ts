import type { BomEvent } from './bom-mum';

// Original timeline text stays in bom-mum.ts. Neighbouring entries provide
// explicit chronology context, rather than invented event-specific detail.
const additions: Record<string, string> = {
  'Mahim and Worli embankments completed': 'The timeline records the completion of the Mahim and Worli embankments in 1712. This belongs to the early sequence of drainage and land-joining works, following the reclamation work recorded at Mahim in 1708 and the three embankments recorded in 1711.',
  'Grant Medical College founded': 'Grant Medical College enters the chronology in 1845 as an institution for medical education. In this study, it is read alongside the development of hospitals, public health and the scientific institutions through which Bombay supported its growing population.',
  'University of Bombay established': 'The University of Bombay was established in 1857. Its place in the timeline connects higher education with the city’s wider formation of libraries, art schools and public institutions; Sir J. J. School of Art is recorded in the same year.',
  'Bombay Port Trust formed': 'The port’s institutional history dates its establishment to 1873. The Port Trust gives the harbour a distinct administrative milestone in a chronology otherwise marked by docks, shipping, railways and reclamation.',
  'First telephone exchange': 'The project chronology records Bombay’s first telephone exchange in 1882. It introduces a communication network into a sequence already shaped by printing, shipping and railways, and adds another way of reading how the city connected people and institutions.',
  'Mumbai Cricket Association established': 'The chronology records the establishment of the cricket association in 1930. Sport is included here as part of cultural infrastructure, alongside the grounds, institutions and shared public experiences that organise urban life.',
  'Reclamation that becomes Nariman Point begins': 'The timeline places the start of reclamation associated with Nariman Point in 1940. It extends the study’s long account of making urban land from the shoreline, following the earlier Back Bay proposals and completed blocks.',
  'Dadasaheb Phalke dies': 'Dadasaheb Phalke died in 1944. The entry closes a personal arc that the timeline opens with Raja Harishchandra in 1913; his name later returns through the national cinema award first presented to Devika Rani in 1969.',
  'First Filmfare Awards': 'The timeline records the first Filmfare Awards in 1954. The event introduces an awards institution into the film chronology, complementing its account of studios, cinemas, production companies and individual films.',
  'IIT Bombay established': 'IIT Bombay enters the chronology in 1958 as an institution for engineering education and research. It is placed among the city’s post-independence scientific institutions, alongside TIFR and the nuclear research establishments at Trombay.',
  'Devika Rani wins the first Dadasaheb Phalke Award': 'The Government of India instituted the Dadasaheb Phalke Award in 1969, and Devika Rani was its first recipient. The entry connects the national recognition of cinema with a figure already present in this study through Bombay Talkies.',
  'Cymroza Art Gallery': 'The timeline records Cymroza Art Gallery in 1971. It belongs to a cultural sequence that includes art education, the Progressive Artists’ Group and Jehangir Art Gallery, extending the study from the making of art to the places where it is shown.',
  'Bombay Gymkhana founded': 'The project chronology dates the founding of Bombay Gymkhana to 1875. The club is included as a social and sporting institution, broadening the culture lane beyond museums, libraries and performance venues.',
  'Brabourne Stadium opens': 'The timeline records the opening of Brabourne Stadium in 1937. The entry places a major sporting venue within the city’s cultural infrastructure; Wankhede Stadium appears later in the same chronology.',
  'Wankhede Stadium opens': 'The timeline records the opening of Wankhede Stadium in 1974. It continues the sporting-venue sequence established by Bombay Gymkhana, the cricket association and Brabourne Stadium, linking organised sport to places of mass gathering.',
};
const sources: Record<string, string> = {
  'Bombay Port Trust formed': 'https://mumbaiport.gov.in/show_content.php?lang=1&level=1&ls_id=1042&lid=56',
  'Dadasaheb Phalke dies': 'https://www.pib.gov.in/FactsheetDetails.aspx?Id=151027&reg=48&lang=1',
  'Devika Rani wins the first Dadasaheb Phalke Award': 'https://www.pib.gov.in/FactsheetDetails.aspx?Id=151027&reg=48&lang=1',
  'Tata Air Lines’ first flight': 'https://www.tata.com/newsroom/wings-for-a-nation',
};
const year = (y: number) => y < 0 ? `${-y} BC` : String(y);
export function eventCopy(event: BomEvent, all: BomEvent[]) {
  const lane = all.filter(e => e.lane === event.lane);
  const at = lane.indexOf(event);
  const previous = lane.slice(0, at).reverse().find(e => e.year < event.year);
  const next = lane.slice(at + 1).find(e => e.year > event.year);
  const context = previous && next
    ? `Timeline context: this entry follows “${previous.title}” (${year(previous.year)}) and precedes “${next.title}” (${year(next.year)}) in the same discipline.`
    : previous ? `Timeline context: this is the final entry in its discipline, following “${previous.title}” (${year(previous.year)}).`
    : next ? `Timeline context: this opens the discipline’s chronology; the next dated milestone is “${next.title}” (${year(next.year)}).` : '';
  let text = additions[event.title] ?? event.text ?? `The project chronology records “${event.title}” in ${year(event.year)}.`;
  if (event.title === 'Tata Air Lines’ first flight') text += ' Tata’s historical account describes the flight as an airmail service in a Puss Moth, landing at Juhu’s mud flats. The airfield’s exposure to monsoon conditions makes this an example of transport infrastructure adapting to the city’s coast.';
  return {text, context, source:sources[event.title] ?? ''};
}
