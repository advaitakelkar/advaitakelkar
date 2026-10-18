# Powerhouse infrastructure analysis — 18 October 2026

Local page: `/powerhouse/`. Three slides: USA; California/New York/Florida; vehicles and growth. No proposed architectural site or Parkchester analysis. Not published.

## Official sources and scope

- AFDC operating electric-station export, snapshot 2026-10-18: https://developer.nlr.gov/docs/transportation/alt-fuel-stations-v1/all/ . Fifty states and DC, territories excluded. Public: 82,698 stations / 260,991 ports. Private: 5,370 / 29,028. Public Tesla and Tesla Destination: 54,796 ports, including 40,235 DC fast ports. Public access is not public ownership; private excludes the unreported residential inventory. Level 1, Level 2 and DC counts remain separate. Network affiliation does not identify vehicle compatibility.
- AFDC light-duty registrations: https://afdc.energy.gov/vehicle-registration?year=2025 . Extracts for 2016, 2020, 2024 and 2025, rounded to nearest 100. Fuel includes non-plug-in hybrids; BEV and PHEV are separate. Hydrogen and unknown remain outside those categories. The comparable fuel table starts in 2016. Historical BEV CAGR uses 2016–2025, not 2015.
- FHWA 2015 MV-1: https://www.fhwa.dot.gov/policyinformation/statistics/2015/mv1.cfm . California 29,424,012; New York 10,638,765; Florida 16,105,008. These are ALL motor vehicles, including motorcycles, trucks and buses. They are not comparable to AFDC light-duty totals. The requested 2015 fuel split is left unavailable, not estimated. Do not calculate growth across these two series.
- EIA national vehicle electricity: https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=table_d_1 . Calendar 2025 total 23,532,855 MWh; BEV 19,341,255; PHEV 4,191,600. Modeled all-location consumption, not metered public-charger consumption. Cannot divide by public ports to infer public-port use.
- EIA SEDS F56: https://www.eia.gov/state/seds/sep_fuel/html/fuel_eves.html . Current downloaded table describes 2024, million kWh: CA total 5,776; NY 780; FL 1,139. Rounded components may not add to totals. These estimates can be revised; retain the source year separately from the retrieval date.
- NYC DOT pilot: https://www.nyc.gov/mayors-office/news/2024/08/adams-administration-wins-15-million-federal-grant-build-nation-s-largest-municipal-curbside-ev . August 28, 2024 release reports 70% plugged-in occupancy across 100 chargers at 35 sites. This is a local pilot, not New York statewide utilization, and occupancy is not active energy delivery.
- EIA AEO2026 Table 39, Counterfactual Baseline: https://www.eia.gov/outlooks/aeo/supplement/excel/suptab_39.xlsx . National light-duty stock: 2025 270,313,293.457; 2040 315,691,467.285. 2040 BEV 100,450,973.511; PHEV 19,774,513.245; hydrogen 6,670.208. State 2040 totals scale each AFDC 2025 total by the EIA national stock ratio, then apply national 2040 drivetrain shares. This is an ILLUSTRATIVE STATE SCENARIO, not an official state forecast. Assumptions: https://www.eia.gov/outlooks/aeo/narrative/ .

## Geography and refresh

Existing Census-derived US atlas and county boundaries, and NYC borough geometry, are retained. US dots are aggregated into cells and radius capped. State maps show public stations; NYC has borough/type filters. Counts use all eligible records, even if a coordinate cannot be projected. NYC assignments use point-in-polygon matching, not station names.

`src/data/powerhouse-official.json` stores numeric table extracts. `scripts/build-powerhouse-data.mjs` combines these with the official station exports and existing boundaries; its header documents inputs and invocation. `src/data/powerhouse-analysis.json` stores aggregates, map geometry, ranking and source-file SHA-256 hashes. The generator checks that CA/NY/FL remain the top three states by public ports; revise the narrative if a new snapshot changes the ranking. Change the explicit snapshot date when refreshing. Never imply that different-year data form one synchronized snapshot.

## Validation

Production build and style lints pass. Browser checks cover three slides at 390, 834 and 1440 px, no page overflow, navigation/deep links, national access/network filters, and NYC borough/type filtering, with no JavaScript errors.
