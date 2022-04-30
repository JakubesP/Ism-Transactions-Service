import { createException, Exception, Result } from 'ism-common';
import Repository from '../repository';
import { ClientEvent } from '../models';

/**
 * Returns list of client transactions.
 * @from Timestamp
 */
export const getClientTransactions = async (
  clientId: string,
  limit: number,
  from?: number
): Promise<Result.Variant<ClientEvent[], Exception<'DB_READ_ERR' | 'CLIENT_NOT_FOUND'>>> => {
  const [queryErr, events] = await Repository.queryEvents(clientId, limit, from);

  if (queryErr) return Result.err(queryErr);

  return Result.ok(events);
};
