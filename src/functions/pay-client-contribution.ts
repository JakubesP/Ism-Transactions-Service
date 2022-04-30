import { APIGatewayProxyEvent } from 'aws-lambda';
import { PayClientContributionDto, payClientContributionDtoValidationSchema } from '../dtos';
import {
  parseJsonToDto,
  createHttpError,
  createHttpResponse,
  HttpResult,
  httpHandler,
} from 'ism-common';
import Services from '../services';
import { camelizeKeys } from 'ism-common';

const payClientContributionHandler = async (
  event: APIGatewayProxyEvent
): Promise<HttpResult<object>> => {
  const clientId = event.pathParameters?.id;
  if (!clientId) return createHttpError(400, 'There is not valid id provided');

  const [invalidDataError, payContributionDto] = await parseJsonToDto<PayClientContributionDto>(
    event.body || '',
    payClientContributionDtoValidationSchema
  );

  if (invalidDataError) {
    switch (invalidDataError.exception) {
      case 'INVALID_JSON':
        return createHttpError(400, invalidDataError.source!);
      default:
        return createHttpError(422, invalidDataError.source!);
    }
  }

  const [payContributionErr, clientState] = await Services.performTransaction(
    clientId,
    payContributionDto!.amount,
    'CONTRIBUTION',
    Date.now(),
    {
      clientEventsSnapshotFrequency: ~~process.env.CLIENT_EVENTS_SNAPSHOT_FREQUENCY!,
    }
  );

  if (payContributionErr) {
    switch (payContributionErr.exception) {
      case 'CONFLICT':
        return createHttpError(409, 'Conflict paying contribution');
      case 'CLIENT_NOT_FOUND':
        return createHttpError(404, 'Client not found');
      case 'DEACTIVATED_CLIENT':
        return createHttpError(403, 'Client is deactivated');
      default:
        return createHttpError(500, 'Internal server error');
    }
  }

  return createHttpResponse(200, { ...camelizeKeys(clientState!) });
};

export const handler = httpHandler(payClientContributionHandler);
