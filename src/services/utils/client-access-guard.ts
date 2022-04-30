import { ClientEvent } from '../../models';
import { Result } from 'ism-common';

/**
 * Returns provided events if client is not deactivated, else return an exception.
 */
export const clientAccessGuard = (
  events: ClientEvent[]
): Result.Variant<ClientEvent[], 'CLIENT_IS_DEACTIVATED'> => {
  if (events.length === 0) return Result.ok(events);
  if (events[events.length - 1].Action === 'DEACTIVATION')
    return Result.err('CLIENT_IS_DEACTIVATED');
  return Result.ok(events);
};
