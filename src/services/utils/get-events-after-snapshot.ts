import { ClientEvent, SnapshotEvent, LastEvents } from '../../models';
import { Result } from 'ism-common';

const range = (start: number, end: number) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};

/**
 * Takes the snapshot and the events behind it from an event list.
 */
export const getEventsAfterSnapshot = (
  events: ClientEvent[]
): Result.Variant<LastEvents, 'EMPTY_ARRAY' | 'NOT_SNAPSHOT'> => {
  if (events.length === 0) return Result.err('EMPTY_ARRAY');

  const snapshotIndex = events.findIndex((event) => event.Action === 'SNAPSHOT');
  if (snapshotIndex === -1) return Result.err('NOT_SNAPSHOT');

  const snapshot = events[snapshotIndex] as SnapshotEvent;
  const eventsAfterSnapshot = range(snapshotIndex + 1, events.length).map((index) => events[index]);

  return Result.ok({ snapshot, eventsAfterSnapshot });
};
