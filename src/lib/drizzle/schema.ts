import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  date,
  time,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// NextAuth Tables
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: varchar('email', { length: 255 }).unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: varchar('token_type', { length: 255 }),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (table) => [
    uniqueIndex('accounts_provider_account_idx').on(table.provider, table.providerAccountId),
    index('accounts_user_id_idx').on(table.userId),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)],
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    externalId: varchar('external_id', { length: 255 }),
    externalSource: varchar('external_source', { length: 100 }).default('golfcourseapi'),
    name: varchar('name', { length: 255 }).notNull(),
    clubName: varchar('club_name', { length: 255 }),
    city: varchar('city', { length: 255 }),
    country: varchar('country', { length: 2 }),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    holeCount: integer('hole_count').default(18),
    website: varchar('website', { length: 500 }),
    phone: varchar('phone', { length: 50 }),
    cachedAt: timestamp('cached_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('courses_external_id_source_idx').on(table.externalId, table.externalSource),
    index('courses_name_idx').on(table.name),
    index('courses_country_idx').on(table.country),
  ],
);

export const courseTees = pgTable(
  'course_tees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    teeName: varchar('tee_name', { length: 100 }).notNull(),
    color: varchar('color', { length: 50 }),
    courseRating: decimal('course_rating', { precision: 4, scale: 1 }).notNull(),
    slopeRating: integer('slope_rating').notNull(),
    par: integer('par').notNull(),
    totalMeters: integer('total_meters'),
    gender: varchar('gender', { length: 20 }).default('unisex'),
  },
  (table) => [index('course_tees_course_id_idx').on(table.courseId)],
);

export const courseHoles = pgTable(
  'course_holes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    teeId: uuid('tee_id')
      .notNull()
      .references(() => courseTees.id, { onDelete: 'cascade' }),
    holeNumber: integer('hole_number').notNull(),
    par: integer('par').notNull(),
    strokeIndex: integer('stroke_index').notNull(),
    distanceMeters: integer('distance_meters'),
  },
  (table) => [
    uniqueIndex('course_holes_tee_hole_idx').on(table.teeId, table.holeNumber),
    index('course_holes_course_id_idx').on(table.courseId),
  ],
);

// ---------------------------------------------------------------------------
// Player Profiles
// ---------------------------------------------------------------------------

export const playerProfiles = pgTable(
  'player_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: varchar('display_name', { length: 100 }),
    avatarUrl: text('avatar_url'),
    handicapIndex: decimal('handicap_index', { precision: 4, scale: 1 }),
    homeCourseId: uuid('home_course_id').references(() => courses.id, { onDelete: 'set null' }),
    country: varchar('country', { length: 2 }),
    city: varchar('city', { length: 255 }),
    bio: text('bio'),
    isPublic: boolean('is_public').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('player_profiles_user_id_idx').on(table.userId)],
);

export const handicapHistory = pgTable(
  'handicap_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    playerId: uuid('player_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    handicapIndex: decimal('handicap_index', { precision: 4, scale: 1 }).notNull(),
    calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
    roundId: uuid('round_id'),
    differentials: jsonb('differentials'),
  },
  (table) => [
    index('handicap_history_player_id_idx').on(table.playerId),
    index('handicap_history_calculated_at_idx').on(table.calculatedAt),
  ],
);

// ---------------------------------------------------------------------------
// Golf Bags and Clubs
// ---------------------------------------------------------------------------

export const golfBags = pgTable(
  'golf_bags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    playerId: uuid('player_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).default('Main Bag').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('golf_bags_player_id_idx').on(table.playerId)],
);

export const clubs = pgTable(
  'clubs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    bagId: uuid('bag_id')
      .notNull()
      .references(() => golfBags.id, { onDelete: 'cascade' }),
    clubType: varchar('club_type', { length: 50 }).notNull(),
    brand: varchar('brand', { length: 100 }),
    model: varchar('model', { length: 100 }),
    loft: decimal('loft', { precision: 4, scale: 1 }),
    carryDistance: integer('carry_distance'),
    totalDistance: integer('total_distance'),
    shaftType: varchar('shaft_type', { length: 20 }),
    shaftFlex: varchar('shaft_flex', { length: 20 }),
    sortOrder: integer('sort_order').default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('clubs_bag_id_idx').on(table.bagId)],
);

// ---------------------------------------------------------------------------
// Tours
// ---------------------------------------------------------------------------

export const tours = pgTable(
  'tours',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    scoringSystem: varchar('scoring_system', { length: 50 }).default('points'),
    pointsPerPosition: jsonb('points_per_position'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    status: varchar('status', { length: 20 }).default('active').notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('tours_creator_id_idx').on(table.creatorId),
    index('tours_status_idx').on(table.status),
  ],
);

export const tourMembers = pgTable(
  'tour_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tourId: uuid('tour_id')
      .notNull()
      .references(() => tours.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).default('member').notNull(),
    totalPoints: integer('total_points').default(0).notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('tour_members_tour_player_idx').on(table.tourId, table.playerId),
    index('tour_members_tour_id_idx').on(table.tourId),
    index('tour_members_player_id_idx').on(table.playerId),
  ],
);

