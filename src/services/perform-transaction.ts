import { ClientState, ClientEvent, TransactionEventType } from '../models';
import Services from './index';
import { addGenericEvent, getNewestVersionFromLastEvents } from './utils';
import { Result, Exception, createException } from 'ism-common';
import repo from '../repository';
import { clientAccessGuard } from './utils';

/**
 * Handle contribution from client or pay compensation to him.
 */
export const performTransaction = async (
  clientId: string,
  amount: number,
  transactionType: TransactionEventType,
  timestamp: number,
  config: { clientEventsSnapshotFrequency: number }
): Promise<
  Result.Variant<
    ClientState,
    Exception<
      'CANNOT_GET_STATE' | 'CLIENT_NOT_FOUND' | 'CONFLICT' | 'DB_WRITE_ERR' | 'DEACTIVATED_CLIENT'
    >
  >
> => {
  const [getEventsErr, lastEvents] = await Services.getLastEvents(clientId, config);

  if (getEventsErr) {
    switch (getEventsErr.exception) {
      case 'CLIENT_NOT_FOUND':
        return Result.err(createException('CLIENT_NOT_FOUND'));
      default:
        return Result.err(createException('CANNOT_GET_STATE'));
    }
  }

  const [guardException] = clientAccessGuard(lastEvents!.eventsAfterSnapshot);

  if (guardException) {
    return Result.err(createException('DEACTIVATED_CLIENT'));
  }

  let lastVersion = getNewestVersionFromLastEvents(lastEvents!);

  const clientContributionEvent: ClientEvent = {
    Id: clientId,
    Action: transactionType,
    Amount: amount,
    Version: lastVersion + 1,
    Timestamp: timestamp,
  };

  const { clientState, eventsToCreate } = addGenericEvent(
    lastEvents!,
    clientContributionEvent,
    timestamp,
    config.clientEventsSnapshotFrequency
  );

  const [createClientErr] = await repo.createGenericEvents(eventsToCreate);

  if (createClientErr) return Result.err(createClientErr);

  return Result.ok(clientState);
};
