import { ClientEvent } from '../../src/models';
import { retrieveClientState } from '../../src/services/utils';

describe('retrieveClientState', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

  const sampleSnapshot: ClientEvent = {
    Id: sampleClientId,
    Version: 4,
    Action: 'SNAPSHOT',
    Contribution: 100000,
    Compensation: 0,
    Timestamp: sampleTimestamp,
  };

  const sampleEvents: ClientEvent[] = [
    {
      Id: sampleClientId,
      Version: 5,
      Action: 'CONTRIBUTION',
      Amount: 20000,
      Timestamp: sampleTimestamp,
    },
    {
      Id: sampleClientId,
      Version: 6,
      Action: 'COMPENSATION',
      Amount: 150000,
      Timestamp: sampleTimestamp,
    },
  ];

  it('Retrieve client state', () => {
    const result = retrieveClientState({
      snapshot: sampleSnapshot,
      eventsAfterSnapshot: sampleEvents,
    });

    expect(result).toEqual({
      Id: sampleClientId,
      Contribution: 120000,
      Compensation: 150000,
    });
  });
});
