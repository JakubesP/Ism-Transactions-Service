import Services from '../src/services';
import { Result, createException } from 'ism-common';
import Repository from '../src/repository';
import { LastEvents } from '../src/models';

describe('getClientState', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

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
  };

  it('Error getting last events', async () => {
    jest
      .spyOn(Services, 'getLastEvents')
      .mockResolvedValue(Result.err(createException('DB_READ_ERR')));

    const [err, data] = await Services.deactivateClient(
      sampleClientId,
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

    const [err, data] = await Services.deactivateClient(
      sampleClientId,
      sampleTimestamp,
      sampleConfig
    );

    expect(err?.exception).toBe('CANNOT_GET_STATE');
    expect(data).toBe(undefined);
  });

  it('Client is deactivated', async () => {
    jest
      .spyOn(Services, 'getLastEvents')
      .mockResolvedValue(Result.err(createException('CLIENT_NOT_FOUND')));

    const [err, data] = await Services.deactivateClient(
      sampleClientId,
      sampleTimestamp,
      sampleConfig
    );

    expect(err?.exception).toBe('CLIENT_NOT_FOUND');
    expect(data).toBe(undefined);
  });

  it('Conflict deactivating client', async () => {
    jest.spyOn(Services, 'getLastEvents').mockResolvedValue(Result.ok(sampleLastEvents));

    jest
      .spyOn(Repository, 'createGenericEvents')
      .mockResolvedValue(Result.err(createException('CONFLICT')));

    const [err, data] = await Services.deactivateClient(
      sampleClientId,
      sampleTimestamp,
      sampleConfig
    );

    expect(err?.exception).toBe('CONFLICT');
    expect(data).toBe(undefined);
  });

  it('Error deactivating client', async () => {
    jest.spyOn(Services, 'getLastEvents').mockResolvedValue(Result.ok(sampleLastEvents));

    jest
      .spyOn(Repository, 'createGenericEvents')
      .mockResolvedValue(Result.err(createException('DB_WRITE_ERR')));

    const [err, data] = await Services.deactivateClient(
      sampleClientId,
      sampleTimestamp,
      sampleConfig
    );

    expect(err?.exception).toBe('DB_WRITE_ERR');
    expect(data).toBe(undefined);
  });

  it('Deactivate client', async () => {
    jest.spyOn(Services, 'getLastEvents').mockResolvedValue(Result.ok(sampleLastEvents));

    jest.spyOn(Repository, 'createGenericEvents').mockResolvedValue(Result.ok(undefined));

    const [err, data] = await Services.deactivateClient(
      sampleClientId,
      sampleTimestamp,
      sampleConfig
    );

    expect(err).toBe(undefined);
    expect(data).toBe(undefined);
  });
});
