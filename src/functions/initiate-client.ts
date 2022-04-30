import { SNSEvent, SNSHandler } from 'aws-lambda';
import { InitiateClientDto, initiateClientDtoValidationSchema } from '../dtos';
import { parseJsonToDto } from 'ism-common';
import Services from '../services';
import { logger } from 'src/lib';

export const handler: SNSHandler = async (event: SNSEvent) => {
  const data = event.Records[0]?.Sns.Message || '';

  const [invalidDataError, createClientDto] = await parseJsonToDto<InitiateClientDto>(
    data,
    initiateClientDtoValidationSchema
  );

  if (invalidDataError) {
    logger.error(`Invalid icoming data. Data: '${data}'. Error: ${invalidDataError.source}.`);
    return;
  }

  const [initiateClientErr] = await Services.initiateClient(createClientDto!, Date.now());

  if (initiateClientErr) {
    logger.error(
      `Error initiating client. Provided-dto: '${JSON.stringify(
        createClientDto
      )}'. Error: ${initiateClientErr}.`
    );
    return;
  }
};
