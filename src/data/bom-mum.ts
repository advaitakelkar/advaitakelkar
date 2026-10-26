/* Bombay Then, Mumbai Now — the B.Arch thesis timeline, as data.

   Transcribed from the 2018 poster (portfolio PDF, page 3) and checked
   against the record. Where the poster's date was wrong the event carries
   the corrected year and `was:` keeps what the poster printed, so the
   change is visible rather than silent. Events the poster did not have
   but the study needs are marked `added: true`.

   The timeline is Bombay's: it runs from the first settlements to 1995,
   the year the city was renamed Mumbai. Nothing after that belongs here.

   Lanes are the poster's five disciplines, outermost ring first. */

export type LaneId = 'cinema' | 'culture' | 'infrastructure' | 'science' | 'politics';

/* Flat editorial palette, following Julien Nolin's History of Brazil
   reference. Bands run from charcoal outside to warm coral inside;
   population is the sixth, innermost band. */
export const LANES: Array<{ id: LaneId; name: string; color: string; from: string; to: string }> = [
  { id: 'politics', name: 'Politics + Conflicts', color: '#303132', from: '#303132', to: '#303132' },
  { id: 'cinema', name: 'Cinema', color: '#93618f', from: '#93618f', to: '#93618f' },
  { id: 'science', name: 'Science + Technology', color: '#54b9cb', from: '#54b9cb', to: '#54b9cb' },
  { id: 'culture', name: 'Culture + Art', color: '#88cbb2', from: '#88cbb2', to: '#88cbb2' },
  { id: 'infrastructure', name: 'Infrastructure', color: '#f3cd67', from: '#f3cd67', to: '#f3cd67' },
];

export interface BomEvent {
  year: number;            // negative = BC
  lane: LaneId;
  title: string;
  text?: string;
  circa?: boolean;         // the date is approximate
  key?: boolean;           // one of the poster's black circles
  was?: string;            // what the poster printed, where it differed
  added?: boolean;         // not on the poster
}

