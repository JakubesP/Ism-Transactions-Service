import { ClientEvent, LastEvents, SnapshotEvent } from '../../src/models';
import { getNewestVersionFromLastEvents } from '../../src/services/utils';

describe('getNewestVersionFromLastEvents', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

  const sampleSnapshot: SnapshotEvent = {
    Id: sampleClientId,
    Action: 'SNAPSHOT',
    Compensation: 100000,
    Contribution: 100000,
    Timestamp: sampleTimestamp,
    Version: 9,
  };

  const sampleEventsAfterSnapshot: ClientEvent[] = [
    {
      Id: sampleClientId,
      Action: 'COMPENSATION',
      Amount: 100000,
      Version: 10,
      Timestamp: sampleTimestamp,
    },
  ];

  it('Get version from snapshot', () => {
    const lastEvents: LastEvents = {
      snapshot: sampleSnapshot,
      eventsAfterSnapshot: [],
    };

    const version = getNewestVersionFromLastEvents(lastEvents);

    expect(version).toBe(9);
  });

  it('Get version from last event after snapshot', () => {
    const lastEvents: LastEvents = {
      snapshot: sampleSnapshot,
      eventsAfterSnapshot: sampleEventsAfterSnapshot,
    };

    const version = getNewestVersionFromLastEvents(lastEvents);

    expect(version).toBe(10);
  });
});
