import Services from '../src/services';
import { Result, createException } from 'ism-common';
import { ClientEvent } from '../src/models';
import Repository from '../src/repository';

describe('getClientTransactions', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

  const sampleLimit = 10;

  const sampleEvents: ClientEvent[] = [
    {
      Id: sampleClientId,
      Version: 6,
      Action: 'COMPENSATION',
      Amount: 100000,
      Timestamp: sampleTimestamp,
    },
    {
      Id: sampleClientId,
      Version: 7,
      Action: 'CONTRIBUTION',
      Amount: 150000,
      Timestamp: sampleTimestamp,
    },
  ];

  it('Error getting events', async () => {
    jest
      .spyOn(Repository, 'queryEvents')
      .mockResolvedValue(Result.err(createException('DB_READ_ERR')));

    const [err, data] = await Services.getClientTransactions(sampleClientId, sampleLimit);

    expect(err?.exception).toBe('DB_READ_ERR');
    expect(data).toBe(undefined);
  });

  it('Retrieved events array is empty', async () => {
    jest.spyOn(Repository, 'queryEvents').mockResolvedValue(Result.ok([]));

    const [err, data] = await Services.getClientTransactions(sampleClientId, sampleLimit);

    expect(err).toBe(undefined);
    expect(data).toEqual([]);
  });

  it('Get transactions', async () => {
    jest.spyOn(Repository, 'queryEvents').mockResolvedValue(Result.ok(sampleEvents));

    const [err, data] = await Services.getClientTransactions(sampleClientId, sampleLimit);

    expect(err).toBe(undefined);
    expect(data).toEqual(sampleEvents);
  });
});