export const EVENTS: BomEvent[] = [
  // ── Before the Portuguese ────────────────────────────────────────────
  { year: -600, lane: 'culture', circa: true, title: 'First permanent settlements', text: 'The Marathi-speaking Koli and Agri fishing communities are the earliest known inhabitants of the islands.' },
  { year: -300, lane: 'politics', circa: true, title: "Part of Ashoka's Mauryan Empire", text: 'The islands fall within the Mauryan Empire; the Satavahanas, Vakatakas, Kalachuris, Chalukyas and Rashtrakutas follow.' },
  { year: 810, lane: 'politics', title: 'The Silhara dynasty rules Bombay', text: 'Silhara rule lasts until about 1260. The kings build the first Walkeshwar temple on Malabar Hill; Gharapuri (Elephanta) is their capital.' },
  { year: 1127, lane: 'culture', title: 'Banganga Tank built', text: 'Built by Lakshman Prabhu, a minister at the Silhara court, beside the Walkeshwar temple on Malabar Hill.', was: '1172' },
  { year: 1294, lane: 'politics', circa: true, title: 'Raja Bhimdev makes Mahim his capital', text: 'He sets up Mahikawati (present-day Mahim) with a palace, a court and a temple at Prabhadevi. The Pathare Prabhus, Bhois, Agris and Vadvals arrive with him.', was: '1300' },
  { year: 1348, lane: 'politics', title: 'Islands taken by the Muslim rulers of Gujarat', text: 'Bombay passes from the Hindu kings of Mahim to the governors of Gujarat.', was: '1343' },
  { year: 1391, lane: 'politics', title: 'Muzaffar Shah I made viceroy', text: 'Appointed viceroy of North Konkan; his Muzaffarid dynasty, the Gujarat Sultanate, holds the islands until 1534.' },
  { year: 1400, lane: 'politics', circa: true, title: 'The Bhandaris seize Mahim', text: 'They take Mahim from the Sultanate and hold it for eight years.' },
  { year: 1429, lane: 'politics', title: 'Seat of government moves to Mahim', text: 'The Gujarat Sultanate transfers its regional seat of government from Thane to Mahim.' },
  { year: 1431, lane: 'culture', title: 'Haji Ali Dargah built', text: 'The shrine of Pir Haji Ali Shah Bukhari, on an islet off Worli reached by a causeway at low tide.' },
  { year: 1508, lane: 'politics', title: "Almeida's ship names the harbour Bom Bahia", text: 'Francisco de Almeida sails into the deep natural harbour and calls it Bom Bahia, the good bay.' },
  { year: 1509, lane: 'politics', title: 'The Portuguese land at Mahim', text: 'Their first visit, after capturing a Gujarati barge in the Mahim creek.' },
  { year: 1534, lane: 'politics', key: true, title: 'Treaty of Bassein', text: 'Sultan Bahadur Shah of Gujarat cedes the seven islands to the Portuguese, who call one of them Bombaim.' },

  // ── The British ──────────────────────────────────────────────────────
  { year: 1661, lane: 'politics', key: true, title: 'The islands pass to the British Crown', text: 'Part of the dowry of Catherine of Braganza on her marriage to Charles II. The Portuguese garrison at Bassein refuses to give up Salsette, Parel, Worli and Mazagaon.' },
  { year: 1665, lane: 'politics', title: 'The English take possession', text: 'Humphrey Cooke accepts the Portuguese viceroy’s narrow definition of Bombay, which leaves out Mahim and its custom house.' },
  { year: 1668, lane: 'politics', title: 'East India Company leases Bombay', text: 'Charles II leases the seven islands to the Company for £10 a year.' },
  { year: 1668, lane: 'infrastructure', title: 'Reclamation first proposed', text: 'Company servants note that the centre of the island lies under water; Gerald Aungier, governor from 1672, presses the case.' },
  { year: 1670, lane: 'science', title: 'First printing press', text: 'Imported by the Parsi businessman Bhimjee Parikh.' },
  { year: 1675, lane: 'culture', title: 'Mumba Devi temple built', text: 'Near the main landing site on Bori Bunder, against the north wall of the English fort. The city is named for the goddess.' },
  { year: 1687, lane: 'politics', added: true, title: 'Company headquarters move from Surat to Bombay', text: 'Bombay becomes the seat of the East India Company on the west coast.' },
  { year: 1708, lane: 'infrastructure', title: 'Reclamation begins at Mahim', text: 'Five embankments with sluices are built across the inlets to the north so the land drains at low tide.', was: '1709' },
  { year: 1711, lane: 'infrastructure', title: 'Three embankments finished', text: 'Two at the north end of Parel and one between Parel and Mahim.' },
  { year: 1712, lane: 'infrastructure', title: 'Mahim and Worli embankments completed' },
  { year: 1720, lane: 'infrastructure', title: 'Embankment proposed at the Great Breach', text: 'Proposed by Elias Bates, to stop the sea flooding the low ground between Worli and Malabar Hill.' },
  { year: 1736, lane: 'science', title: 'Lovji Wadia starts shipbuilding in Bombay', text: 'The Company brings the Surat shipwright to Bombay; the Wadia yards make it a naval port.', was: '1709' },
  { year: 1750, lane: 'science', key: true, title: "Asia's first dry dock", text: 'The Bombay Dock, built by Lovji Wadia and his brother Sorabji.' },
  { year: 1772, lane: 'infrastructure', title: 'Second phase of reclamation', text: 'A bund fills the shallows between Parel, Worli, Bombay, Mahim and Mazagaon, stopping the flooding of central Bombay and joining Mahalaxmi to Worli.' },
  { year: 1780, lane: 'science', title: 'First printed calendar', text: 'Rustomji Keshaspathi prints Bombay’s first calendar — the start of local printing.', was: '1777, as the first newspaper' },
  { year: 1789, lane: 'culture', title: 'The Bombay Herald', text: 'The first newspaper published in Bombay.', added: true },
  { year: 1784, lane: 'infrastructure', key: true, title: 'Hornby Vellard closes the Great Breach', text: 'Begun by Governor William Hornby without the Company’s sanction — remembered as the city’s oldest unauthorised construction — at a cost of Rs 1,00,000.' },
  { year: 1793, lane: 'infrastructure', title: 'Bellasis Road built', text: 'Joins Mazagaon to Malabar Hill; reclaimed dockland around it becomes the mill district for the next century.' },
  { year: 1801, lane: 'culture', title: 'Siddhivinayak temple built', text: 'At Prabhadevi.' },
  { year: 1803, lane: 'politics', key: true, title: 'The Great Fire of Bombay', text: 'A fire destroys almost a third of the town’s houses. Afterwards the authorities rebuild the town outside the Fort walls, reshaping the city and uprooting communities.' },
  { year: 1810, lane: 'science', title: 'HMS Minden floated', text: 'The first Royal Navy ship built outside the British Isles. The Star-Spangled Banner was written aboard her in 1814.' },
  { year: 1822, lane: 'culture', key: true, title: 'Bombay Samachar', text: 'The first vernacular newspaper in Bombay, a Gujarati daily founded by Fardunjee Marzban — India’s oldest newspaper still in print.' },
  { year: 1833, lane: 'infrastructure', title: 'Town Hall completed', text: 'Home of the Asiatic Society of Bombay.' },
  { year: 1838, lane: 'culture', title: 'Bombay Times launched', text: 'The Bombay Times and Journal of Commerce, later The Times of India.' },
  { year: 1840, lane: 'infrastructure', title: 'Bank of Bombay founded', text: 'Joint-stock banking arrives in the city.' },
  { year: 1845, lane: 'science', title: 'Grant Medical College founded' },
  { year: 1845, lane: 'infrastructure', title: 'Mahim Causeway completed', text: 'Links Bombay to Salsette; funded by Lady Jeejeebhoy.' },
  { year: 1853, lane: 'infrastructure', key: true, title: 'First railway line in Asia', text: 'Bori Bunder to Thane, 16 April 1853 — 34 km of the Great Indian Peninsula Railway.' },
  { year: 1854, lane: 'science', key: true, title: "India's first textile mill", text: 'The Bombay Spinning and Weaving Company, set up by Cowasjee Nanabhoy Davar — the first steam-powered mill in India.' },
  { year: 1855, lane: 'culture', title: 'Victoria and Albert Museum founded', text: 'Bombay’s first museum, opened 1872; renamed the Dr. Bhau Daji Lad Museum in 1975.', was: '1855 as the Prince of Wales Museum; 1955 as Dr Bhau Daji Lad Museum' },
  { year: 1857, lane: 'culture', title: 'University of Bombay established' },
  { year: 1857, lane: 'culture', added: true, title: 'Sir J.J. School of Art founded', text: 'Endowed by Sir Jamsetjee Jeejeebhoy.' },
  { year: 1858, lane: 'culture', title: 'Afghan Church consecrated', text: 'St John the Evangelist, Colaba, built to remember the dead of the First Anglo-Afghan War.', was: '1842' },
  { year: 1858, lane: 'infrastructure', title: 'Chartered Bank opens in Bombay', text: 'The Chartered Bank of India, Australia and China.' },
  { year: 1862, lane: 'infrastructure', title: 'The Fort walls come down', text: 'Governor Bartle Frere demolishes the walls; the town spreads north and the tanks up to Parel are filled.' },
  { year: 1864, lane: 'infrastructure', title: 'BB&CI Railway reaches Bombay', text: 'The Bombay, Baroda and Central India Railway, later merged into the Western Railway.' },
  { year: 1865, lane: 'politics', title: 'The cotton bubble bursts', text: 'The American Civil War ends, cotton prices collapse and the Back Bay Reclamation Company is liquidated.' },
  { year: 1869, lane: 'infrastructure', title: 'Suez Canal opens', text: 'The voyage to England shortens by weeks and Bombay becomes the gateway to India.' },
  { year: 1870, lane: 'culture', title: 'David Sassoon Library', text: 'Library and reading room at Kala Ghoda, funded by Sir David Sassoon.', was: '1789' },
  { year: 1872, lane: 'politics', added: true, title: 'Bombay Municipal Act', text: 'Drafted by Pherozeshah Mehta; the charter of the city’s self-government.' },
  { year: 1873, lane: 'infrastructure', title: 'Bombay Port Trust formed', was: '1870' },
  { year: 1875, lane: 'infrastructure', title: 'Bombay Stock Exchange founded', text: 'As the Native Share and Stock Brokers’ Association — Asia’s oldest stock exchange.' },
  { year: 1882, lane: 'science', added: true, title: 'First telephone exchange' },
  { year: 1887, lane: 'science', title: 'VJTI established', text: 'Victoria Jubilee Technical Institute, the first institute offering degrees in engineering.' },
  { year: 1888, lane: 'infrastructure', key: true, title: 'Victoria Terminus completed', text: 'F.W. Stevens’ Gothic terminus for the Great Indian Peninsula Railway, ten years in the building.', was: '1887' },
  { year: 1888, lane: 'politics', title: 'Bombay Municipal Corporation Act', text: 'The Brihanmumbai Municipal Corporation takes its modern form.' },
  { year: 1890, lane: 'politics', title: 'Lord Harris becomes Governor', text: 'Robert Harris, 4th Baron Harris, takes over the Presidency of Bombay.' },
  { year: 1893, lane: 'politics', title: 'Hindu–Muslim riots', text: 'The city’s first major sectarian riots.' },
  { year: 1893, lane: 'culture', added: true, title: 'Ganeshotsav becomes public', text: 'Lokmanya Tilak turns Ganesh Chaturthi into a public festival; by 1920 crowds come from across the city to Chinchpokli.' },
  { year: 1896, lane: 'cinema', key: true, title: 'First film screening in India', text: 'The Lumière brothers’ Cinématographe at Watson’s Hotel, 7 July 1896.' },
  { year: 1896, lane: 'politics', key: true, title: 'Famine, then bubonic plague', text: 'At its peak the plague kills nearly 3,000 a week; half the city flees to the countryside, emptying the 1901 census.' },
  { year: 1897, lane: 'science', title: 'Haffkine’s plague vaccine', text: 'Waldemar Haffkine tests it on himself, then on volunteers from Byculla Jail.' },
  { year: 1899, lane: 'science', title: 'Plague Research Laboratory', text: 'Haffkine’s laboratory moves to Parel — today the Haffkine Institute.' },
  { year: 1903, lane: 'culture', title: 'Taj Mahal Palace Hotel opens', text: 'Built by Jamsetji Tata.' },
  { year: 1907, lane: 'science', added: true, title: 'First electric tram', text: 'BEST’s electric trams replace horse-drawn ones.' },
  { year: 1911, lane: 'politics', title: 'King George V and Queen Mary land at Bombay', text: 'The visit the Gateway of India was built to commemorate.' },
  { year: 1912, lane: 'cinema', title: 'Shree Pundalik', text: 'N.G. Chitre and R.G. Torney’s film of a Marathi play — the first Indian feature-length story film.' },
  { year: 1913, lane: 'cinema', key: true, title: 'Raja Harishchandra', text: 'Dadasaheb Phalke’s film, released 3 May 1913 at the Coronation Cinema — the first full-length Indian feature. Phalke is remembered as the father of Indian cinema.' },
  { year: 1913, lane: 'culture', title: 'Sydenham College', text: 'The first college of commerce in Asia.' },
  { year: 1915, lane: 'politics', key: true, title: 'Gandhi returns to India', text: 'He lands at Apollo Bunder from South Africa on 9 January 1915.' },
  { year: 1917, lane: 'infrastructure', title: 'Back Bay reclamation proposed', text: 'Citizens and private companies propose reclaiming 1,500 acres between Colaba and Back Bay; the Development Directorate plans 1,145.' },
  { year: 1918, lane: 'cinema', title: 'Cinematograph Act; Kohinoor Film Company', text: 'The Act comes into force and the Kohinoor Film Company is founded in Bombay.' },
  { year: 1920, lane: 'cinema', title: 'Film censorship begins', text: 'The Bombay Board of Film Censors is set up.' },
  { year: 1922, lane: 'culture', title: 'Prince of Wales Museum opens', text: 'George Wittet’s museum, today the Chhatrapati Shivaji Maharaj Vastu Sangrahalaya.', added: true },
  { year: 1924, lane: 'culture', key: true, title: 'Gateway of India completed', text: 'George Wittet’s arch at Apollo Bunder.', was: '1911' },
  { year: 1925, lane: 'infrastructure', title: 'First electric train', text: 'Victoria Terminus to Kurla, 3 February 1925; Churchgate to Borivali follows in 1928.', was: '1928' },
  { year: 1926, lane: 'infrastructure', title: 'First motor bus', text: 'BEST runs it from Afghan Church to Crawford Market.' },
  { year: 1929, lane: 'infrastructure', title: 'Back Bay blocks completed', text: '439.6 acres in four blocks; 234.8 sold to the military, 16.6 taken into Marine Drive and its sea wall. Delays and the depression ran the cost to four times the estimate.' },
  { year: 1930, lane: 'culture', title: 'Mumbai Cricket Association established' },
  { year: 1931, lane: 'cinema', key: true, title: 'Alam Ara, the first Indian talkie', text: 'Ardeshir Irani’s film premieres at the Majestic Cinema, 14 March 1931.' },
  { year: 1933, lane: 'cinema', title: 'Regal Cinema opens', text: 'Bombay’s first air-conditioned cinema. The same year V. Shantaram’s Sairandhri is processed in Germany — the first Indian colour film.' },
  { year: 1934, lane: 'cinema', added: true, title: 'Bombay Talkies founded', text: 'By Himanshu Rai and Devika Rani in Malad.' },
  { year: 1934, lane: 'politics', title: 'Congress Socialist Party founded', text: 'At its first conference in Bombay.' },
  { year: 1937, lane: 'cinema', title: 'Amar Jyoti at Venice', text: 'The first Indian film shown at an international film festival.', was: '1936' },
  { year: 1939, lane: 'cinema', title: 'The film industry’s silver jubilee', text: 'Celebrated with a Motion Picture Congress, conferences and an exhibition.' },
  { year: 1940, lane: 'infrastructure', title: 'Reclamation that becomes Nariman Point begins' },
  { year: 1942, lane: 'politics', key: true, title: 'Quit India', text: 'The resolution is passed at Gowalia Tank Maidan on 8 August 1942.' },
  { year: 1944, lane: 'politics', key: true, title: 'The Bombay Explosion', text: 'The freighter Fort Stikine, loaded with cotton, timber, explosives and gold, catches fire at Victoria Dock. Two blasts shatter windows eight miles away; hundreds of dock workers and firemen are killed.' },
  { year: 1944, lane: 'cinema', title: 'Dadasaheb Phalke dies' },
  { year: 1945, lane: 'science', added: true, title: 'Tata Institute of Fundamental Research', text: 'Founded by Homi Bhabha.' },
  { year: 1946, lane: 'politics', added: true, title: 'Royal Indian Navy mutiny', text: 'Ratings strike in Bombay harbour in February 1946.' },
  { year: 1947, lane: 'culture', title: 'Progressive Artists’ Group', text: 'Souza, Raza, Husain, Ara, Bakre and Gade.' },
  { year: 1948, lane: 'cinema', title: 'Raj Kapoor founds R.K. Films', text: 'Its first film, Aag, stars Kapoor and Nargis.' },
  { year: 1951, lane: 'cinema', title: 'Film Federation of India', text: 'Founded the same year as the Central Board of Film Censors.' },
  { year: 1952, lane: 'cinema', title: 'First International Film Festival of India', text: 'Forty feature films from 21 countries screened in Bombay.' },
  { year: 1954, lane: 'cinema', title: 'First Filmfare Awards', was: '1953' },
  { year: 1954, lane: 'science', added: true, title: 'Atomic Energy Establishment, Trombay', text: 'Homi Bhabha’s institute, later the Bhabha Atomic Research Centre.' },
  { year: 1958, lane: 'science', title: 'IIT Bombay established' },
  { year: 1960, lane: 'politics', key: true, title: 'Bombay becomes capital of Maharashtra', text: 'On 1 May 1960 the bilingual Bombay State splits; the city goes to the new Marathi-speaking state.' },
  { year: 1960, lane: 'cinema', title: 'Mughal-e-Azam', text: 'K. Asif’s epic, ten years in the making.' },
  { year: 1964, lane: 'infrastructure', title: 'The last tram', text: 'Its final run from Bori Bunder to Dadar, 31 March 1964.' },
  { year: 1966, lane: 'politics', added: true, title: 'Shiv Sena founded', text: 'By Bal Thackeray.' },
  { year: 1968, lane: 'cinema', title: 'Bombay cinemas close in protest', text: 'Against the Maharashtra state taxation policy.' },
  { year: 1969, lane: 'culture', title: 'National Centre for the Performing Arts', text: 'Founded at Nariman Point.' },
  { year: 1969, lane: 'cinema', title: 'Devika Rani wins the first Dadasaheb Phalke Award' },
  { year: 1971, lane: 'culture', title: 'Cymroza Art Gallery' },
  { year: 1972, lane: 'science', added: true, title: 'Television comes to Bombay', text: 'Doordarshan’s Bombay station opens on 2 October 1972.' },
  { year: 1975, lane: 'cinema', title: 'Sholay premieres', text: 'At the Minerva — India’s first 70mm stereophonic film, which ran for five years.' },
  { year: 1975, lane: 'politics', title: 'The Emergency', text: 'Strict censorship laws under the Emergency imposed by Indira Gandhi.' },
  { year: 1977, lane: 'science', title: 'Nehru Planetarium opens', text: 'At Worli.', was: '1884' },
  { year: 1980, lane: 'cinema', title: 'NFDC formed', text: 'The National Film Development Corporation, headquartered in Bombay.' },
  { year: 1982, lane: 'politics', key: true, title: 'The Great Bombay Textile Strike', text: 'On 18 January 1982 over 250,000 mill workers walk out under Datta Samant. A year later some 80 mills have shut and more than 150,000 workers are out of work.' },
  { year: 1982, lane: 'cinema', title: 'Gandhi released in India', text: 'Attenborough’s film becomes the most popular foreign film at the Bombay box office.', was: '1983' },
  { year: 1992, lane: 'politics', key: true, title: 'The Bombay riots', text: 'December 1992 to January 1993: around 900 die and tens of thousands flee the city.' },
  { year: 1993, lane: 'politics', key: true, title: 'The serial bomb blasts', text: '12 March 1993: thirteen bombs across the city kill 257 people.' },
  { year: 1993, lane: 'cinema', title: 'Sanjay Dutt arrested', text: 'Production halts on the twelve films he is working on.' },
  { year: 1995, lane: 'politics', key: true, title: 'Bombay renamed Mumbai', text: 'The end of this timeline.' },
  // ── Added in the second research pass (Oct 2026) ─────────────────────
  { year: 1804, lane: 'culture', added: true, title: 'Literary Society of Bombay founded', text: 'Founded by Sir James Mackintosh; it becomes the Asiatic Society of Bombay and moves into the Town Hall.' },
  { year: 1826, lane: 'science', added: true, title: 'Colaba Observatory', text: 'An astronomical observatory at Colaba; magnetic and weather records follow from 1841.' },
  { year: 1838, lane: 'infrastructure', added: true, title: 'Colaba Causeway completed', text: 'Joins Colaba and Old Woman’s Island to Bombay — the last of the southern islands.' },
  { year: 1860, lane: 'infrastructure', added: true, title: 'Vihar Lake supplies the city', text: 'Bombay’s first piped water supply, from a dam in Salsette.' },
  { year: 1864, lane: 'culture', added: true, title: 'Flora Fountain', text: 'Built where the Fort’s Church Gate stood; renamed Hutatma Chowk after 1960.' },
  { year: 1869, lane: 'culture', added: true, title: 'Crawford Market opens', text: 'With a frieze designed by John Lockwood Kipling.' },
  { year: 1874, lane: 'infrastructure', added: true, title: 'Horse-drawn trams', text: 'The Bombay Tramway Company runs its first line, Colaba to Pydhonie, on 9 May 1874.' },
  { year: 1875, lane: 'culture', added: true, title: 'Bombay Gymkhana founded' },
  { year: 1878, lane: 'culture', added: true, title: 'Rajabai Tower completed', text: 'Gilbert Scott’s clock tower for the University, paid for by Premchand Roychand.' },
  { year: 1880, lane: 'infrastructure', added: true, title: 'Prince’s Dock opens', text: 'The first of the Port Trust’s wet docks; Victoria Dock follows in 1888.' },
  { year: 1883, lane: 'science', added: true, title: 'Bombay Natural History Society', text: 'Founded on 15 September 1883.' },
  { year: 1885, lane: 'politics', added: true, key: true, title: 'Indian National Congress founded', text: 'Its first session meets at Gokuldas Tejpal Sanskrit College, Bombay, on 28 December 1885; Dadabhai Naoroji and Pherozeshah Mehta are among the founders.' },
  { year: 1892, lane: 'infrastructure', added: true, title: 'Tansa water scheme', text: 'Water from the Tansa dam reaches the city.' },
  { year: 1898, lane: 'infrastructure', added: true, title: 'Bombay Improvement Trust', text: 'Set up after the plague to clear slums and lay new roads and housing.' },
  { year: 1899, lane: 'cinema', added: true, title: 'The first film made by an Indian', text: 'Harishchandra Sakharam Bhatavdekar films a wrestling match at the Hanging Gardens.' },
  { year: 1908, lane: 'politics', added: true, title: 'Mill strike for Tilak', text: 'Mill workers strike for six days when Lokmanya Tilak is sentenced for sedition — India’s first political strike.' },
  { year: 1911, lane: 'culture', added: true, title: 'Royal Opera House opens', text: 'Inaugurated by George V; completed in 1916.' },
  { year: 1914, lane: 'infrastructure', added: true, title: 'Alexandra Dock opens', text: 'Today the Indira Dock.' },
  { year: 1915, lane: 'science', added: true, title: 'Hydroelectric power reaches Bombay', text: 'From the Tata power station at Khopoli, powering the mills.' },
  { year: 1921, lane: 'politics', added: true, title: 'Riots during the Prince of Wales’ visit', text: 'The boycott of his landing in November 1921 turns violent.' },
  { year: 1927, lane: 'science', added: true, title: 'Radio broadcasting begins', text: 'The Indian Broadcasting Company opens its Bombay station on 23 July 1927.' },
  { year: 1928, lane: 'politics', added: true, title: 'The great textile strike of 1928', text: 'Led by the Girni Kamgar Union; six months long.' },
  { year: 1928, lane: 'infrastructure', added: true, title: 'Juhu aerodrome', text: 'Home of the Bombay Flying Club; India’s first civil airport.' },
  { year: 1932, lane: 'science', added: true, title: 'Tata Air Lines’ first flight', text: 'J.R.D. Tata flies the mail from Karachi to Juhu on 15 October 1932 — the start of Air India.' },
  { year: 1936, lane: 'cinema', added: true, title: 'Achhut Kanya', text: 'Bombay Talkies’ film with Devika Rani and Ashok Kumar, on caste and love.' },
  { year: 1937, lane: 'culture', added: true, title: 'Brabourne Stadium opens' },
  { year: 1938, lane: 'culture', added: true, title: 'Eros Cinema', text: 'The Art Deco landmark at Churchgate.' },
  { year: 1946, lane: 'cinema', added: true, title: 'Neecha Nagar wins at Cannes', text: 'Chetan Anand’s film shares the Grand Prix at the first Cannes Film Festival.' },
  { year: 1950, lane: 'politics', added: true, title: 'Greater Bombay', text: 'The suburbs join the city; more land follows in 1957.' },
  { year: 1951, lane: 'cinema', added: true, title: 'Awaara', text: 'Raj Kapoor’s film becomes a hit from the Soviet Union to Turkey.' },
  { year: 1952, lane: 'culture', added: true, title: 'Jehangir Art Gallery', text: 'Opened at Kala Ghoda; the city’s gallery for contemporary art.' },
  { year: 1955, lane: 'politics', added: true, key: true, title: 'Samyukta Maharashtra firing', text: 'Police fire on protesters at Flora Fountain on 21 November 1955; the movement for a Marathi state with Bombay as its capital loses 106 lives before 1960.' },
  { year: 1956, lane: 'science', added: true, title: 'Apsara, Asia’s first nuclear reactor', text: 'Goes critical at Trombay on 4 August 1956.' },
  { year: 1957, lane: 'cinema', added: true, title: 'Mother India', text: 'Mehboob Khan’s film — India’s first submission for the Academy Award, nominated in 1958.' },
  { year: 1970, lane: 'infrastructure', added: true, title: 'New Bombay planned', text: 'CIDCO is set up to build a twin city across the harbour, from a plan by Charles Correa, Pravina Mehta and Shirish Patel.' },
  { year: 1972, lane: 'politics', added: true, title: 'Dalit Panthers founded', text: 'By Namdeo Dhasal, J.V. Pawar and Raja Dhale, on 29 May 1972.' },
  { year: 1973, lane: 'cinema', added: true, title: 'Zanjeer', text: 'Amitabh Bachchan’s “angry young man” arrives.' },
  { year: 1974, lane: 'culture', added: true, title: 'Wankhede Stadium opens' },
  { year: 1977, lane: 'cinema', added: true, title: 'Film City, Goregaon', text: 'The Dadasaheb Phalke Chitranagari studio complex opens.' },
  { year: 1978, lane: 'culture', added: true, title: 'Prithvi Theatre, Juhu', text: 'Built by Shashi Kapoor and Jennifer Kendal in memory of Prithviraj Kapoor.' },
  { year: 1988, lane: 'cinema', added: true, title: 'Salaam Bombay!', text: 'Mira Nair’s film of the city’s street children wins the Caméra d’Or at Cannes.' },
  { year: 1989, lane: 'infrastructure', added: true, title: 'Jawaharlal Nehru Port opens', text: 'At Nhava Sheva, across the harbour, on 26 May 1989.' },
  { year: 1995, lane: 'cinema', added: true, title: 'Dilwale Dulhania Le Jayenge', text: 'Released in October 1995; it runs at the Maratha Mandir for more than twenty years.' },
];