// ---------------------------------------------------------------------------
// Matches
// ---------------------------------------------------------------------------

export const matches = pgTable(
  'matches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    tourId: uuid('tour_id').references(() => tours.id, { onDelete: 'set null' }),
    courseId: uuid('course_id').references(() => courses.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    matchDate: date('match_date'),
    teeTime: time('tee_time'),
    format: varchar('format', { length: 50 }).notNull(),
    scoringType: varchar('scoring_type', { length: 20 }).default('gross').notNull(),
    maxPlayers: integer('max_players').default(4).notNull(),
    status: varchar('status', { length: 20 }).default('draft').notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('matches_creator_id_idx').on(table.creatorId),
    index('matches_tour_id_idx').on(table.tourId),
    index('matches_status_idx').on(table.status),
    index('matches_match_date_idx').on(table.matchDate),
  ],
);

export const matchParticipants = pgTable(
  'match_participants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    matchId: uuid('match_id')
      .notNull()
      .references(() => matches.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).default('invited').notNull(),
    playingHandicap: integer('playing_handicap'),
    finalPosition: integer('final_position'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('match_participants_match_player_idx').on(table.matchId, table.playerId),
    index('match_participants_match_id_idx').on(table.matchId),
    index('match_participants_player_id_idx').on(table.playerId),
  ],
);

// ---------------------------------------------------------------------------
// Rounds
// ---------------------------------------------------------------------------

export const rounds = pgTable(
  'rounds',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    playerId: uuid('player_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'restrict' }),
    teeId: uuid('tee_id')
      .notNull()
      .references(() => courseTees.id, { onDelete: 'restrict' }),
    matchId: uuid('match_id').references(() => matches.id, { onDelete: 'set null' }),
    roundDate: date('round_date').notNull(),
    status: varchar('status', { length: 20 }).default('in_progress').notNull(),
    weather: varchar('weather', { length: 100 }),
    temperatureC: integer('temperature_c'),
    windSpeedMs: integer('wind_speed_ms'),
    grossScore: integer('gross_score'),
    netScore: integer('net_score'),
    scoreDifferential: decimal('score_differential', { precision: 5, scale: 1 }),
    stablefordPoints: integer('stableford_points'),
    notes: text('notes'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('rounds_player_id_idx').on(table.playerId),
    index('rounds_course_id_idx').on(table.courseId),
    index('rounds_match_id_idx').on(table.matchId),
    index('rounds_round_date_idx').on(table.roundDate),
    index('rounds_status_idx').on(table.status),
  ],
);

export const holeScores = pgTable(
  'hole_scores',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roundId: uuid('round_id')
      .notNull()
      .references(() => rounds.id, { onDelete: 'cascade' }),
    holeNumber: integer('hole_number').notNull(),
    strokes: integer('strokes').notNull(),
    putts: integer('putts'),
    fairwayHit: boolean('fairway_hit'),
    greenInReg: boolean('green_in_reg'),
    penaltyStrokes: integer('penalty_strokes').default(0).notNull(),
    sandShots: integer('sand_shots').default(0).notNull(),
    clubUsedOffTee: uuid('club_used_off_tee').references(() => clubs.id, { onDelete: 'set null' }),
    notes: text('notes'),
  },
  (table) => [
    uniqueIndex('hole_scores_round_hole_idx').on(table.roundId, table.holeNumber),
    index('hole_scores_round_id_idx').on(table.roundId),
  ],
);

// ---------------------------------------------------------------------------
// Social: Friendships, Invitations, Notifications
// ---------------------------------------------------------------------------

export const friendships = pgTable(
  'friendships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    requesterId: uuid('requester_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    addresseeId: uuid('addressee_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('friendships_requester_addressee_idx').on(table.requesterId, table.addresseeId),
    index('friendships_addressee_id_idx').on(table.addresseeId),
    check('friendships_no_self', sql`${table.requesterId} != ${table.addresseeId}`),
  ],
);

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    inviterId: uuid('inviter_id')
      .notNull()
      .references(() => playerProfiles.id, { onDelete: 'cascade' }),
    inviteeEmail: varchar('invitee_email', { length: 255 }),
    inviteeId: uuid('invitee_id').references(() => playerProfiles.id, { onDelete: 'set null' }),
    invitationType: varchar('invitation_type', { length: 20 }).notNull(),
    referenceId: uuid('reference_id'),
    token: varchar('token', { length: 100 }).notNull().unique(),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('invitations_inviter_id_idx').on(table.inviterId),
    index('invitations_invitee_id_idx').on(table.inviteeId),
    index('invitations_token_idx').on(table.token),
    index('invitations_status_idx').on(table.status),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    referenceType: varchar('reference_type', { length: 100 }),
    referenceId: uuid('reference_id'),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_is_read_idx').on(table.isRead),
    index('notifications_created_at_idx').on(table.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ one, many }) => ({
  account: many(accounts),
  sessions: many(sessions),
  playerProfile: one(playerProfiles, {
    fields: [users.id],
    references: [playerProfiles.userId],
  }),
  notifications: many(notifications),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const playerProfilesRelations = relations(playerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
  homeCourse: one(courses, {
    fields: [playerProfiles.homeCourseId],
    references: [courses.id],
  }),
  handicapHistory: many(handicapHistory),
  golfBags: many(golfBags),
  rounds: many(rounds),
  matchParticipants: many(matchParticipants),
  createdMatches: many(matches),
  tourMemberships: many(tourMembers),
  createdTours: many(tours),
  sentFriendRequests: many(friendships, { relationName: 'requester' }),
  receivedFriendRequests: many(friendships, { relationName: 'addressee' }),
  sentInvitations: many(invitations, { relationName: 'inviter' }),
  receivedInvitations: many(invitations, { relationName: 'invitee' }),
}));

