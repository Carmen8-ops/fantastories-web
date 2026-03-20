export function getRosterMax(participantsCount: number) {
  let baseRosterMax = 2;

  if (participantsCount >= 6 && participantsCount <= 10) {
    baseRosterMax = 3;
  } else if (participantsCount >= 11) {
    baseRosterMax = 5;
  }

  return Math.max(1, Math.min(baseRosterMax, participantsCount - 1));
}