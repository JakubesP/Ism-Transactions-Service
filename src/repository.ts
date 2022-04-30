import to from 'await-to-js';
import { logger } from './lib';
import { Result, Exception, createException } from 'ism-common';
import { ClientEvent, ClientInitiationEvent, SnapshotEvent } from './models';
import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const transactionsTableName = process.env.ISM_TRANSACTIONS_TABLE!;

const createGenericEvents = async (
  events: ClientEvent[]
): Promise<Result.Variant<void, Exception<'CONFLICT' | 'DB_WRITE_ERR'>>> => {
  const req: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
    TransactItems: [
      ...events.map((event) => ({
        Put: {
          TableName: transactionsTableName,
          ConditionExpression: 'attribute_not_exists(Version)',
          Item: event,
        },
      })),
    ],
  };

  const [transactionErr] = await to<
    AWS.DynamoDB.DocumentClient.TransactWriteItemsOutput,
    AWS.AWSError
  >(dynamodb.transactWrite(req).promise());

  if (transactionErr) {
    const message = `Cannot perform transactional write. Error: ${transactionErr}. Request: ${JSON.stringify(
      req,
      null,
      2
    )}`;

    if (transactionErr.code === 'ConditionalCheckFailedException') {
      logger.warn(message);
      return Result.err(createException('CONFLICT', transactionErr));
    } else {
      logger.error(message);
      return Result.err(createException('DB_WRITE_ERR', transactionErr));
    }
  }

  return Result.ok(undefined);
};

const createClientInitiationEvents = async (
  initiationEvent: ClientInitiationEvent,
  snapshotEvent: SnapshotEvent
): Promise<Result.Variant<void, Exception<'CONFLICT' | 'DB_WRITE_ERR'>>> => {
  const req: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
    TransactItems: [
      {
        Put: {
          TableName: transactionsTableName,
          ConditionExpression: 'attribute_not_exists(Id)',
          Item: initiationEvent,
        },
      },
      {
        Put: {
          TableName: transactionsTableName,
          ConditionExpression: 'attribute_not_exists(Version)',
          Item: snapshotEvent,
        },
      },
    ],
  };

  const [transactionErr] = await to<unknown, AWS.AWSError>(dynamodb.transactWrite(req).promise());

  if (transactionErr) {
    const message = `Cannot initiate client because transaction failed. Client id: ${
      initiationEvent.Id
    }. Error: ${transactionErr}. Request: ${JSON.stringify(req, null, 2)}`;

    if (transactionErr.code === 'ConditionalCheckFailedException') {
      logger.warn(message);
      return Result.err(createException('CONFLICT', transactionErr));
    } else {
      logger.error(message);
      return Result.err(createException('DB_WRITE_ERR', transactionErr));
    }
  }

  return Result.ok(undefined);
};

const queryLastEvents = async (
  clientId: string,
  limit: number
): Promise<Result.Variant<ClientEvent[], Exception<'DB_READ_ERR'>>> => {
  const [queryErr, queryResponse] = await to(
    dynamodb
      .query({
        TableName: transactionsTableName,
        KeyConditionExpression: 'Id = :id',
        ExpressionAttributeValues: { ':id': clientId },
        ConsistentRead: true,
        Limit: limit + 1,
        ScanIndexForward: false,
      })
      .promise()
  );

  if (queryErr) {
    logger.error(
      `Cannot perform query to get client events. Client id: ${clientId}. Error: ${queryErr}`
    );
    return Result.err(createException('DB_READ_ERR', queryErr));
  }

  return Result.ok(((queryResponse.Items || []) as ClientEvent[]).reverse());
};

const queryEvents = async (
  clientId: string,
  limit: number,
  from?: number
): Promise<Result.Variant<ClientEvent[], Exception<'CLIENT_NOT_FOUND' | 'DB_READ_ERR'>>> => {
  let expression = 'Id = :id';

  const attrValues = {
    ':id': clientId,
    ':contributionAction': 'CONTRIBUTION',
    ':compensationAction': 'COMPENSATION',
  };

  const attrNames = {
    '#Action': 'Action',
  };

  if (from) {
    expression = expression.concat(' AND #Timestamp >= :startDate');
    attrValues[':startDate'] = from;
    attrNames['#Timestamp'] = 'Timestamp';
  }

  const queryObj: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: transactionsTableName,
    KeyConditionExpression: expression,
    FilterExpression: '#Action = :contributionAction OR #Action = :compensationAction',
    ExpressionAttributeValues: attrValues,
    ExpressionAttributeNames: attrNames,
    ConsistentRead: true,
    IndexName: 'timestampLSI',
    Limit: limit,
  };

  const [queryErr, queryResponse] = await to(dynamodb.query(queryObj).promise());

  if (queryErr) {
    logger.error(
      `Cannot perform query to get client events. Client id: ${clientId}. Error: ${queryErr}`
    );
    return Result.err(createException('DB_READ_ERR', queryErr));
  }

  if (queryResponse.ScannedCount === 0) {
    return Result.err(createException('CLIENT_NOT_FOUND'));
  }

  return Result.ok(queryResponse.Items as ClientEvent[]);
};

export default {
  createGenericEvents,
  createClientInitiationEvents,
  queryLastEvents,
  queryEvents,
};
