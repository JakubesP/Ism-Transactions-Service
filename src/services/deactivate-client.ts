import { ClientDeactivationEvent } from '../models';
import Services from './index';
import { getNewestVersionFromLastEvents } from './utils';
import { Result, Exception, createException } from 'ism-common';
import repo from '../repository';

/**
 * Adds deactivation event for the client.
 */
export const deactivateClient = async (
  clientId: string,
  timestamp: number,
  config: { clientEventsSnapshotFrequency: number }
): Promise<
  Result.Variant<
    void,
    Exception<'CANNOT_GET_STATE' | 'CLIENT_NOT_FOUND' | 'CONFLICT' | 'DB_WRITE_ERR'>
  >
> => {
  const [getEventsErr, lastEvents] = await Services.getLastEvents(clientId, config);

  if (getEventsErr) {
    switch (getEventsErr.exception) {
      case 'CLIENT_NOT_FOUND':
        return Result.err(createException('CLIENT_NOT_FOUND', getEventsErr.source));
      default:
        return Result.err(createException('CANNOT_GET_STATE', getEventsErr.source));
    }
  }

  let lastVersion = getNewestVersionFromLastEvents(lastEvents!);

  const clientDeactivationEvent: ClientDeactivationEvent = {
    Id: clientId,
    Action: 'DEACTIVATION',
    Version: lastVersion + 1,
    Timestamp: timestamp,
  };

  const [deactivateClientErr] = await repo.createGenericEvents([clientDeactivationEvent]);

  if (deactivateClientErr) {
    switch (deactivateClientErr.exception) {
      case 'CONFLICT':
        return Result.err(createException('CONFLICT', deactivateClientErr.source));
      default:
        return Result.err(createException('DB_WRITE_ERR', deactivateClientErr.source));
    }
  }

  return Result.ok(undefined);
};
