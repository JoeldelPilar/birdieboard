CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bag_id" uuid NOT NULL,
	"club_type" varchar(50) NOT NULL,
	"brand" varchar(100),
	"model" varchar(100),
	"loft" numeric(4, 1),
	"carry_distance" integer,
	"total_distance" integer,
	"shaft_type" varchar(20),
	"shaft_flex" varchar(20),
	"sort_order" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_holes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"tee_id" uuid NOT NULL,
	"hole_number" integer NOT NULL,
	"par" integer NOT NULL,
	"stroke_index" integer NOT NULL,
	"distance_meters" integer
);
--> statement-breakpoint
CREATE TABLE "course_tees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"tee_name" varchar(100) NOT NULL,
	"color" varchar(50),
	"course_rating" numeric(4, 1) NOT NULL,
	"slope_rating" integer NOT NULL,
	"par" integer NOT NULL,
	"total_meters" integer,
	"gender" varchar(20) DEFAULT 'unisex'
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(255),
	"external_source" varchar(100) DEFAULT 'golfcourseapi',
	"name" varchar(255) NOT NULL,
	"club_name" varchar(255),
	"city" varchar(255),
	"country" varchar(2),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"hole_count" integer DEFAULT 18,
	"website" varchar(500),
	"phone" varchar(50),
	"cached_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"addressee_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_no_self" CHECK ("friendships"."requester_id" != "friendships"."addressee_id")
);
--> statement-breakpoint
CREATE TABLE "golf_bags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"name" varchar(100) DEFAULT 'Main Bag' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "handicap_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"handicap_index" numeric(4, 1) NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL,
	"round_id" uuid,
	"differentials" jsonb
);
--> statement-breakpoint
CREATE TABLE "hole_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" uuid NOT NULL,
	"hole_number" integer NOT NULL,
	"strokes" integer NOT NULL,
	"putts" integer,
	"fairway_hit" boolean,
	"green_in_reg" boolean,
	"penalty_strokes" integer DEFAULT 0 NOT NULL,
	"sand_shots" integer DEFAULT 0 NOT NULL,
	"club_used_off_tee" uuid,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_id" uuid NOT NULL,
	"invitee_email" varchar(255),
	"invitee_id" uuid,
	"invitation_type" varchar(20) NOT NULL,
	"reference_id" uuid,
	"token" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "match_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'invited' NOT NULL,
	"playing_handicap" integer,
	"final_position" integer,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"tour_id" uuid,
	"course_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"match_date" date,
	"tee_time" time,
	"format" varchar(50) NOT NULL,
	"scoring_type" varchar(20) DEFAULT 'gross' NOT NULL,
	"max_players" integer DEFAULT 4 NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"reference_type" varchar(100),
	"reference_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" varchar(100),
	"avatar_url" text,
	"handicap_index" numeric(4, 1),
	"home_course_id" uuid,
	"country" varchar(2),
	"city" varchar(255),
	"bio" text,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "player_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"tee_id" uuid NOT NULL,
	"match_id" uuid,
	"round_date" date NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"weather" varchar(100),
	"temperature_c" integer,
	"wind_speed_ms" integer,
	"gross_score" integer,
	"net_score" integer,
	"score_differential" numeric(5, 1),
	"stableford_points" integer,
	"notes" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "tour_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"scoring_system" varchar(50) DEFAULT 'points',
	"points_per_position" jsonb,
	"start_date" date,
	"end_date" date,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" varchar(255),
	"email_verified" timestamp,
	"password" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_bag_id_golf_bags_id_fk" FOREIGN KEY ("bag_id") REFERENCES "public"."golf_bags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_holes" ADD CONSTRAINT "course_holes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_holes" ADD CONSTRAINT "course_holes_tee_id_course_tees_id_fk" FOREIGN KEY ("tee_id") REFERENCES "public"."course_tees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_tees" ADD CONSTRAINT "course_tees_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_player_profiles_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_player_profiles_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "golf_bags" ADD CONSTRAINT "golf_bags_player_id_player_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handicap_history" ADD CONSTRAINT "handicap_history_player_id_player_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hole_scores" ADD CONSTRAINT "hole_scores_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hole_scores" ADD CONSTRAINT "hole_scores_club_used_off_tee_clubs_id_fk" FOREIGN KEY ("club_used_off_tee") REFERENCES "public"."clubs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_player_profiles_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitee_id_player_profiles_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "public"."player_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_player_id_player_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_creator_id_player_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_home_course_id_courses_id_fk" FOREIGN KEY ("home_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_player_id_player_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_tee_id_course_tees_id_fk" FOREIGN KEY ("tee_id") REFERENCES "public"."course_tees"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_members" ADD CONSTRAINT "tour_members_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_members" ADD CONSTRAINT "tour_members_player_id_player_profiles_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_creator_id_player_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."player_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_idx" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "clubs_bag_id_idx" ON "clubs" USING btree ("bag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_holes_tee_hole_idx" ON "course_holes" USING btree ("tee_id","hole_number");--> statement-breakpoint
CREATE INDEX "course_holes_course_id_idx" ON "course_holes" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_tees_course_id_idx" ON "course_tees" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_external_id_source_idx" ON "courses" USING btree ("external_id","external_source");--> statement-breakpoint
CREATE INDEX "courses_name_idx" ON "courses" USING btree ("name");--> statement-breakpoint
CREATE INDEX "courses_country_idx" ON "courses" USING btree ("country");--> statement-breakpoint
CREATE UNIQUE INDEX "friendships_requester_addressee_idx" ON "friendships" USING btree ("requester_id","addressee_id");--> statement-breakpoint
CREATE INDEX "friendships_addressee_id_idx" ON "friendships" USING btree ("addressee_id");--> statement-breakpoint
CREATE INDEX "golf_bags_player_id_idx" ON "golf_bags" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "handicap_history_player_id_idx" ON "handicap_history" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "handicap_history_calculated_at_idx" ON "handicap_history" USING btree ("calculated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "hole_scores_round_hole_idx" ON "hole_scores" USING btree ("round_id","hole_number");--> statement-breakpoint
CREATE INDEX "hole_scores_round_id_idx" ON "hole_scores" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX "invitations_inviter_id_idx" ON "invitations" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "invitations_invitee_id_idx" ON "invitations" USING btree ("invitee_id");--> statement-breakpoint
CREATE INDEX "invitations_token_idx" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invitations_status_idx" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "match_participants_match_player_idx" ON "match_participants" USING btree ("match_id","player_id");--> statement-breakpoint
CREATE INDEX "match_participants_match_id_idx" ON "match_participants" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "match_participants_player_id_idx" ON "match_participants" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "matches_creator_id_idx" ON "matches" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "matches_tour_id_idx" ON "matches" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "matches_status_idx" ON "matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "matches_match_date_idx" ON "matches" USING btree ("match_date");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "player_profiles_user_id_idx" ON "player_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rounds_player_id_idx" ON "rounds" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "rounds_course_id_idx" ON "rounds" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "rounds_match_id_idx" ON "rounds" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "rounds_round_date_idx" ON "rounds" USING btree ("round_date");--> statement-breakpoint
CREATE INDEX "rounds_status_idx" ON "rounds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tour_members_tour_player_idx" ON "tour_members" USING btree ("tour_id","player_id");--> statement-breakpoint
CREATE INDEX "tour_members_tour_id_idx" ON "tour_members" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "tour_members_player_id_idx" ON "tour_members" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "tours_creator_id_idx" ON "tours" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "tours_status_idx" ON "tours" USING btree ("status");