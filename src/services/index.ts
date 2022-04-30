import { initiateClient } from './initiate-client';
import { getLastEvents } from './get-last-events';
import { getClientState } from './get-client-state';
import { getClientTransactions } from './get-client-transactions';
import { deactivateClient } from './deactivate-client';
import { performTransaction } from './perform-transaction';

export default {
  initiateClient,
  getLastEvents,
  getClientState,
  performTransaction,
  getClientTransactions,
  deactivateClient,
};
