import Services from '../services';
import { SNSEvent, SNSHandler } from 'aws-lambda';
import { logger } from '../lib';

export const handler: SNSHandler = async (event: SNSEvent) => {
  const { clientId } = JSON.parse(event.Records[0]?.Sns.Message);
  if (!clientId) {
    logger.error('Cannot get id from received message');
    return;
  }

  const [deactivateClientErr] = await Services.deactivateClient(clientId, Date.now(), {
    clientEventsSnapshotFrequency: ~~process.env.CLIENT_EVENTS_SNAPSHOT_FREQUENCY!,
  });

  if (deactivateClientErr) {
    logger.error(
      `Error deactivating client. Client-id: '${clientId}'. Error: ${deactivateClientErr}.`
    );
    return;
  }
};
