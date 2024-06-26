import { Card } from './app/services/deck.service';

export function randomNumber(a: number, b: number): number {
  if (a >= b) {
    throw new Error("a must be less than b");
  }

  const range = b - a;

  return Math.random() * range + a;
}

export function printCard(card: Card | undefined): string {
  if (!card) {
    return 'undefined';
  }

  return `${card.color} ${card.type.name}`;
}
