import { z } from 'zod';

// drinkingSelf
export const DRINKING_SELF = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'socially', label: 'Socially' },
  { value: 'regularly', label: 'Regularly' },
] as const;
export const drinkingSelfSchema = z.enum(['never', 'rarely', 'socially', 'regularly']);

// drinkingRoommate (symmetric, no _ok suffix)
export const DRINKING_ROOMMATE = [
  { value: 'none', label: "Don't want a drinker" },
  { value: 'rarely', label: 'Rarely OK' },
  { value: 'socially', label: 'Socially OK' },
  { value: 'any', label: 'Any' },
] as const;
export const drinkingRoommateSchema = z.enum(['none', 'rarely', 'socially', 'any']);

// petsRoommate
export const PETS_ROOMMATE = [
  { value: 'none', label: 'No pets' },
  { value: 'cats_ok', label: 'Cats OK' },
  { value: 'dogs_ok', label: 'Dogs OK' },
  { value: 'small_only', label: 'Small pets only (caged/small)' },
  { value: 'any', label: 'Any pet' },
] as const;
export const petsRoommateSchema = z.enum(['none', 'cats_ok', 'dogs_ok', 'small_only', 'any']);

// guests
export const GUESTS = [
  { value: 'rarely', label: 'Rarely have guests' },
  { value: 'sometimes', label: 'Sometimes have guests' },
  { value: 'often', label: 'Often have guests' },
] as const;
export const guestsSchema = z.enum(['rarely', 'sometimes', 'often']);

// noiseTolerance
export const NOISE_TOLERANCE = [
  { value: 'quiet', label: 'Prefer quiet' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'lively', label: 'Prefer lively' },
] as const;
export const noiseToleranceSchema = z.enum(['quiet', 'moderate', 'lively']);

// cookingFrequency
export const COOKING_FREQUENCY = [
  { value: 'rarely', label: 'Rarely cook' },
  { value: 'sometimes', label: 'Cook sometimes' },
  { value: 'often', label: 'Cook often' },
  { value: 'daily', label: 'Cook daily' },
] as const;
export const cookingFrequencySchema = z.enum(['rarely', 'sometimes', 'often', 'daily']);

// dietaryPractice: NOTE the _personal vs _kitchen split
export const DIETARY_PRACTICE = [
  { value: 'none', label: 'No specific dietary practice' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal_personal', label: 'Halal (personal)' },
  { value: 'halal_kitchen', label: 'Halal (kitchen must be halal)' },
  { value: 'kosher_personal', label: 'Kosher (personal)' },
  { value: 'kosher_kitchen', label: 'Kosher (kitchen must be kosher)' },
  { value: 'other', label: 'Other' },
] as const;
export const dietaryPracticeSchema = z.enum([
  'none',
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal_personal',
  'halal_kitchen',
  'kosher_personal',
  'kosher_kitchen',
  'other',
]);
