import { describe, it, expect } from 'vitest';

// getMention logic extracted for testing
function getMention(score: number): string {
  if (score >= 900) return 'Excellence';
  if (score >= 750) return 'Très bien';
  if (score >= 600) return 'Bien';
  if (score >= 450) return 'Passable';
  return 'Non certifié';
}

function computeScore(correct: number, total: number): number {
  return Math.round((correct / total) * 1000);
}

describe('Certification scoring', () => {
  it('returns 1000 for a perfect score', () => {
    expect(computeScore(80, 80)).toBe(1000);
  });

  it('returns 0 for no correct answers', () => {
    expect(computeScore(0, 80)).toBe(0);
  });

  it('returns proportional score', () => {
    expect(computeScore(40, 80)).toBe(500);
    expect(computeScore(60, 80)).toBe(750);
    expect(computeScore(72, 80)).toBe(900);
  });
});

describe('Certification mentions', () => {
  it('assigns Excellence for 900+', () => {
    expect(getMention(900)).toBe('Excellence');
    expect(getMention(1000)).toBe('Excellence');
  });

  it('assigns Très bien for 750-899', () => {
    expect(getMention(750)).toBe('Très bien');
    expect(getMention(899)).toBe('Très bien');
  });

  it('assigns Bien for 600-749', () => {
    expect(getMention(600)).toBe('Bien');
    expect(getMention(749)).toBe('Bien');
  });

  it('assigns Passable for 450-599', () => {
    expect(getMention(450)).toBe('Passable');
    expect(getMention(599)).toBe('Passable');
  });

  it('assigns Non certifié below 450', () => {
    expect(getMention(449)).toBe('Non certifié');
    expect(getMention(0)).toBe('Non certifié');
  });
});
