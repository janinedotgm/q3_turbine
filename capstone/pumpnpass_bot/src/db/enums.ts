import { pgEnum } from 'drizzle-orm/pg-core';

export const gameStatusEnum = pgEnum('gamestatus', ['Open', 'Pending', 'Active', 'Finalizing', 'Finished']);
export const roundStatusEnum = pgEnum('roundstatus', ['Active', 'Finished']);
