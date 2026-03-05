import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
  addresseeId: z.string().uuid('Invalid player ID'),
});

export const respondFriendRequestSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  action: z.enum(['accept', 'decline'], {
    error: 'Action must be accept or decline',
  }),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type RespondFriendRequestInput = z.infer<typeof respondFriendRequestSchema>;
