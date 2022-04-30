import Joi from 'joi';

export interface InitiateClientDto {
  clientId: string;
  contribution: number;
  compensation: number;
}

export const initiateClientDtoValidationSchema = Joi.object<InitiateClientDto>({
  clientId: Joi.string().uuid().required(),
  contribution: Joi.number().integer().min(0).required(),
  compensation: Joi.number().integer().min(0).required(),
});
