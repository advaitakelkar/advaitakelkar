#!/usr/bin/env node
/**
 * Sorts candidate Powerhouse programmes (section 1.5) with Jev (TypeSafe). For each programme
 * Jev judges: free or paid, how long a visit takes, whether it keeps running all day without
 * depending on who charges, and how much it serves the neighbourhood. Read-only: prints a
 * table, or JSON with --json. The judgements sort the list; the thesis makes the choice.
 *
 *   aihub run typesafe -- node scripts/jev-programmes.mjs [--json]
 *
 * The candidates come from charging and roadside precedents (Gridserve Braintree, Rove Santa
 * Ana, Love's dog parks, Jubitz dog wash, Audi charging hub, JAJA Park 'n' Play, Foster +
 * Partners and Nissan, BIG Västerås and Marengo) plus programmes the thesis adds.
 */
const KEY = process.env.TYPESAFE_API_KEY;
if (!KEY) {
  console.error('TYPESAFE_API_KEY not set. Run: aihub run typesafe -- node scripts/jev-programmes.mjs');
  process.exit(1);
}

const SITE =
  'The Powerhouse: a public EV charging stop on a former parking lot, in an area where electric vehicle adoption is rising. ' +
  'Charging takes 20 to 60 minutes; truck drivers may stop for a 30-minute break or a 10-hour rest. ' +
  'Part of the site is always open ground for anyone, whether or not they charge. Paid programmes pay rent that keeps charging free and the open ground looked after. ' +
  'The programme is chosen for what the neighbourhood lacks; charging is the outcome, the programme is the reason people come.';

// Forty architectural programmes: rooms and grounds the building holds, not services like
// Wi-Fi or water. No two do the same job.
const PROGRAMMES = [
  'Public restrooms', 'Waiting lounge', 'Covered plaza', 'Children’s playground', 'Outdoor gym', 'Dog park',
  'Community hall', 'Rooftop park', 'Community garden', 'Library reading room', 'Repair workshop and tool library',
  'Sports court', 'Amphitheatre and event lawn', 'Exhibition gallery', 'Cooling and emergency shelter', 'Bike hub',
  'Prayer and quiet room', 'Youth centre',
  'Café', 'Food hall', 'Convenience store', 'Grocery', 'Market hall', 'Post and parcel room', 'Laundromat', 'Gym',
  'Barber and salon', 'Health clinic', 'Pharmacy', 'Childcare centre', 'Co-working space',
  'Drivers’ hostel with showers, beds and kitchen', 'Car wash', 'Pet grooming salon', 'Pet daycare', 'Veterinary clinic',
  'Pet supplies shop', 'Artist studios', 'Learning centre', 'Dance and yoga studio',
];

const QUESTIONS = {
  pricing: {
    type: 'choice',
    instructions: 'At the site described in `site`, how should `programme` most naturally be offered?',
    criteria: {
      free: 'Free to use and open to anyone, paid for by the site',
      paid: 'Paid by the people who use it, run by a tenant or operator that pays rent',
    },
  },
  stay: {
    type: 'choice',
    instructions: 'How long does a typical visit to `programme` take for one person at the site in `site`?',
    criteria: {
      quick: 'Under about 20 minutes',
      charge: 'About 20 to 60 minutes, the length of one charge',
      rest: 'Longer than an hour, up to a working day or a night',
    },
  },
  always_running: {
    type: 'noul',
    instructions: 'Would `programme` stay busy across the whole day and week from neighbourhood demand alone, even with no one charging a vehicle at the site in `site`?',
  },
  community: {
    type: 'score',
    instructions: 'How much does `programme` serve the everyday life of people who live and work near the site in `site`, rather than only passing drivers?',
    criteria: [
      'Serves passing drivers only',
      'Mostly drivers, occasionally locals',
      'Used by drivers and locals alike',
      'Mainly an everyday amenity for the neighbourhood',
    ],
  },
};

async function judge(programme) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'jev-latest', state: { site: SITE, programme }, questions: QUESTIONS }),
    });
    if (res.ok) return res.json();
    if (res.status !== 429 && res.status < 500) throw new Error(`TypeSafe ${res.status}: ${await res.text()}`);
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  throw new Error('TypeSafe request failed after retries');
}

const rows = [];
for (let i = 0; i < PROGRAMMES.length; i += 8) {
  const batch = PROGRAMMES.slice(i, i + 8);
  rows.push(
    ...(await Promise.all(
      batch.map(async (programme) => {
        const a = (await judge(programme)).answers;
        return {
          programme,
          pricing: a.pricing.choice, pricingP: a.pricing.confidence,
          stay: a.stay.choice, stayP: a.stay.confidence,
          alwaysRunning: a.always_running.noul,
          community: a.community.score,
        };
      })
    ))
  );
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log('programme                                     pricing  stay    always  community');
  for (const r of rows) {
    console.log(`${r.programme.padEnd(45)} ${r.pricing.padEnd(7)}  ${r.stay.padEnd(6)}  ${r.alwaysRunning.toFixed(2).padStart(6)}  ${r.community.toFixed(1).padStart(9)}`);
  }
  console.log('\nalways: probability it stays busy without charging (0–1) · community: 0–3, higher serves locals more');
}
