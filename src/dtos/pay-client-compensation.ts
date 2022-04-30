import Joi from 'joi';

export interface PayClientCompensationDto {
  amount: number;
}

export const payClientCompensationDtoValidationSchema = Joi.object<PayClientCompensationDto>({
  amount: Joi.number().integer().positive().required(),
});