/* The leaders who shaped Bombay — the poster's top row. */
export const LEADERS = [
  { id: 'jeejeebhoy', first: 'Sir Jamsetjee', last: 'Jeejeebhoy', years: '1783–1859', text: 'His gifts to the city included a school of art and a hospital. In 1851 alone he paid for enlarging a tank, the J.J. Obstetric Hospital, a School of Industry, and two roads joining Mount Mary Church at Bandra to the Mahim Causeway.' },
  { id: 'sassoon', first: 'Sir David', last: 'Sassoon', years: '1792–1864', text: 'Built a synagogue and schools for juvenile offenders and for technical education. His son Albert built the Sassoon Dock at Colaba between 1872 and 1875; the David Sassoon Library stands near the University.' },
  { id: 'seth', first: 'Jagannath Shankar', last: 'Seth', years: '1803–1865', text: 'Gave his time and money to education, political and social reform and civic affairs. A founder of the School Society and the Native School of Bombay, the first of its kind in western India.' },
  { id: 'jehangir', first: 'Sir Cowasji', last: 'Jehangir', years: '1812–1878', text: 'Paid for a convocation hall, an ophthalmic hospital, an art gallery and forty drinking fountains; many of the city’s schools owe their existence to him.' },
  { id: 'roychand', first: 'Seth Premchand', last: 'Roychand', years: '1831–1906', text: 'The “Cotton King” of Bombay, remembered for the Rajabai Tower and the University Library he gave the city.' },
  { id: 'tata', first: 'Jamsetji Nusserwanji', last: 'Tata', years: '1839–1904', text: 'Founder of the Tata group and pioneer of India’s iron and steel industry; he built the Taj Mahal Hotel. The “Father of Indian Industry”.' },
  { id: 'mehta', first: 'Sir Pherozeshah', last: 'Mehta', years: '1845–1915', text: 'Wrote the Municipal Act of 1872, the charter of Bombay’s municipality; helped found the Central Bank and the Bombay Chronicle.' },
  { id: 'phalke', first: 'Dhundiraj Govind', last: 'Phalke', years: '1870–1944', text: 'The “Father of Indian Cinema”: 95 feature films and 26 shorts in a nineteen-year career, beginning with Raja Harishchandra in 1913.' },
  { id: 'ambedkar', first: 'Bhimrao Ramji', last: 'Ambedkar', years: '1891–1956', text: 'Jurist, economist and reformer who led the Dalit movement and campaigned for the rights of women and labour; India’s first law minister and principal architect of its Constitution.' },
  { id: 'bhabha', first: 'Dr. Homi Jehangir', last: 'Bhabha', years: '1909–1966', text: 'Nuclear physicist, founding director of the Tata Institute of Fundamental Research — the father of India’s nuclear programme.' },
];

