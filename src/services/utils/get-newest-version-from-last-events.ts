import { LastEvents } from '../../models';

/**
 * Gets the version from last event or from snapshot if there is no following events.
 */
export const getNewestVersionFromLastEvents = (lastEvents: LastEvents): number => {
  const { snapshot, eventsAfterSnapshot } = lastEvents;
  if (eventsAfterSnapshot.length === 0) return snapshot.Version;
  else return eventsAfterSnapshot[eventsAfterSnapshot.length - 1].Version;
};
