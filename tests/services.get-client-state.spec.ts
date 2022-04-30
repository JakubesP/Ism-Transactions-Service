import Services from '../src/services';
import { Result, createException } from 'ism-common';

describe('getClientState', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

  const sampleConfig = {
    clientEventsSnapshotFrequency: 3,
  };

  it('Error getting events', async () => {
    jest
      .spyOn(Services, 'getLastEvents')
      .mockResolvedValue(Result.err(createException('DB_READ_ERR')));

    const [err, data] = await Services.getClientState(sampleClientId, sampleConfig);

    expect(err?.exception).toBe('CANNOT_GET_STATE');
    expect(data).toBe(undefined);
  });

  it('Events do not contain snapshot', async () => {
    jest
      .spyOn(Services, 'getLastEvents')
      .mockResolvedValue(Result.err(createException('CLIENT_EVENTS_DONT_CONTAIN_SNAPSHOT')));

    const [err, data] = await Services.getClientState(sampleClientId, sampleConfig);

    expect(err?.exception).toBe('CANNOT_GET_STATE');
    expect(data).toBe(undefined);
  });

  it('Client not found', async () => {
    jest
      .spyOn(Services, 'getLastEvents')
      .mockResolvedValue(Result.err(createException('CLIENT_NOT_FOUND')));

    const [err, data] = await Services.getClientState(sampleClientId, sampleConfig);

    expect(err?.exception).toBe('CLIENT_NOT_FOUND');
    expect(data).toBe(undefined);
  });

  it('Get client state', async () => {
    jest.spyOn(Services, 'getLastEvents').mockResolvedValue(
      Result.ok({
        snapshot: {
          Id: sampleClientId,
          Version: 4,
          Action: 'SNAPSHOT',
          Contribution: 200000,
          Compensation: 150000,
          Timestamp: sampleTimestamp,
        },
        eventsAfterSnapshot: [
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
            Amount: 100000,
            Timestamp: sampleTimestamp,
          },
        ],
      })
    );

    const [err, data] = await Services.getClientState(sampleClientId, sampleConfig);

    expect(Services.getLastEvents).toBeCalledWith(sampleClientId, sampleConfig);

    expect(err).toBe(undefined);
    expect(data).toEqual({
      Id: sampleClientId,
      Contribution: 220000,
      Compensation: 250000,
    });
  });
});