/* The portraits set around the ring, at the year they mark. */
export const FIGURES = [
  { id: 'aungier', name: 'Gerald Aungier', years: '1640–1677', year: 1672, role: 'Governor of Bombay, 1672–77' },
  { id: 'frere', name: 'Sir Bartle Frere', years: '1815–1884', year: 1862, role: 'Governor who pulled down the Fort walls' },
  { id: 'scott', name: 'Sir Gilbert Scott', years: '1811–1878', year: 1874, role: 'University of Bombay and the Rajabai Tower' },
  { id: 'naoroji', name: 'Dadabhai Naoroji', years: '1825–1917', year: 1885, role: 'A founder of the Indian National Congress' },
  { id: 'stevens', name: 'F. W. Stevens', years: '1847–1900', year: 1888, role: 'Architect of Victoria Terminus' },
  { id: 'tilak', name: 'Lokmanya Tilak', years: '1856–1920', year: 1893, role: 'Made Ganeshotsav a public festival' },
  { id: 'haffkine', name: 'Waldemar Haffkine', years: '1860–1930', year: 1897, role: 'Plague vaccine' },
  { id: 'begg', name: 'John Begg', years: '1866–1937', year: 1909, role: 'General Post Office' },
  { id: 'gandhi', name: 'Mahatma Gandhi', years: '1869–1948', year: 1915, role: 'Returned to India at Apollo Bunder' },
  { id: 'wittet', name: 'George Wittet', years: '1878–1926', year: 1924, role: 'Prince of Wales Museum; Gateway of India' },
  { id: 'irani', name: 'Ardeshir Irani', years: '1886–1969', year: 1931, role: 'Alam Ara, the first Indian talkie' },
  { id: 'jrdtata', name: 'J. R. D. Tata', years: '1904–1993', year: 1932, role: 'Flew the first Tata Air Lines mail' },
  { id: 'devikarani', name: 'Devika Rani', years: '1908–1994', year: 1936, role: 'Bombay Talkies' },
  { id: 'husain', name: 'M. F. Husain', years: '1915–2011', year: 1947, role: 'Progressive Artists’ Group' },
  { id: 'rajkapoor', name: 'Raj Kapoor', years: '1924–1988', year: 1951, role: 'R. K. Films; Awaara' },
  { id: 'correa', name: 'Charles Correa', years: '1930–2015', year: 1970, role: 'Planner of New Bombay' },
  { id: 'samant', name: 'Datta Samant', years: '1932–1997', year: 1982, role: 'Led the Great Bombay Textile Strike' },
];