export const handicapHistoryRelations = relations(handicapHistory, ({ one }) => ({
  player: one(playerProfiles, {
    fields: [handicapHistory.playerId],
    references: [playerProfiles.id],
  }),
  round: one(rounds, {
    fields: [handicapHistory.roundId],
    references: [rounds.id],
  }),
}));

export const golfBagsRelations = relations(golfBags, ({ one, many }) => ({
  player: one(playerProfiles, {
    fields: [golfBags.playerId],
    references: [playerProfiles.id],
  }),
  clubs: many(clubs),
}));

export const clubsRelations = relations(clubs, ({ one, many }) => ({
  bag: one(golfBags, {
    fields: [clubs.bagId],
    references: [golfBags.id],
  }),
  holeScores: many(holeScores),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  tees: many(courseTees),
  holes: many(courseHoles),
  rounds: many(rounds),
  matches: many(matches),
  playerProfiles: many(playerProfiles),
}));

export const courseTeesRelations = relations(courseTees, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseTees.courseId],
    references: [courses.id],
  }),
  holes: many(courseHoles),
  rounds: many(rounds),
}));

export const courseHolesRelations = relations(courseHoles, ({ one }) => ({
  course: one(courses, {
    fields: [courseHoles.courseId],
    references: [courses.id],
  }),
  tee: one(courseTees, {
    fields: [courseHoles.teeId],
    references: [courseTees.id],
  }),
}));

export const toursRelations = relations(tours, ({ one, many }) => ({
  creator: one(playerProfiles, {
    fields: [tours.creatorId],
    references: [playerProfiles.id],
  }),
  members: many(tourMembers),
  matches: many(matches),
}));

export const tourMembersRelations = relations(tourMembers, ({ one }) => ({
  tour: one(tours, {
    fields: [tourMembers.tourId],
    references: [tours.id],
  }),
  player: one(playerProfiles, {
    fields: [tourMembers.playerId],
    references: [playerProfiles.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  creator: one(playerProfiles, {
    fields: [matches.creatorId],
    references: [playerProfiles.id],
  }),
  tour: one(tours, {
    fields: [matches.tourId],
    references: [tours.id],
  }),
  course: one(courses, {
    fields: [matches.courseId],
    references: [courses.id],
  }),
  participants: many(matchParticipants),
  rounds: many(rounds),
}));

export const matchParticipantsRelations = relations(matchParticipants, ({ one }) => ({
  match: one(matches, {
    fields: [matchParticipants.matchId],
    references: [matches.id],
  }),
  player: one(playerProfiles, {
    fields: [matchParticipants.playerId],
    references: [playerProfiles.id],
  }),
}));

export const roundsRelations = relations(rounds, ({ one, many }) => ({
  player: one(playerProfiles, {
    fields: [rounds.playerId],
    references: [playerProfiles.id],
  }),
  course: one(courses, {
    fields: [rounds.courseId],
    references: [courses.id],
  }),
  tee: one(courseTees, {
    fields: [rounds.teeId],
    references: [courseTees.id],
  }),
  match: one(matches, {
    fields: [rounds.matchId],
    references: [matches.id],
  }),
  holeScores: many(holeScores),
  handicapHistory: many(handicapHistory),
}));

export const holeScoresRelations = relations(holeScores, ({ one }) => ({
  round: one(rounds, {
    fields: [holeScores.roundId],
    references: [rounds.id],
  }),
  clubUsedOffTee: one(clubs, {
    fields: [holeScores.clubUsedOffTee],
    references: [clubs.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(playerProfiles, {
    fields: [friendships.requesterId],
    references: [playerProfiles.id],
    relationName: 'requester',
  }),
  addressee: one(playerProfiles, {
    fields: [friendships.addresseeId],
    references: [playerProfiles.id],
    relationName: 'addressee',
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  inviter: one(playerProfiles, {
    fields: [invitations.inviterId],
    references: [playerProfiles.id],
    relationName: 'inviter',
  }),
  invitee: one(playerProfiles, {
    fields: [invitations.inviteeId],
    references: [playerProfiles.id],
    relationName: 'invitee',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
