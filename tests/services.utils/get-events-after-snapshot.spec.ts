import { ClientEvent } from '../../src/models';
import { getEventsAfterSnapshot } from '../../src/services/utils';

describe('getEventsAfterSnapshot', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

  const sampleSnapshot: ClientEvent = {
    Id: sampleClientId,
    Version: 2,
    Action: 'SNAPSHOT',
    Contribution: 0,
    Compensation: 0,
    Timestamp: sampleTimestamp,
  };

  it('Return expcetion if provided events array is empty', () => {
    const [err, data] = getEventsAfterSnapshot([]);
    expect(err).toBe('EMPTY_ARRAY');
    expect(data).toBe(undefined);
  });

  it('Return exception if provided events array not includes snapshot', () => {
    const [err, data] = getEventsAfterSnapshot([
      {
        Id: sampleClientId,
        Version: 2,
        Action: 'COMPENSATION',
        Amount: 150000,
        Timestamp: sampleTimestamp,
      },
    ]);

    expect(err).toBe('NOT_SNAPSHOT');
    expect(data).toBe(undefined);
  });

  it('Get events after snapshot if provided events array is valid', () => {
    const eventsAfterSnapshot: ClientEvent[] = [
      {
        Id: sampleClientId,
        Version: 2,
        Action: 'CONTRIBUTION',
        Amount: 20000,
        Timestamp: sampleTimestamp,
      },
    ];

    const [err, data] = getEventsAfterSnapshot([
      // First item won't be taken into account becouse it is before snapshot
      {
        Id: sampleClientId,
        Version: 2,
        Action: 'COMPENSATION',
        Amount: 150000,
        Timestamp: sampleTimestamp,
      },
      sampleSnapshot,
      ...eventsAfterSnapshot,
    ]);

    expect(err).toBe(undefined);
    expect(data).toEqual({
      snapshot: sampleSnapshot,
      eventsAfterSnapshot,
    });
  });

  it('Get events after snapshot if provided events array is valid and empty', () => {
    const [err, data] = getEventsAfterSnapshot([
      // First item won't be taken into account becouse it is before snapshot
      {
        Id: sampleClientId,
        Version: 2,
        Action: 'COMPENSATION',
        Amount: 150000,
        Timestamp: sampleTimestamp,
      },
      sampleSnapshot,
    ]);

    expect(err).toBe(undefined);
    expect(data).toEqual({
      snapshot: sampleSnapshot,
      eventsAfterSnapshot: [],
    });
  });
});
