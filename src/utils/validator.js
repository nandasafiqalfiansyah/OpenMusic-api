const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    'any.required': 'Album name is required',
    'string.empty': 'Album name cannot be empty',
  }),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'any.required': 'Album year is required',
      'number.base': 'Album year must be a number',
      'number.min': 'Album year must be after 1900',
      'number.max': `Album year cannot be in the future`,
    }),
});

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

module.exports = { AlbumPayloadSchema, SongPayloadSchema };
