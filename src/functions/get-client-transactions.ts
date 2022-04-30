import { APIGatewayProxyEvent } from 'aws-lambda';
import Services from '../services';
import {
  HttpResult,
  createHttpError,
  createHttpResponse,
  httpHandler,
  validateJoiSchema,
} from 'ism-common';
import {
  ClientTransactionsPaginationParamsDto,
  clientTransactionsPaginationParamsDtoValidationSchema,
} from '../dtos';
import { presentEvent } from '../models';

const getClientTransactionsHandler = async (
  event: APIGatewayProxyEvent
): Promise<HttpResult<object>> => {
  const clientId = event.pathParameters?.id;
  if (!clientId) return createHttpError(400, 'There is not valid id provided');

  const [invalidDataError, paginationProps] =
    await validateJoiSchema<ClientTransactionsPaginationParamsDto>(
      { ...event.queryStringParameters },
      clientTransactionsPaginationParamsDtoValidationSchema
    );

  if (invalidDataError) return createHttpError(422, invalidDataError.source!);

  const [getClientEventsErr, clientEvents] = await Services.getClientTransactions(
    clientId,
    paginationProps!.limit,
    paginationProps!.from
  );

  if (getClientEventsErr) {
    switch (getClientEventsErr.exception) {
      case 'CLIENT_NOT_FOUND':
        return createHttpError(404, 'Client not found');
      default:
        return createHttpError(500, 'Internal server error');
    }
  }

  return createHttpResponse(200, [...clientEvents!.map((event) => presentEvent(event))]);
};

export const handler = httpHandler(getClientTransactionsHandler);
