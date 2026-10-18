// Shapes for the "at a glance" summaries (components/PowerhouseGlance.astro), shared with the
// page that builds them.
export type Seg = { label: string; value: number; c: 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'grey' | 'light' };
export type StackBar = { title: string; total: number; segs: Seg[]; illustrative?: boolean };
export type Card = { bar: StackBar; big: string; bigLabel: string; why: string; figures?: boolean };
