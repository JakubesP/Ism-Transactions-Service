import { ClientState } from '../models';
import { Result, Exception, createException } from 'ism-common';
import { retrieveClientState } from './utils';
import Services from './index';

/**
 * Gets current client state.
 */
export const getClientState = async (
  clientId: string,
  config: { clientEventsSnapshotFrequency: number }
): Promise<Result.Variant<ClientState, Exception<'CANNOT_GET_STATE' | 'CLIENT_NOT_FOUND'>>> => {
  const [getEventsErr, lastEvents] = await Services.getLastEvents(clientId, config);

  if (getEventsErr) {
    switch (getEventsErr.exception) {
      case 'CLIENT_NOT_FOUND':
        return Result.err(createException('CLIENT_NOT_FOUND', getEventsErr.source));
      default:
        return Result.err(createException('CANNOT_GET_STATE', getEventsErr.source));
    }
  }

  return Result.ok(retrieveClientState(lastEvents!));
};
