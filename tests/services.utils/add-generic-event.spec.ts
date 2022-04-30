import { LastEvents, ClientEvent } from '../../src/models';
import { addGenericEvent } from '../../src/services/utils';

describe('addGenericEvent', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

  const sampleLastEvents: LastEvents = {
    snapshot: {
      Id: sampleClientId,
      Action: 'SNAPSHOT',
      Compensation: 100000,
      Contribution: 100000,
      Timestamp: sampleTimestamp,
      Version: 9,
    },
    eventsAfterSnapshot: [
      {
        Id: sampleClientId,
        Action: 'COMPENSATION',
        Amount: 100000,
        Timestamp: sampleTimestamp,
        Version: 10,
      },
    ],
  };

  const sampleNewEvent: ClientEvent = {
    Id: sampleClientId,
    Action: 'COMPENSATION',
    Amount: 115000,
    Timestamp: sampleTimestamp,
    Version: 11,
  };

  it('Prepare event to create and retrieve current client state', () => {
    const { clientState, eventsToCreate } = addGenericEvent(
      sampleLastEvents,
      sampleNewEvent,
      sampleTimestamp,
      10
    );

    expect(clientState).toEqual({
      Id: sampleClientId,
      Compensation: 315000,
      Contribution: 100000,
    });

    expect(eventsToCreate).toEqual([sampleNewEvent]);
  });

  it('Prepare event + snapshot to create and retrieve current client state', () => {
    const { clientState, eventsToCreate } = addGenericEvent(
      sampleLastEvents,
      sampleNewEvent,
      sampleTimestamp,
      1
    );

    expect(clientState).toEqual({
      Id: sampleClientId,
      Compensation: 315000,
      Contribution: 100000,
    });

    expect(eventsToCreate).toEqual([
      sampleNewEvent,
      {
        Id: sampleClientId,
        Action: 'SNAPSHOT',
        Compensation: 315000,
        Contribution: 100000,
        Timestamp: sampleTimestamp,
        Version: 12,
      },
    ]);
  });
});
