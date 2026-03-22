import { LiveProgram } from './live.model.js';

export const findAll = async (filter = {}) => {
  return await LiveProgram.find(filter).populate('category', 'name').sort({ startTimestamp: -1 });
};

export const findById = async (id) => {
  return await LiveProgram.findById(id).populate('category', 'name');
};
