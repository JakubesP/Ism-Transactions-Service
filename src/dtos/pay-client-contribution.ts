import Joi from 'joi';

export interface PayClientContributionDto {
  amount: number;
}

export const payClientContributionDtoValidationSchema = Joi.object<PayClientContributionDto>({
  amount: Joi.number().integer().positive().required(),
});