/* Portrait sources. Public-domain and openly licensed images from
   Wikimedia Commons, downloaded Oct 2026. Jeejeebhoy, Aungier, Wittet,
   Begg and Samant are crops from the thesis poster: no free portrait of
   them could be found. */
export const CREDITS = [
  { id: 'sassoon', file: "David Sassoon (Published in 1884).jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:David_Sassoon_(Published_in_1884).jpg" },
  { id: 'seth', file: "Jagannath Sunkersett.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Jagannath_Sunkersett.jpg" },
  { id: 'jehangir', file: "Sir Cowasji Jehangir Readymoney (1812-1878).jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Sir_Cowasji_Jehangir_Readymoney_(1812-1878).jpg" },
  { id: 'roychand', file: "Premchand Roychand.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Premchand_Roychand.jpg" },
  { id: 'tata', file: "Sir J. N. Tata (cropped).jpg", license: "CC BY 4.0", url: "https://commons.wikimedia.org/wiki/File:Sir_J._N._Tata_(cropped).jpg" },
  { id: 'mehta', file: "PhirozeshahMehta.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:PhirozeshahMehta.jpg" },
  { id: 'phalke', file: "Phalke.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Phalke.jpg" },
  { id: 'ambedkar', file: "Dr. Bhimrao Ambedkar.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Dr._Bhimrao_Ambedkar.jpg" },
  { id: 'bhabha', file: "Homi Jehangir Bhabha 1960s.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Homi_Jehangir_Bhabha_1960s.jpg" },
  { id: 'scott', file: "George Gilbert Scott.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:George_Gilbert_Scott.jpg" },
  { id: 'frere', file: "Sir (Henry) Bartle Frere, 1st Bt by Sir George Reid.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Sir_(Henry)_Bartle_Frere,_1st_Bt_by_Sir_George_Reid.jpg" },
  { id: 'stevens', file: "Frederick William Stevens.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Frederick_William_Stevens.jpg" },
  { id: 'haffkine', file: "Waldemar Haffkine 2.jpg", license: "CC BY 4.0", url: "https://commons.wikimedia.org/wiki/File:Waldemar_Haffkine_2.jpg" },
  { id: 'tilak', file: "Bal Gangadhar Tilak (1856-1920).webp", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Bal_Gangadhar_Tilak_(1856-1920).webp" },
  { id: 'naoroji', file: "Dadabhai Naoroji 1889.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Dadabhai_Naoroji_1889.jpg" },
  { id: 'gandhi', file: "Mahatma-Gandhi, studio, 1931.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Mahatma-Gandhi,_studio,_1931.jpg" },
  { id: 'irani', file: "Ardeshir Irani.jpg", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Ardeshir_Irani.jpg" },
  { id: 'rajkapoor', file: "Raj Kapoor 2001 stamp of India (cropped).jpg", license: "GODL-India", url: "https://commons.wikimedia.org/wiki/File:Raj_Kapoor_2001_stamp_of_India_(cropped).jpg" },
  { id: 'jrdtata', file: "J.R.D. Tata (1955).jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:J.R.D._Tata_(1955).jpg" },
  { id: 'devikarani', file: "Devika Rani in Nirmala (1938).jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:Devika_Rani_in_Nirmala_(1938).jpg" },
  { id: 'husain', file: "MFHussain2.jpg", license: "Public domain", url: "https://commons.wikimedia.org/wiki/File:MFHussain2.jpg" },
  { id: 'correa', file: "Charles Correa.jpg", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Charles_Correa.jpg" },
];

/* Census population of the city (Greater Bombay from 1951). */
export const POPULATION: Array<[number, number]> = [
  [1661, 10000], [1675, 60000], [1780, 113726], [1814, 221550], [1864, 816562],
  [1872, 644405], [1881, 773196], [1891, 821764], [1901, 776006], [1911, 979445],
  [1921, 1175914], [1931, 1161383], [1941, 1489883], [1951, 2966902], [1961, 4152056],
  [1971, 5970575], [1981, 8243405], [1991, 9925891],
];

/* Bombay + Textile — the poster's left column. */
export const TEXTILE = [
  { when: '1669–77', text: 'Gerald Aungier, Governor of Bombay and President at Surat, draws up a charter of rights between the islanders and the Company — the “Magna Carta” of Bombay. “It is a city which, by God’s assistance, is intended to be built.”' },
  { when: '1853', text: 'Private property and a capitalist land market take shape. Government foras land makes the railways possible; the first 34 km of the Great Indian Peninsula Railway, to Thane, carries cotton, sugar, silk and opium out and salt in.' },
  { when: '22 Feb 1854', text: 'Cowasjee Nanabhoy Davar sets up the Bombay Spinning and Weaving Company, India’s first steam-powered mill, on Rs 5 lakh; within ten years seventeen mills are spinning. The mills draw Marathi workers into chawls around them.' },
  { when: '1861–65', text: 'The American Civil War cuts off cotton from the southern states. England, which took 20% of its cotton from India, turns to Bombay; by 1865 the city has earned £70 million.' },
  { when: '1870', text: '13 mills, 31 banks, 8 reclamation companies, 16 cotton presses, 10 shipping firms, 20 insurers and 62 joint-stock companies.' },
  { when: '1880s', text: '32 mills employ some 20,000 workers — 76,000 by the plague of 1896, more than 150,000 by the early 1920s, a fifth to a quarter of them women.' },
  { when: 'Early 20th century', text: 'Between two coastlines, Girangaon — “the village of mills” — grows up around the workers; a new wave of migrants arrives from the Konkan.' },
  { when: '1925', text: '81 mills, almost all Indian-owned; only 14 are British.' },
  { when: '1945', text: 'INTUC creates the Rashtriya Mill Mazdoor Sangh, which sides with the owners through the 1950s to 1970s.' },
  { when: '1953', text: 'After the war, under competition from Japan, the mills decline.' },
  { when: '1982', text: 'Datta Samant leads the Great Bombay Textile Strike; by its end more than 50 mills have closed, wholly or in part.' },
  { when: '1991', text: 'DCR 58: mill land is to be split a third each to open space, public housing and commercial use.' },
  { when: '1996', text: 'Charles Correa’s committee plans the mill lands as a whole; its report is never made public. A new rule asks only a third of the land for open space and housing.' },
  { when: '2003', text: 'The final split: about 4% of the land goes to low-cost housing, 5% to public space, and 90% stays with the mill owners.' },
];

export const ESSAYS = [
  { title: 'Bombay Samachar', text: 'The first printing press reached Bombay in 1670, imported by the Parsi businessman Bhimjee Parikh, but it was more than a hundred years before the first newspaper. The early papers were owned and printed by Parsis, who had the technology and the capital; Rustomji Keshaspathi printed the first calendar in 1780, and the Bombay Herald, the first newspaper, followed in 1789. The first vernacular paper was the Gujarati daily Mumbai Samachar, published in 1822 by Fardoonjee Marzban.' },
  { title: 'Bombay Dry Dock', text: 'Lovji Nusserwanjee Wadia (1702–1774), a Parsi shipwright from Surat, won contracts from the East India Company in 1736 to build ships and docks in Bombay, founding the Wadia group. The Bombay dry dock — the first in Asia — was built by Lovji and his brother Sorabji in 1750 and made Bombay a strategic port for Britain in Asia.' },
  { title: 'Migrants + Bombay', text: 'Mumbai is Hindu, Muslim, Christian, Buddhist, Jain, Parsi, Sikh and Jewish. People came from within India — Maharashtra, Gujarat, Goa, Kerala, Punjab, Sind, Rajasthan, Uttar Pradesh — often as single men, and from Iran, China and Africa. They settled where their community could feed, clothe and house them: Maharashtrians in Parel and Dadar, Gujaratis in Kalbadevi and Bhuleshwar, Muslims along Mohammed Ali Road and in Mahim, Christians in Byculla and Mazagaon. The most desirable neighbourhoods, like Malabar Hill, are the most mixed.' },
  { title: 'Architecture + Bombay', text: 'Bombay moved from Gothic to Indo-Saracenic to Art Deco, with Portuguese, Dutch, Swiss and Tudor along the way. Gothic Revival was the style of the cotton boom: from 1860 to the end of the century the Fort precinct — the High Court, the Rajabai Tower and the University buildings by Sir Gilbert Scott — was built in it. St Thomas Cathedral, the first Anglican church, was begun under Gerald Aungier and opened on Christmas Day 1718.' },
  { title: 'Chhatrapati Shivaji Terminus', text: 'When the terminus was planned, Gothic was at its height across the Empire, and its architect reached for a cathedral: gargoyles spouting rain in the monsoon, stone animals on the walls, crests over the entrance, marble columns and Minton-tiled floors. The octagonal ribbed dome was the first of its kind on a railway station, and the first on any public building in Bombay in the Italian-Gothic style.' },
  { title: 'Bombay Deco', text: 'Art Deco arrived from Paris in the 1930s with Bombay’s travelled middle class and the money of its port. It gave the city the second-largest collection of Deco buildings in the world after Miami — symmetry, geometric and streamlined forms, traditional craft motifs mixed with machine-age imagery.' },
];
