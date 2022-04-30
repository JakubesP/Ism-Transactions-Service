import Joi from 'joi';

export interface ClientTransactionsPaginationParamsDto {
  limit: number;
  from?: number;
}

export const clientTransactionsPaginationParamsDtoValidationSchema =
  Joi.object<ClientTransactionsPaginationParamsDto>({
    limit: Joi.number().required(),
    from: Joi.number().optional(),
  });
