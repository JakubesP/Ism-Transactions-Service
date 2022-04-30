import Services from '../src/services';
import { Result, createException } from 'ism-common';
import Repository from '../src/repository';

describe('initiateClient', () => {
  const sampleClientId = '1dcdbc5e-6b32-4247-9401-9a5b130def9e';
  const sampleTimestamp = 1651154238800;

  it('Conflict adding client initiation events', async () => {
    jest
      .spyOn(Repository, 'createClientInitiationEvents')
      .mockResolvedValue(Result.err(createException('CONFLICT')));

    const [err, data] = await Services.initiateClient(
      {
        clientId: sampleClientId,
        contribution: 0,
        compensation: 0,
      },
      sampleTimestamp
    );

    expect(err?.exception).toBe('CONFLICT');
    expect(data).toBe(undefined);
  });

  it('Error adding client initiation events', async () => {
    jest
      .spyOn(Repository, 'createClientInitiationEvents')
      .mockResolvedValue(Result.err(createException('DB_WRITE_ERR')));

    const [err, data] = await Services.initiateClient(
      {
        clientId: sampleClientId,
        contribution: 0,
        compensation: 0,
      },
      sampleTimestamp
    );

    expect(err?.exception).toBe('DB_WRITE_ERR');
    expect(data).toBe(undefined);
  });

  it('Initiate client', async () => {
    jest.spyOn(Repository, 'createClientInitiationEvents').mockResolvedValue(Result.ok(undefined));

    const [err, data] = await Services.initiateClient(
      {
        clientId: sampleClientId,
        contribution: 0,
        compensation: 0,
      },
      sampleTimestamp
    );

    expect(err).toBe(undefined);
    expect(data).toEqual({
      Id: sampleClientId,
      Contribution: 0,
      Compensation: 0,
    });
  });
});
