// UCLA Quarter dates — update yearly
export interface QuarterDateRange {
  moveIn: string;
  moveOut: string;
  label: string;
}

export const UCLA_QUARTERS: Record<string, QuarterDateRange> = {
  winter: { moveIn: '2026-01-05', moveOut: '2026-03-20', label: 'Winter 2026' },
  spring: { moveIn: '2026-03-30', moveOut: '2026-06-12', label: 'Spring 2026' },
  summer: { moveIn: '2026-06-22', moveOut: '2026-09-11', label: 'Summer 2026' },
  fall:   { moveIn: '2026-09-24', moveOut: '2026-12-11', label: 'Fall 2026' },
};

// Given a date range, figure out which UCLA quarters it overlaps with
export function datestoQuarters(moveIn: string, moveOut: string): string[] {
  if (!moveIn || !moveOut) return [];
  
  const start = new Date(moveIn);
  const end = new Date(moveOut);
  
  const matched: string[] = [];
  
  for (const [quarter, range] of Object.entries(UCLA_QUARTERS)) {
    const qStart = new Date(range.moveIn);
    const qEnd = new Date(range.moveOut);
    
    // Overlaps if start <= qEnd AND end >= qStart
    if (start <= qEnd && end >= qStart) {
      matched.push(quarter);
    }
  }
  
  return matched;
}

// Given a quarter, return its date range
export function quarterToDates(quarter: string): { moveIn: string; moveOut: string } | null {
  return UCLA_QUARTERS[quarter] ?? null;
}
