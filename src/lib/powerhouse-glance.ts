// Shapes for the Powerhouse vehicle and charging summaries.
export type Seg = { label: string; value: number; c: 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'grey' | 'light' };
export type StackBar = { title: string; total: number; segs: Seg[]; illustrative?: boolean };
export type Card = { bar: StackBar; big: string; bigLabel: string; why: string; figures?: boolean };
