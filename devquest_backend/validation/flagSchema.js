import { z } from 'zod';

const FLAG_CATEGORIES = ['spam', 'offensive', 'duplicate', 'low_quality', 'off_topic', 'other'];
const FLAG_STATUSES   = ['pending', 'reviewed', 'rejected', 'action_taken'];

export const createFlagSchema = z.object({
    contentId: z.guid('Content ID must be a valid UUID.'),
    // Reason is always sent by the frontend — for non-"other" categories the
    // frontend autofills "Flagged as <category>" so this is never truly empty.
    reason: z.string().trim()
        .min(1,   'Reason cannot be empty.')
        .max(100, 'Reason must be 100 characters or fewer.'),
    flagCategory: z
        .enum(FLAG_CATEGORIES, {
            errorMap: () => ({ message: `Flag category must be one of: ${FLAG_CATEGORIES.join(', ')}.` }),
        })
        .default('other'),
    suggestedDuplicateId: z
        .guid('Suggested duplicate ID must be a valid UUID.')
        .nullable()
        .optional(),
}).refine(
    (data) => {
        // If the category is duplicate, suggestedDuplicateId must be provided
        if (data.flagCategory === 'duplicate') {
            return !!data.suggestedDuplicateId;
        }
        // If the category is not duplicate, suggestedDuplicateId must be absent
        return !data.suggestedDuplicateId;
    },
    {
        message: 'suggestedDuplicateId is required when flagCategory is "duplicate", and must be absent otherwise.',
        path: ['suggestedDuplicateId'],
    }
);

export const reviewFlagSchema = z.object({
    status: z.enum(FLAG_STATUSES, {
        errorMap: () => ({ message: `Status must be one of: ${FLAG_STATUSES.join(', ')}.` }),
    }),
    moderatorNote: z
        .string()
        .trim()
        .max(500, 'Moderator note must be 500 characters or fewer.')
        .nullable()
        .optional(),
});