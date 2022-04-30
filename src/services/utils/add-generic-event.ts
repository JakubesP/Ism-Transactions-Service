import { ClientEvent, LastEvents, ClientState } from '../../models';
import { retrieveClientState } from './retrieve-client-state';

/**
 * Prepares the event to be added to the database.
 * A snapshot is created periodically with regard to `clientEventsSnapshotFrequency`.
 */
export const addGenericEvent = (
  lastEvents: LastEvents,
  newEvent: ClientEvent,
  timestamp: number,
  clientEventsSnapshotFrequency: number
): { clientState: ClientState; eventsToCreate: ClientEvent[] } => {
  const eventsToCreate: ClientEvent[] = [newEvent];

  const clientState: ClientState = retrieveClientState({
    snapshot: lastEvents.snapshot,
    eventsAfterSnapshot: [...lastEvents.eventsAfterSnapshot, newEvent],
  });

  if (lastEvents.eventsAfterSnapshot.length >= clientEventsSnapshotFrequency - 2) {
    eventsToCreate.push({
      ...clientState,
      Version: newEvent.Version + 1,
      Action: 'SNAPSHOT',
      Timestamp: timestamp,
    });
  }

  return { clientState, eventsToCreate };
};
