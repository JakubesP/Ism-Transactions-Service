import { APIGatewayProxyEvent } from 'aws-lambda';
import { PayClientCompensationDto, payClientCompensationDtoValidationSchema } from '../dtos';
import {
  parseJsonToDto,
  createHttpError,
  createHttpResponse,
  HttpResult,
  httpHandler,
} from 'ism-common';
import Services from '../services';
import { camelizeKeys } from 'ism-common';

const payClientCompensationHandler = async (
  event: APIGatewayProxyEvent
): Promise<HttpResult<object>> => {
  const clientId = event.pathParameters?.id;
  if (!clientId) return createHttpError(400, 'There is not valid id provided');

  const [invalidDataError, payCompensationDto] = await parseJsonToDto<PayClientCompensationDto>(
    event.body || '',
    payClientCompensationDtoValidationSchema
  );

  if (invalidDataError) {
    switch (invalidDataError.exception) {
      case 'INVALID_JSON':
        return createHttpError(400, invalidDataError.source!);
      default:
        return createHttpError(422, invalidDataError.source!);
    }
  }

  const [payCompensationErr, clientState] = await Services.performTransaction(
    clientId,
    payCompensationDto!.amount,
    'COMPENSATION',
    Date.now(),
    {
      clientEventsSnapshotFrequency: ~~process.env.CLIENT_EVENTS_SNAPSHOT_FREQUENCY!,
    }
  );

  if (payCompensationErr) {
    switch (payCompensationErr.exception) {
      case 'CONFLICT':
        return createHttpError(409, 'Conflict paying compensation');
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

export const handler = httpHandler(payClientCompensationHandler);
