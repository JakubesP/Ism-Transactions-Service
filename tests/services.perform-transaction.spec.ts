import Repository from '../src/repository';
import Services from '../src/services';
import { Result, createException } from 'ism-common';
import { LastEvents } from '../src/models';

describe('performTransaction', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;
  const sampleContributionAmount = 100000;

  const sampleConfig = {
    clientEventsSnapshotFrequency: 3,
  };

  const sampleLastEvents: LastEvents = {
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
  };

  it('Database read error', async () => {
    jest
      .spyOn(Services, 'getLastEvents')
      .mockResolvedValue(Result.err(createException('DB_READ_ERR')));

    const [err, data] = await Services.performTransaction(
      sampleClientId,

      sampleContributionAmount,
      'COMPENSATION',
      sampleTimestamp,

      sampleConfig
    );

    expect(err?.exception).toBe('CANNOT_GET_STATE');
    expect(data).toBe(undefined);
  });

  it('Retrieved events do not contain snapshot', async () => {
    jest
      .spyOn(Services, 'getLastEvents')
      .mockResolvedValue(Result.err(createException('CLIENT_EVENTS_DONT_CONTAIN_SNAPSHOT')));

    const [err, data] = await Services.performTransaction(
      sampleClientId,

      sampleContributionAmount,
      'COMPENSATION',
      sampleTimestamp,
      sampleConfig
    );

    expect(err?.exception).toBe('CANNOT_GET_STATE');
    expect(data).toBe(undefined);
  });

  it('Client not found', async () => {
    jest
      .spyOn(Services, 'getLastEvents')
      .mockResolvedValue(Result.err(createException('CLIENT_NOT_FOUND')));

    const [err, data] = await Services.performTransaction(
      sampleClientId,

      sampleContributionAmount,
      'COMPENSATION',
      sampleTimestamp,
      sampleConfig
    );

    expect(err?.exception).toBe('CLIENT_NOT_FOUND');
    expect(data).toBe(undefined);
  });

  it('Client is deactivated', async () => {
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
            Version: 6,
            Action: 'DEACTIVATION',
            Timestamp: sampleTimestamp,
          },
        ],
      })
    );

    const [err, data] = await Services.performTransaction(
      sampleClientId,

      sampleContributionAmount,
      'COMPENSATION',
      sampleTimestamp,
      sampleConfig
    );

    expect(err?.exception).toBe('DEACTIVATED_CLIENT');
    expect(data).toBe(undefined);
  });

  it('Conflict adding new event', async () => {
    jest.spyOn(Services, 'getLastEvents').mockResolvedValue(Result.ok(sampleLastEvents));

    jest
      .spyOn(Repository, 'createGenericEvents')
      .mockResolvedValue(Result.err(createException('CONFLICT')));

    const [err, data] = await Services.performTransaction(
      sampleClientId,

      sampleContributionAmount,
      'COMPENSATION',
      sampleTimestamp,
      sampleConfig
    );

    expect(err?.exception).toBe('CONFLICT');
    expect(data).toBe(undefined);
  });

  it('Error adding new event', async () => {
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
            Version: 6,
            Action: 'COMPENSATION',
            Amount: 100000,
            Timestamp: sampleTimestamp,
          },
        ],
      })
    );

    jest
      .spyOn(Repository, 'createGenericEvents')
      .mockResolvedValue(Result.err(createException('DB_WRITE_ERR')));

    const [err, data] = await Services.performTransaction(
      sampleClientId,
      sampleContributionAmount,
      'COMPENSATION',
      sampleTimestamp,

      sampleConfig
    );

    expect(err?.exception).toBe('DB_WRITE_ERR');
    expect(data).toBe(undefined);
  });

  it('Pay compensation', async () => {
    jest.spyOn(Repository, 'createGenericEvents').mockResolvedValue(Result.ok(undefined));

    const [err, data] = await Services.performTransaction(
      sampleClientId,

      sampleContributionAmount,
      'COMPENSATION',
      sampleTimestamp,

      sampleConfig
    );

    expect(err).toBe(undefined);
    expect(data).toEqual({
      Id: sampleClientId,
      Contribution: 200000,
      Compensation: 350000,
    });
  });

  it('Pay contribution', async () => {
    jest.spyOn(Repository, 'createGenericEvents').mockResolvedValue(Result.ok(undefined));

    const [err, data] = await Services.performTransaction(
      sampleClientId,

      sampleContributionAmount,
      'CONTRIBUTION',
      sampleTimestamp,

      sampleConfig
    );

    expect(err).toBe(undefined);
    expect(data).toEqual({
      Id: sampleClientId,
      Contribution: 300000,
      Compensation: 250000,
    });
  });
});
