import { ClientEvent } from '../../src/models';
import { clientAccessGuard } from '../../src/services/utils';

describe('clientAccessGuard', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

  it('Pass events if there is not deactivation event', () => {
    const events: ClientEvent[] = [
      {
        Id: sampleClientId,
        Version: 3,
        Action: 'COMPENSATION',
        Amount: 10000,
        Timestamp: sampleTimestamp,
      },
    ];

    const [err, passedEvents] = clientAccessGuard(events);

    expect(err).toBe(undefined);
    expect(passedEvents).toEqual(events);
  });

  it('Pass events if provided array is empty', () => {
    const events = [];

    const [err, passedEvents] = clientAccessGuard(events);

    expect(err).toBe(undefined);
    expect(passedEvents).toEqual(events);
  });

  it('Client is deactivated', () => {
    const events: ClientEvent[] = [
      {
        Id: sampleClientId,
        Version: 3,
        Action: 'COMPENSATION',
        Amount: 10000,
        Timestamp: sampleTimestamp,
      },
      {
        Id: sampleClientId,
        Version: 3,
        Action: 'DEACTIVATION',
        Timestamp: sampleTimestamp,
      },
    ];

    const [err, passedEvents] = clientAccessGuard(events);

    expect(err).toBe('CLIENT_IS_DEACTIVATED');
    expect(passedEvents).toBe(undefined);
  });
});
