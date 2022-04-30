import Services from '../src/services';
import { Result, createException } from 'ism-common';
import Repository from '../src/repository';

describe('getLastEvents', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

  const sampleConfig = {
    clientEventsSnapshotFrequency: 2,
  };

  it('Error getting events', async () => {
    jest
      .spyOn(Repository, 'queryLastEvents')
      .mockResolvedValue(Result.err(createException('DB_READ_ERR')));

    const [err, data] = await Services.getLastEvents(sampleClientId, sampleConfig);

    expect(err?.exception).toBe('DB_READ_ERR');
    expect(data).toBe(undefined);
  });

  it('Retrieved events array is empty', async () => {
    jest.spyOn(Repository, 'queryLastEvents').mockResolvedValue(Result.ok([]));

    const [err, data] = await Services.getLastEvents(sampleClientId, sampleConfig);

    expect(err?.exception).toBe('CLIENT_NOT_FOUND');
    expect(data).toBe(undefined);
  });

  it('Retrieved events not do not contain snapshot', async () => {
    jest.spyOn(Repository, 'queryLastEvents').mockResolvedValue(
      Result.ok([
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
      ])
    );

    const [err, data] = await Services.getLastEvents(sampleClientId, sampleConfig);

    expect(err?.exception).toBe('CLIENT_EVENTS_DONT_CONTAIN_SNAPSHOT');
    expect(data).toBe(undefined);
  });

  it('Get last events', async () => {
    jest.spyOn(Repository, 'queryLastEvents').mockResolvedValue(
      Result.ok([
        {
          Id: sampleClientId,
          Version: 4,
          Action: 'SNAPSHOT',
          Contribution: 200000,
          Compensation: 150000,
          Timestamp: sampleTimestamp,
        },
        {
          Id: sampleClientId,
          Version: 6,
          Action: 'COMPENSATION',
          Amount: 100000,
          Timestamp: sampleTimestamp,
        },
      ])
    );

    const [err, data] = await Services.getLastEvents(sampleClientId, sampleConfig);

    expect(err).toBe(undefined);
    expect(data).toEqual({
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
          Version: 6,
          Action: 'COMPENSATION',
          Amount: 100000,
          Timestamp: sampleTimestamp,
        },
      ],
    });
  });
});
