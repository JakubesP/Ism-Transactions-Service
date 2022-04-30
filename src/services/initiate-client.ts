import { ClientInitiationEvent, SnapshotEvent, ClientState } from '../models';
import { InitiateClientDto } from '../dtos';
import { Exception, Result } from 'ism-common';
import repo from '../repository';

/**
 * Creates initiation event and first snapshot.
 */
export const initiateClient = async (
  createClientDto: InitiateClientDto,
  timestamp: number
): Promise<Result.Variant<ClientState, Exception<'CONFLICT' | 'DB_WRITE_ERR'>>> => {
  const createEvent: ClientInitiationEvent = {
    Id: createClientDto.clientId,
    Action: 'INITIATION',
    Contribution: createClientDto.contribution,
    Compensation: createClientDto.compensation,
    Version: 1,
    Timestamp: timestamp,
  };

  const snapshotEvent: SnapshotEvent = {
    Id: createClientDto.clientId,
    Action: 'SNAPSHOT',
    Contribution: createClientDto.contribution,
    Compensation: createClientDto.compensation,
    Version: 2,
    Timestamp: timestamp,
  };

  const [eventsCreationError] = await repo.createClientInitiationEvents(createEvent, snapshotEvent);

  if (eventsCreationError) return Result.err(eventsCreationError);

  return Result.ok({
    Id: snapshotEvent.Id,
    Contribution: snapshotEvent.Contribution,
    Compensation: snapshotEvent.Compensation,
  });
};
