import { LastEvents } from '../models';
import { Result, Exception, createException } from 'ism-common';
import { logger } from '../lib';
import Repository from '../repository';
import { getEventsAfterSnapshot } from './utils';

/**
 * Gets `clientEventsSnapshotFrequency` last client events.
 */
export const getLastEvents = async (
  clientId: string,
  config: { clientEventsSnapshotFrequency: number }
): Promise<
  Result.Variant<
    LastEvents,
    Exception<'DB_READ_ERR' | 'CLIENT_NOT_FOUND' | 'CLIENT_EVENTS_DONT_CONTAIN_SNAPSHOT'>
  >
> => {
  const [queryErr, items] = await Repository.queryLastEvents(
    clientId,
    config.clientEventsSnapshotFrequency
  );

  if (queryErr) {
    logger.error(`Error querying client events. Client id: ${clientId}`);
    return Result.err(createException('DB_READ_ERR', queryErr.source));
  }

  if (items!.length === 0) {
    logger.warn(`Client not found. Client id: ${clientId}`);
    return Result.err(createException('CLIENT_NOT_FOUND'));
  }

  const [err, eventsAfterSnapshot] = getEventsAfterSnapshot(items!);

  if (err) {
    logger.error(`Client events dont contain snapshot. Client id: ${clientId}`);
    return Result.err(createException('CLIENT_EVENTS_DONT_CONTAIN_SNAPSHOT'));
  }

  return Result.ok(eventsAfterSnapshot);
};
