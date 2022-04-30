import { APIGatewayProxyEvent } from 'aws-lambda';
import Services from '../services';
import { HttpResult, createHttpError, createHttpResponse, httpHandler } from 'ism-common';
import { camelizeKeys } from 'ism-common';

const getClientStateHandler = async (event: APIGatewayProxyEvent): Promise<HttpResult<object>> => {
  const clientId = event.pathParameters?.id;
  if (!clientId) return createHttpError(400, 'There is not valid id provided');

  const [getClientStateErr, clientState] = await Services.getClientState(clientId, {
    clientEventsSnapshotFrequency: ~~process.env.CLIENT_EVENTS_SNAPSHOT_FREQUENCY!,
  });

  if (getClientStateErr) {
    switch (getClientStateErr.exception) {
      case 'CLIENT_NOT_FOUND':
        return createHttpError(404, 'Client not found');
      default:
        return createHttpError(500, 'Internal server error');
    }
  }

  return createHttpResponse(200, { ...camelizeKeys(clientState!) });
};

export const handler = httpHandler(getClientStateHandler);
