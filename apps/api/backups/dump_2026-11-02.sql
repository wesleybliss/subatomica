PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` text,
	`refreshTokenExpiresAt` text,
	`scope` text,
	`password` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO accounts VALUES('019c25bf-2d1e-73f1-988e-3b50c25237f3','1771285248721.0','1770159811870.0',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','credential','019c25bf-2c88-7317-a971-da87c8c8eebb',NULL,NULL,NULL,NULL,NULL,NULL,'e834e2a160fee2dfdedbff62ff32b105:ea81863c85443bac98f0a89b65ba409e65adc6c6cbd40f2ad23d02db272d1eccf88289acdfd4967db58696b6b447874bdde221b0fc98e80cb23f9e83724f4761');
INSERT INTO accounts VALUES('019c2a6e-7438-757c-9255-875d8b204f7b','1771284967824.0','1770238407735.0',NULL,'019c2a6e-73c1-75ab-aeff-f8de245eaa6d','credential','019c2a6e-73c1-75ab-aeff-f8de245eaa6d',NULL,NULL,NULL,NULL,NULL,NULL,'62241d13d7a0dfd7242d31d956b54d47:6e2f1971f9746cae2790992e936b76c282548006460a0fe7df96985ab4391ae2eaa7d30503789c6e07df7e074842e0759940a70ca389ea8a5c7c49705cf50f35');
INSERT INTO accounts VALUES('019c68c8-97ba-758d-95f0-113fd65ed4cd','1771284502458.0','1771284502458.0',NULL,'019c68c8-9789-7259-8197-5cda57ff5adc','credential','019c68c8-9789-7259-8197-5cda57ff5adc',NULL,NULL,NULL,NULL,NULL,NULL,'aa2784220137e12ecf7e41eb25c094c1:f760634422e641718974e59d1dbc31031cd49130ea37749844f2d11b5cf1de001ec2d48a6100ce900725b53df92af9f5a8c591275a36beca98b8675db6a872ef');
CREATE TABLE IF NOT EXISTS `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`name` text NOT NULL,
	"ownerId" text NOT NULL REFERENCES users(id) ON DELETE cascade ON UPDATE no action,
	`teamId` text NOT NULL, `description` text DEFAULT '' NOT NULL, `isStarred` integer DEFAULT false NOT NULL, "slug" text NOT NULL, `taskSequence` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY ("ownerId") REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO projects VALUES('019c3f22-d790-7769-ba24-aa6e5b40691c','2026-02-08T21:22:53.968Z','2026-02-08T21:22:53.968Z',NULL,'Testing','019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f08-555a-704e-acc1-623d6dad9b22','',0,'testing',90);
INSERT INTO projects VALUES('019c692b-e451-73e4-b8d1-2f85364b8621','2026-02-17T01:16:50.129Z','2026-02-17T01:16:50.129Z',NULL,'New York 2026','019c25bf-2c88-7317-a971-da87c8c8eebb','019c6927-7fb9-7798-b601-2ff42382eb40','',0,'new-york-2026',4);
CREATE TABLE IF NOT EXISTS `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`name` text NOT NULL,
	"ownerId" text NOT NULL REFERENCES users(id) ON DELETE cascade ON UPDATE no action, "slug" text NOT NULL,
	FOREIGN KEY ("ownerId") REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO teams VALUES('019c3f08-555a-704e-acc1-623d6dad9b22','2026-02-08T20:53:56.699Z','2026-02-08T20:53:56.699Z',NULL,'ACME Local','019c25bf-2c88-7317-a971-da87c8c8eebb','acme-local');
INSERT INTO teams VALUES('019c68c8-0ca3-7067-957c-5ac8efa4600f','2026-02-16T23:27:46.852Z','2026-02-16T23:27:46.852Z',NULL,'Personal','019c2a6e-73c1-75ab-aeff-f8de245eaa6d','personal');
INSERT INTO teams VALUES('019c68c8-983f-76a3-9e80-fef61b6c3d90','2026-02-16T23:28:22.591Z','2026-02-16T23:28:22.592Z',NULL,'Personal','019c68c8-9789-7259-8197-5cda57ff5adc','personal');
INSERT INTO teams VALUES('019c6927-7fb9-7798-b601-2ff42382eb40','2026-02-17T01:12:02.234Z','2026-02-17T01:12:02.234Z',NULL,'Personal','019c25bf-2c88-7317-a971-da87c8c8eebb','personal');
CREATE TABLE IF NOT EXISTS `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` text NOT NULL
);
CREATE TABLE IF NOT EXISTS `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`taskId` text NOT NULL,
	`userId` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS "taskLanes" (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`projectId` text NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isDefault` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO taskLanes VALUES('019c27bd-bf0a-721a-aa83-ed1d362d5e87','2026-02-04T08:21:12.586Z','2026-02-04T08:21:12.586Z',NULL,'019c2785-c6c5-70cb-b572-b529dbbd0424','backlog','Backlog','bg-black/20',1000,1);
INSERT INTO taskLanes VALUES('019c27bd-bf0a-721a-aa83-f23b6c816190','2026-02-04T08:21:12.587Z','2026-02-04T08:21:12.587Z',NULL,'019c2785-c6c5-70cb-b572-b529dbbd0424','todo','Todo','bg-blue-500/20',2000,0);
INSERT INTO taskLanes VALUES('019c27bd-bf0b-70cb-b60e-d5d11cfe2513','2026-02-04T08:21:12.587Z','2026-02-04T08:21:12.587Z',NULL,'019c2785-c6c5-70cb-b572-b529dbbd0424','in-progress','In Progress','bg-primary/20',3000,0);
INSERT INTO taskLanes VALUES('019c27bd-bf0b-70cb-b60e-d9afdd19583d','2026-02-04T08:21:12.587Z','2026-02-04T08:21:12.587Z',NULL,'019c2785-c6c5-70cb-b572-b529dbbd0424','done','Done','bg-green-500/20',4000,0);
INSERT INTO taskLanes VALUES('019c3f22-d86c-77ef-983c-7ed3e82625ad','2026-02-08T21:22:54.188Z','2026-02-08T21:22:54.188Z',NULL,'019c3f22-d790-7769-ba24-aa6e5b40691c','todo','To Do','#8b5cf6',0,0);
INSERT INTO taskLanes VALUES('019c3f22-d86c-77ef-983c-807c756a63e7','2026-02-08T21:22:54.188Z','2026-02-08T21:22:54.188Z',NULL,'019c3f22-d790-7769-ba24-aa6e5b40691c','in-progress','In Progress','#06b6d4',1,0);
INSERT INTO taskLanes VALUES('019c3f22-d86c-77ef-983c-841fecb49248','2026-02-08T21:22:54.188Z','2026-02-08T21:22:54.188Z',NULL,'019c3f22-d790-7769-ba24-aa6e5b40691c','done','Done','#22c55e',2,0);
INSERT INTO taskLanes VALUES('019c40fd-96e0-701c-9e55-4eb4eb640480','2026-02-09T06:01:27.008Z','2026-02-09T06:01:27.008Z',NULL,'019c3f22-d790-7769-ba24-aa6e5b40691c','backlog','Backlog','#3ecfc2',-1000,0);
INSERT INTO taskLanes VALUES('019c692b-e493-774d-8b6a-91fd59637e53','2026-02-17T01:16:50.195Z','2026-02-17T01:16:50.195Z',NULL,'019c692b-e451-73e4-b8d1-2f85364b8621','todo','To Do',NULL,0,0);
INSERT INTO taskLanes VALUES('019c692b-e493-774d-8b6a-956a444140f8','2026-02-17T01:16:50.195Z','2026-02-17T01:16:50.195Z',NULL,'019c692b-e451-73e4-b8d1-2f85364b8621','in-progress','In Progress',NULL,1,0);
INSERT INTO taskLanes VALUES('019c692b-e493-774d-8b6a-9868d0121bf6','2026-02-17T01:16:50.195Z','2026-02-17T01:16:50.195Z',NULL,'019c692b-e451-73e4-b8d1-2f85364b8621','done','Done',NULL,2,0);
CREATE TABLE IF NOT EXISTS "teamMembers" (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`userId` text NOT NULL,
	`teamId` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO teamMembers VALUES('019c2a6b-099a-71bb-8ef0-e69c8264e9ff','2026-02-04T20:49:43.834Z','2026-02-04T20:49:43.834Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c2712-76d8-705e-93b1-75a694aca6ff','owner');
INSERT INTO teamMembers VALUES('019c2a6e-75c2-714c-ac66-20a198293c89','2026-02-04T20:53:28.130Z','2026-02-04T20:53:28.130Z',NULL,'019c2a6e-73c1-75ab-aeff-f8de245eaa6d','019c2a6e-7564-7119-887e-9f3744f68e43','owner');
INSERT INTO teamMembers VALUES('019c2a70-5197-7092-9858-c1616f9a5088','2026-02-04T20:55:29.943Z','2026-02-04T20:55:29.943Z',NULL,'019c2a6e-73c1-75ab-aeff-f8de245eaa6d','019c2712-76d8-705e-93b1-75a694aca6ff','member');
INSERT INTO teamMembers VALUES('019c3f08-55ba-7785-9869-6ff8c1e83322','2026-02-08T20:53:56.794Z','2026-02-08T20:53:56.794Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f08-555a-704e-acc1-623d6dad9b22','owner');
INSERT INTO teamMembers VALUES('019c68c8-0dc3-70ad-a877-777c067cfbb1','2026-02-16T23:27:47.140Z','2026-02-16T23:27:47.140Z',NULL,'019c2a6e-73c1-75ab-aeff-f8de245eaa6d','019c68c8-0ca3-7067-957c-5ac8efa4600f','owner');
INSERT INTO teamMembers VALUES('019c68c8-9869-7362-9d8f-51c2cc074084','2026-02-16T23:28:22.633Z','2026-02-16T23:28:22.633Z',NULL,'019c68c8-9789-7259-8197-5cda57ff5adc','019c68c8-983f-76a3-9e80-fef61b6c3d90','owner');
INSERT INTO teamMembers VALUES('019c6927-8031-73ff-a26b-e81fd6aa58c5','2026-02-17T01:12:02.353Z','2026-02-17T01:12:02.353Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c6927-7fb9-7798-b601-2ff42382eb40','owner');
CREATE TABLE IF NOT EXISTS `trelloBoardLinks` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`userId` text NOT NULL,
	`trelloBoardId` text NOT NULL,
	`trelloBoardName` text NOT NULL,
	`trelloWorkspaceId` text NOT NULL,
	`projectId` text NOT NULL,
	`teamId` text NOT NULL,
	`webhookId` text,
	`syncEnabled` integer DEFAULT false NOT NULL,
	`lastSyncedAt` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS `trelloCardLinks` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`trelloCardId` text NOT NULL,
	`taskId` text NOT NULL,
	`boardLinkId` text NOT NULL,
	FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`boardLinkId`) REFERENCES `trelloBoardLinks`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS `trelloConnections` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`teamId` text NOT NULL,
	`connectedByUserId` text NOT NULL,
	`trelloMemberId` text NOT NULL,
	`trelloUsername` text,
	`accessToken` text NOT NULL,
	`refreshToken` text NOT NULL,
	`accessTokenExpiresAt` text NOT NULL,
	`scope` text,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`connectedByUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS `trelloListLinks` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`trelloListId` text NOT NULL,
	`laneId` text NOT NULL,
	`boardLinkId` text NOT NULL,
	FOREIGN KEY (`laneId`) REFERENCES `taskLanes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`boardLinkId`) REFERENCES `trelloBoardLinks`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS `trelloOauthStates` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`userId` text NOT NULL,
	`teamId` text NOT NULL,
	`codeVerifier` text NOT NULL,
	`returnTeamId` text,
	`expiresAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS `trelloWorkspaceLinks` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`userId` text NOT NULL,
	`trelloWorkspaceId` text NOT NULL,
	`trelloWorkspaceName` text NOT NULL,
	`teamId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS `trelloMemberLinks` (
	`id` text PRIMARY KEY NOT NULL,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`teamId` text NOT NULL,
	`trelloMemberId` text NOT NULL,
	`trelloUsername` text,
	`trelloFullName` text,
	`email` text,
	`userId` text,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE IF NOT EXISTS "sessions" (
	`id` text PRIMARY KEY,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`expiresAt` text NOT NULL,
	`token` text NOT NULL UNIQUE,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	CONSTRAINT `fk_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
INSERT INTO sessions VALUES('019c25bf-2d92-7377-8a4e-e74fc4615757','1770159811989.0','1770159811989.0',NULL,'1770764611988.0','5Uihun7GjLUadqANn2YbCroy2UBDUa2I','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c25e4-b3cd-77de-8af7-6ba760953bf8','1770162271184.0','1770162271184.0',NULL,'1770767071182.0','nyt2Um7yYBvJsIDe3UrHLqXHwXHZEpjV','201.221.172.21','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c2634-2b06-720d-abc9-c6ddb61a59e5','1770167479050.0','1770167479050.0',NULL,'1770772279048.0','cfP2Nn8W00IFoEN46LAJBoPUaUgIK6YE','201.221.172.21','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c271e-1776-737a-8ac3-3b26eb8575ac','1770182809466.0','1770182809466.0',NULL,'1770787609465.0','ZLHO3CoTROvT2o1CSQvFNeci1ZmzJqrG','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c271e-8f99-7286-aadc-b3006fd8cfa0','1770182840218.0','1770182840218.0',NULL,'1770787640217.0','CaEL4Gxrj7fkfUVwrulPrYpLyZWYygVJ','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c271e-e9f9-712b-b268-0ae0212b133b','1770182863354.0','1770182863354.0',NULL,'1770787663354.0','wm4XfAY1qft9fnsJUqatVTfDUkoFa47a','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c271f-2dd5-77ee-849f-ba2ab3c4fed6','1770182880726.0','1770182880726.0',NULL,'1770787680726.0','y42OP4TYnTHLqksXGhKTJNjIq9NQeNC1','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c2722-92ac-76ad-b78b-97231ee636cb','1770269536194.0','1770183103155.0',NULL,'1770874336194.0','2NyoyfbeeG5MUbLde7uatgpMPwKYWE4E','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c2a6e-74a5-709b-ab81-dee70cffba13','1770238407849.0','1770238407849.0',NULL,'1770843207849.0','5UVl9TvzcbuLJbNdNKTWoC2OPNP6yu4b','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0','019c2a6e-73c1-75ab-aeff-f8de245eaa6d');
INSERT INTO sessions VALUES('019c2a72-d1a9-74f8-b8cc-9657d9b31068','1770238693805.0','1770238693805.0',NULL,'1770843493805.0','f2Eae2LFekV24Xu0KAVPUCBKaMmaxmra','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0','019c2a6e-73c1-75ab-aeff-f8de245eaa6d');
INSERT INTO sessions VALUES('019c2a7f-4117-7009-882b-73d38ee59b8f','1770239508760.0','1770239508760.0',NULL,'1770844308760.0','hO6wdupIgI7U9OSxeoTdLFflN14LoNvQ','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/145.0.7632.6 Safari/537.36','019c2a6e-73c1-75ab-aeff-f8de245eaa6d');
INSERT INTO sessions VALUES('019c3047-304a-753e-b105-08e58e43b5cb','1770447648776.0','1770336497741.0',NULL,'1771052448776.0','9CyGqm8tf0UlyWGONjm9ZLsFuNs7qOk2','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c36f1-0793-76f0-94a4-07ad4711c613','1770448291732.0','1770448291732.0',NULL,'1771053091732.0','qkmzFsIhqD46BfVgIvFcwyUtnX5QGWBK','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c36f2-a568-751a-8165-1e3bdbf31c0c','1770448397672.0','1770448397672.0',NULL,'1771053197672.0','L4SczRurQsfrX9T9DQ8JVvb2vSL2WoYi','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c36f9-015e-7369-944d-71ea49685cd7','1770448814430.0','1770448814430.0',NULL,'1771053614430.0','yrGJyUPoVYSQDun9w7Pzj42ojoVIldaA','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c36fa-c258-7518-be81-0914fdf0f057','1770448929368.0','1770448929368.0',NULL,'1771053729368.0','ZDZ4TOTfEWp6WymRA1k4ulOQJs35gG5o','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c3726-08b8-74af-9968-bcbe4895fe2c','1770451765432.0','1770451765432.0',NULL,'1771056565432.0','YoB0wMZm8WXaJIXJk23zHaLs6pErIeDT','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c397c-c82d-73ae-b52e-1b976ab8de6a','1770491004973.0','1770491004973.0',NULL,'1771095804973.0','tgqx2Wrf3Dk7W2tV1mTvr0XkJOTZYG7P','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c39e6-903a-743c-9062-907e8f99da07','1770497937466.0','1770497937466.0',NULL,'1771102737466.0','s3X33XUJrkqfKct13tRmhmQy25GlhvvQ','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c3a0b-8c8a-7416-908c-f1995493b7aa','1770500361354.0','1770500361354.0',NULL,'1771105161354.0','GlR6ACcSx7CVUBTza6HD7CR584iTQDuy','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c3b45-4369-7591-9e46-847ae0526746','1770520920937.0','1770520920937.0',NULL,'1771125720937.0','LVHl7VPEr6hO6gDsbzFtD1IhysIryp38','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c3ba1-8bf4-718d-abc0-aa8e96bb3291','1770526968821.0','1770526968821.0',NULL,'1771131768821.0','nqulrbsXlpGvYj9gRJbDtPbiOS0RESSt','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c3c18-e8be-72cc-b870-07b4ccd44d32','1770534791359.0','1770534791359.0',NULL,'1771139591359.0','hPz7dF7EmgHRioy55oq9L1nR6nAps5Ye','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c3c40-cbd1-71e1-83e7-2379a48b8ff2','1770537405394.0','1770537405394.0',NULL,'1771142205393.0','AkNhHEqb28fsc5WjdydGj24qmM87qp0J','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c3e10-51df-7428-b9ae-408b2a727402','1770567782880.0','1770567782880.0',NULL,'1771172582880.0','VPR6mzjPhxinLuIYR4hA2pBceEgxfY6X','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c3f08-5487-756e-8af1-55b55e4bfddc','1770584036488.0','1770584036488.0',NULL,'1771188836487.0','KPVdYBEVoIU3ktCcSBzCcRIl1CoslMSO','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c407e-c178-72cb-8e62-7f25fce2775d','1770608574840.0','1770608574840.0',NULL,'1771213374840.0','FTgn88SEkWfUxJdUcUwtt3idgT7SKtkO','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c409e-d2e4-700e-bda9-02c02bb4659b','1770610676453.0','1770610676453.0',NULL,'1771215476453.0','PsOtCStwT3O72JpY96hvRdpYSuIET2Ki','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c438c-4efd-738a-9977-ccadf2ca7864','1770659794686.0','1770659794686.0',NULL,'1771264594686.0','ZuC5SaTv8xojn5vam0I4qminJ4qpchiq','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c43a5-befa-7289-990d-e70dcce24df1','1770779597610.0','1770661461755.0',NULL,'1771384397610.0','KJZkSiATMikJJxkwxQC6iPlEuJOsTbQV','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c4ab0-6aae-741b-9757-1016c0be25cb','1770914508548.0','1770779601583.0',NULL,'1771519308548.0','Hp2bKSiXt4NZKRnVKyZoDgRXNLgzTTb9','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c52d4-19d8-734e-b386-33cc03259dc5','1771286386478.0','1770916157912.0',NULL,'1771891186478.0','5b8T4Wa75FHASHD9uIw5UE5zwLji59wf','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c688e-f5f6-747b-abfc-897a3de57bfd','1771280725495.0','1771280725495.0',NULL,'1771885525494.0','x7yzGCTits4Iaobuy66H1y7IcbvJehA7','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c68c8-0c4a-73fe-bac9-f9aa462ca7ad','1771284466765.0','1771284466765.0',NULL,'1771889266763.0','siPBtZi2jppXA1airTsDlvTBsysIh2yZ','','','019c2a6e-73c1-75ab-aeff-f8de245eaa6d');
INSERT INTO sessions VALUES('019c68c8-97ec-75ee-9ec1-016a55c94781','1771284502508.0','1771284502508.0',NULL,'1771889302508.0','nles9z5QG8vbyVhL7M5LOhJhxYdwVuIO','','','019c68c8-9789-7259-8197-5cda57ff5adc');
INSERT INTO sessions VALUES('019c68c8-e0e0-7006-accc-48f1bbb3a7c1','1771284521187.0','1771284521187.0',NULL,'1771889321185.0','24LCzWcAsPiB5HsSkUk951lg2XHxaHqu','','','019c2a6e-73c1-75ab-aeff-f8de245eaa6d');
INSERT INTO sessions VALUES('019c68c8-ed19-746a-9754-0cef63849100','1771284524315.0','1771284524315.0',NULL,'1771889324314.0','WGlWXrdyJQmr4GmNFGEAuSGvdgvmo1hM','','','019c2a6e-73c1-75ab-aeff-f8de245eaa6d');
INSERT INTO sessions VALUES('019c68c9-a073-720b-b880-32b6c04082ea','1771284570229.0','1771284570229.0',NULL,'1771889370228.0','H8WVwSsBycB0oCBf6WoBbnUuYD02wNCM','','','019c2a6e-73c1-75ab-aeff-f8de245eaa6d');
INSERT INTO sessions VALUES('019c68cf-4de2-723d-a429-f513677184b2','1771284942308.0','1771284942308.0',NULL,'1771889742306.0','1gjMlFlugnnvC4jkc9YiOEuYfMgUWbHd','','','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('019c68cf-8e69-72bd-8167-8eb2bb3cb8fd','1771284958827.0','1771284958827.0',NULL,'1771889758825.0','hufHjHsKnRm1CrAcPL6FH3K98c21sEsA','','','019c2a6e-73c1-75ab-aeff-f8de245eaa6d');
INSERT INTO sessions VALUES('019c68cf-bcbe-755d-b946-3a95a2900673','1771284970688.0','1771284970688.0',NULL,'1771889770687.0','oF1DG1MKRw3C6Sqy8rkvTnMOEvqV4KNs','','','019c2a6e-73c1-75ab-aeff-f8de245eaa6d');
INSERT INTO sessions VALUES('019c68dd-7de9-72c8-bbdf-4d5ae0ee963a','1771285872106.0','1771285872106.0',NULL,'1771890672106.0','rY6TEaYEPZcd1VVy0tnEXf2yabv3b7hr','','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('01a0f954-9701-7601-8bf3-2a1701e82011','1791063354839.0','1790889465602.0',NULL,'1791668154839.0','n7YVNxPMGXcHWo4v2R6h2elD0yOaVHTT','100.70.189.105','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('01a15036-fc28-73be-b4eb-fb0ae6c7df15','1792947759955.0','1792347143209.0',NULL,'1793552559955.0','VkUJh80eMjSAwkJEbetVeyTNiOjTj4Gd','100.70.189.105','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('01a15a94-c27d-71f8-9b7a-0f7f750aae63','1792521060990.0','1792521060990.0',NULL,'1793125860990.0','MCysVwKyH5Z44DeBwjs4Wxz0BFN9LaW4','100.71.193.43','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('01a17ace-cbc1-7509-9d2f-dba81eb13391','1793284942894.0','1793061735362.0',NULL,'1793889742894.0','bzVkIJoxjDf8jXbTAEolTqYmj7HNMRPR','100.70.189.105','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('01a18eda-c389-7603-911e-940313798b4f','1793398064012.0','1793398064012.0',NULL,'1794002864010.0','cIeULnRUQFS7wDRiUSrnbvEZ6sDnaZcp','179.53.198.12','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('01a1929b-e86c-748c-b370-5851fe2c4a06','1793461053549.0','1793461053549.0',NULL,'1794065853549.0','4jnpBjbe5sg6wDxuMBBnBirBfqBGyLQ1','179.53.198.12','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('01a193c9-689a-7550-aace-30bdaacb0e6e','1793573193920.0','1793480812698.0',NULL,'1794177993920.0','Kb0bkI7YMcWEDgMiHKnuZzIIFJdiLuqD','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
INSERT INTO sessions VALUES('01a1994c-42c2-74b9-a9a6-8830513840dc','1793573274306.0','1793573274306.0',NULL,'1794178074306.0','5Sk6dEBaqpbeOhx4jKPQp1HrD3RmjNCO','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','019c25bf-2c88-7317-a971-da87c8c8eebb');
CREATE TABLE IF NOT EXISTS "users" (
	`id` text PRIMARY KEY,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text
);
INSERT INTO users VALUES('019c25bf-2c88-7317-a971-da87c8c8eebb','1770159811719.0','1770159811719.0',NULL,'Wesley Bliss','wesley.bliss@gmail.com',0,NULL);
INSERT INTO users VALUES('019c2a6e-73c1-75ab-aeff-f8de245eaa6d','1770238407616.0','1770238407616.0',NULL,'Corporal Max Sterling','corporalmaxsterling@gmail.com',0,NULL);
INSERT INTO users VALUES('019c68c8-9789-7259-8197-5cda57ff5adc','1771284502407.0','1771284502407.0',NULL,'Test User','testuserqibtx@example.com',0,NULL);
CREATE TABLE IF NOT EXISTS "tasks" (
	`id` text PRIMARY KEY,
	`updatedAt` text NOT NULL,
	`createdAt` text NOT NULL,
	`deletedAt` text,
	`userId` text NOT NULL,
	`projectId` text NOT NULL,
	`localId` integer NOT NULL,
	`key` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'backlog' NOT NULL,
	`priority` text DEFAULT 'medium',
	`dueDate` text,
	`assigneeId` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isStarred` integer DEFAULT false NOT NULL,
	CONSTRAINT `fk_tasks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_tasks_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_tasks_assigneeId_users_id_fk` FOREIGN KEY (`assigneeId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
INSERT INTO tasks VALUES('019c407e-510b-713c-bbe2-4d1c4d0cbf09','2026-02-09T03:42:26.060Z','2026-02-09T03:42:26.060Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',1,'TEST-1','When uploading a document, check whether the document has already be uploaded previously and notify the user.',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685ffwz5','\n',char(10)),'done','medium',NULL,NULL,1000,0);
INSERT INTO tasks VALUES('019c407e-51ea-72af-9942-ff952b6add3b','2026-10-30T16:15:43.087Z','2026-02-09T03:42:26.283Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',2,'TEST-2','Change Flatpickr to react-datepicker',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86869m1bj','\n',char(10)),'in-progress','medium',NULL,NULL,2000,0);
INSERT INTO tasks VALUES('019c407e-529c-7007-9af3-674cfe8ffc1c','2026-10-30T16:15:38.591Z','2026-02-09T03:42:26.460Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',3,'TEST-3','Replace all direct `indexDocument` calls with a queue job to prevent memory issues',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86865gpeh','\n',char(10)),'backlog','medium',NULL,NULL,86000,0);
INSERT INTO tasks VALUES('019c407e-5349-761f-be8e-30984b315103','2026-10-30T19:55:54.787Z','2026-02-09T03:42:26.633Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',4,'TEST-4','Allow designating a user as org admin',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686gt2uh','\n',char(10)),'todo','medium',NULL,NULL,1000,0);
INSERT INTO tasks VALUES('019c407e-5402-7749-ba03-558b6bd3bc4e','2026-02-09T03:42:26.818Z','2026-02-09T03:42:26.818Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',5,'TEST-5','Annotations Rule: If multiple page annotations captured, use the first one',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686hg3q1','\n',char(10)),'backlog','medium',NULL,NULL,87000,0);
INSERT INTO tasks VALUES('019c407e-54b6-75af-ac59-315e579f9fd3','2026-02-09T03:42:26.998Z','2026-02-09T03:42:26.998Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',6,'TEST-6','BUG: Clicking the Hand tool in LabelStudio doesn''t allow for the tool to work on the first try',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686hg58p','\n',char(10)),'backlog','medium',NULL,NULL,88000,0);
INSERT INTO tasks VALUES('019c407e-5567-76fb-a7ab-1fb2cbf02bd8','2026-02-09T03:42:27.175Z','2026-02-09T03:42:27.176Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',7,'TEST-7','[Vanta] Remediate "Firewall default disallows traffic (GCP)"',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86877gy3d','\n',char(10)),'backlog','medium',NULL,NULL,5000,0);
INSERT INTO tasks VALUES('019c407e-5614-770e-a5b1-ce83865790a3','2026-11-02T00:59:41.696Z','2026-02-09T03:42:27.348Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',8,'TEST-8','Update Website to handle error code from API for new check formats / checks requiring OCR',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/863gnkyt3','\n',char(10)),'backlog','medium',NULL,NULL,85000,0);
INSERT INTO tasks VALUES('019c407e-56c1-74c7-bbe1-7005638622a3','2026-02-09T03:42:27.521Z','2026-02-09T03:42:27.521Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',9,'TEST-9','DESIGN ISSUE: Parties alignment needs updates',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/868chdhh9','\n',char(10)),'backlog','medium',NULL,NULL,7000,0);
INSERT INTO tasks VALUES('019c407e-5764-7683-8142-25fff786706f','2026-02-09T03:42:27.684Z','2026-02-09T03:42:27.684Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',10,'TEST-10','Add a way to cancel drawing a bounding box (Esc, or click outside the drawable area)',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686gt1f8','\n',char(10)),'backlog','medium',NULL,NULL,8000,0);
INSERT INTO tasks VALUES('019c407e-5806-722b-a402-1aa7f3d36c79','2026-02-09T03:42:27.846Z','2026-02-09T03:42:27.846Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',11,'TEST-11','LabelStudio: When creating a new annotation, scroll to the annotation in the right list.',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686hg4ne','\n',char(10)),'backlog','medium',NULL,NULL,9000,0);
INSERT INTO tasks VALUES('019c407e-58b6-746e-af3b-729f77a1e443','2026-02-09T03:42:28.022Z','2026-02-09T03:42:28.022Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',12,'TEST-12','Annotate mineral/surface information from comments on runsheets for training LLM',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686hp3rh','\n',char(10)),'backlog','medium',NULL,NULL,10000,0);
INSERT INTO tasks VALUES('019c407e-5969-7183-a922-21a0616c1a3c','2026-02-09T03:42:28.201Z','2026-02-09T03:42:28.201Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',13,'TEST-13','Review use of Full Grantor / Full Grantee',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685521zp','\n',char(10)),'backlog','medium',NULL,NULL,11000,0);
INSERT INTO tasks VALUES('019c407e-5a13-70df-9255-cfdd7034ca37','2026-02-09T03:42:28.371Z','2026-02-09T03:42:28.371Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',14,'TEST-14','Add polygon bounding box for label studio',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/868655raw','\n',char(10)),'backlog','medium',NULL,NULL,12000,0);
INSERT INTO tasks VALUES('019c407e-5aba-762c-829e-7e2790c2b796','2026-02-09T03:42:28.538Z','2026-02-09T03:42:28.538Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',15,'TEST-15','Title Chain: Freeze the top rows showing the document info so this is always visible to a user',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/868814469','\n',char(10)),'backlog','medium',NULL,NULL,13000,0);
INSERT INTO tasks VALUES('019c407e-5b68-70f6-9d73-d5fe57092e1c','2026-02-09T03:42:28.712Z','2026-02-09T03:42:28.712Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',16,'TEST-16','Deaf Smith Data Import',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685mxx01','\n',char(10)),'backlog','medium',NULL,NULL,14000,0);
INSERT INTO tasks VALUES('019c407e-5c1a-7038-85ab-8522eaabd24a','2026-02-09T03:42:28.890Z','2026-02-09T03:42:28.890Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',17,'TEST-17','Finish Deaf Smith Conversion',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685mwd25','\n',char(10)),'backlog','medium',NULL,NULL,15000,0);
INSERT INTO tasks VALUES('019c407e-5cc5-775e-aa56-5b365803ff2f','2026-02-09T03:42:29.061Z','2026-02-09T03:42:29.061Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',18,'TEST-18','Copy sample dataset from prod to staging',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688af42f','\n',char(10)),'backlog','medium',NULL,NULL,16000,0);
INSERT INTO tasks VALUES('019c407e-5d6e-7410-bb89-45da4cf51f84','2026-02-09T03:42:29.230Z','2026-02-09T03:42:29.230Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',19,'TEST-19','Message should go out on Customer Success Slack when new user signs up',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685eeuu1','\n',char(10)),'backlog','medium',NULL,NULL,17000,0);
INSERT INTO tasks VALUES('019c407e-5e18-74e9-885a-7ceadb15619b','2026-02-09T03:42:29.400Z','2026-02-09T03:42:29.400Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',20,'TEST-20','Review Cutting down LabelStudio Code / Forking',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685cf44t','\n',char(10)),'backlog','medium',NULL,NULL,18000,0);
INSERT INTO tasks VALUES('019c407e-5ebf-777c-a6a1-26185a02814d','2026-02-09T03:42:29.567Z','2026-02-09T03:42:29.567Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',21,'TEST-21','Once a Document is Ready to Be Annotated or has ML Model Applied - Remove Document Review Screen and go Straight to LabelStudio',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8684vhw6d','\n',char(10)),'backlog','medium',NULL,NULL,19000,0);
INSERT INTO tasks VALUES('019c407e-5f67-7075-b186-6821ff0c03cd','2026-02-09T03:42:29.735Z','2026-02-09T03:42:29.735Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',22,'TEST-22','Token System - When to Charge',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685jky9a','\n',char(10)),'backlog','medium',NULL,NULL,20000,0);
INSERT INTO tasks VALUES('019c407e-6015-7093-9ea0-4d914a162cb3','2026-02-09T03:42:29.909Z','2026-02-09T03:42:29.909Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',23,'TEST-23','Flag Missing well payment in Check Parser',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86864nb2x','\n',char(10)),'backlog','medium',NULL,NULL,21000,0);
INSERT INTO tasks VALUES('019c407e-60c1-726a-a21e-c3152a5b578d','2026-02-09T03:42:30.081Z','2026-02-09T03:42:30.081Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',24,'TEST-24','Flag missing check in Check Parser',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86864nb5v','\n',char(10)),'backlog','medium',NULL,NULL,22000,0);
INSERT INTO tasks VALUES('019c407e-6167-70c7-937f-014e864b8525','2026-02-09T03:42:30.247Z','2026-02-09T03:42:30.247Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',25,'TEST-25','Annotations: Annotate Instrument Date and Filing Date in handwritten docs',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688043ef','\n',char(10)),'backlog','medium',NULL,NULL,23000,0);
INSERT INTO tasks VALUES('019c407e-6218-7565-8c9c-3e3613a8377f','2026-02-09T03:42:30.424Z','2026-02-09T03:42:30.424Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',26,'TEST-26','After deleting an annotation, and adding doc to runsheet, the annotation pass through',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688cgnya','\n',char(10)),'backlog','medium',NULL,NULL,24000,0);
INSERT INTO tasks VALUES('019c407e-62c1-7639-bade-0849b43ab7bd','2026-02-09T03:42:30.593Z','2026-02-09T03:42:30.593Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',27,'TEST-27','Incorporate API for pulling contact data for Tract Owners',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688f347n','\n',char(10)),'backlog','medium',NULL,NULL,25000,0);
INSERT INTO tasks VALUES('019c407e-6414-7038-8d1a-23024bcd7b21','2026-02-09T03:42:30.932Z','2026-02-09T03:42:30.932Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',28,'TEST-28','BUG?: Page Width for Doc Viewer in Edit Document modal doesn''t seem to work properly',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/868cfuk0n','\n',char(10)),'backlog','medium',NULL,NULL,26000,0);
INSERT INTO tasks VALUES('019c407e-64bb-77ac-b67a-f936739f5e8d','2026-02-09T03:42:31.099Z','2026-02-09T03:42:31.099Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',29,'TEST-29','Look Into Removing Useless Emails on Customer Success Slack (DMARC, etc)',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685eeunu','\n',char(10)),'backlog','medium',NULL,NULL,27000,0);
INSERT INTO tasks VALUES('019c407e-656c-7794-a520-062e89f82e2b','2026-02-09T03:42:31.276Z','2026-02-09T03:42:31.276Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',30,'TEST-30','Offer Autocomplete / Drop Down Select with possible values on ES Index Search',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685ef41a','\n',char(10)),'backlog','medium',NULL,NULL,28000,0);
INSERT INTO tasks VALUES('019c407e-6613-7709-893e-24fe7c36465c','2026-02-09T03:42:31.443Z','2026-02-09T03:42:31.443Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',31,'TEST-31','Merge Search Pages for Indexes and Annotated Data',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/863gmatqm','\n',char(10)),'backlog','medium',NULL,NULL,29000,0);
INSERT INTO tasks VALUES('019c407e-66bb-7462-87a5-7b02c5f773a4','2026-02-09T03:42:31.611Z','2026-02-09T03:42:31.611Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',32,'TEST-32','Add an additional status column for documents "User Status"',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8684wkxqb','\n',char(10)),'backlog','medium',NULL,NULL,30000,0);
INSERT INTO tasks VALUES('019c407e-6769-700e-b3e9-3e9aee235408','2026-02-09T03:42:31.785Z','2026-02-09T03:42:31.785Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',33,'TEST-33','Put Pager Duty in More Places (Currently only for Queue Working)',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8684zw3gv','\n',char(10)),'backlog','medium',NULL,NULL,31000,0);
INSERT INTO tasks VALUES('019c407e-6822-75ca-a8e5-897605d424df','2026-02-09T03:42:31.970Z','2026-02-09T03:42:31.970Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',34,'TEST-34','Search within Full Text Search Results',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86864h1en','\n',char(10)),'backlog','medium',NULL,NULL,32000,0);
INSERT INTO tasks VALUES('019c407e-68cd-73aa-bf63-2eab4718b7de','2026-02-09T03:42:32.141Z','2026-02-09T03:42:32.141Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',35,'TEST-35','Highlight matched terms in the documents table columns',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686nddqf','\n',char(10)),'backlog','medium',NULL,NULL,33000,0);
INSERT INTO tasks VALUES('019c407e-6983-73fa-9a68-3d7c83fa15dc','2026-02-09T03:42:32.323Z','2026-02-09T03:42:32.323Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',36,'TEST-36','Update scripts & utilities to be aware of the new staging database',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687w8uap','\n',char(10)),'backlog','medium',NULL,NULL,34000,0);
INSERT INTO tasks VALUES('019c407e-6a37-708b-8c36-cf254fa898c8','2026-02-09T03:42:32.503Z','2026-02-09T03:42:32.503Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',37,'TEST-37','Check Statuses / Page Counts',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8684x5h57','\n',char(10)),'backlog','medium',NULL,NULL,35000,0);
INSERT INTO tasks VALUES('019c407e-6ae1-71db-80ec-a14dfd05b957','2026-02-09T03:42:32.673Z','2026-02-09T03:42:32.673Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',38,'TEST-38','Implement GhostScript to Reduce Uploaded PDF size',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8684ry3h8','\n',char(10)),'backlog','medium',NULL,NULL,36000,0);
INSERT INTO tasks VALUES('019c407e-6b89-7554-bd38-37b5a6f9f0c0','2026-02-09T03:42:32.841Z','2026-02-09T03:42:32.841Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',39,'TEST-39','Update GCS bucket strategy',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/865bhvemf','\n',char(10)),'backlog','medium',NULL,NULL,37000,0);
INSERT INTO tasks VALUES('019c407e-6c3c-75ff-bfeb-8f0c17dca5aa','2026-02-09T03:42:33.020Z','2026-02-09T03:42:33.020Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',40,'TEST-40','When existing data exists from a runsheet, confirm if user wants to reuse it.',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/863gukgcz','\n',char(10)),'backlog','medium',NULL,NULL,38000,0);
INSERT INTO tasks VALUES('019c407e-6cea-7141-bbd7-06d9b85ac017','2026-02-09T03:42:33.194Z','2026-02-09T03:42:33.194Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',41,'TEST-41','Image Rotation - Page by Page Basis - Label Studio?',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8684xuu6v','\n',char(10)),'backlog','medium',NULL,NULL,39000,0);
INSERT INTO tasks VALUES('019c407e-6da5-705f-bb12-a1de7db2fa89','2026-02-09T03:42:33.381Z','2026-02-09T03:42:33.381Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',42,'TEST-42','Update old reactive component to v18',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8684wpxta','\n',char(10)),'backlog','medium',NULL,NULL,40000,0);
INSERT INTO tasks VALUES('019c407e-6e74-773e-98b8-cf5e1ab3c389','2026-02-09T03:42:33.588Z','2026-02-09T03:42:33.588Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',43,'TEST-43','RaziExchange API Integration',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685x12ef','\n',char(10)),'backlog','medium',NULL,NULL,41000,0);
INSERT INTO tasks VALUES('019c407e-6f27-77ef-ae6e-3cf25f1ac5e1','2026-02-09T03:42:33.767Z','2026-02-09T03:42:33.767Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',44,'TEST-44','Implementing Google Analytics And Getting More Granular Tracking of Actions',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685nfmpk','\n',char(10)),'backlog','medium',NULL,NULL,42000,0);
INSERT INTO tasks VALUES('019c407e-7006-77e1-a3c7-4baa35b3ea59','2026-02-09T03:42:33.990Z','2026-02-09T03:42:33.990Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',45,'TEST-45','Investigate Deaf Smith missing rec info',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686m7gzr','\n',char(10)),'backlog','medium',NULL,NULL,43000,0);
INSERT INTO tasks VALUES('019c407e-70b9-724c-8ed1-ff92ef1b088f','2026-02-09T03:42:34.169Z','2026-02-09T03:42:34.169Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',46,'TEST-46','Fix version bumps on deploys',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687y51eu','\n',char(10)),'backlog','medium',NULL,NULL,44000,0);
INSERT INTO tasks VALUES('019c407e-718d-73b0-a5e7-9b403e1fdcc8','2026-02-09T03:42:34.381Z','2026-02-09T03:42:34.381Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',47,'TEST-47','Update queue API to actually return health/ktlo info like API does',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687y51xu','\n',char(10)),'backlog','medium',NULL,NULL,45000,0);
INSERT INTO tasks VALUES('019c407e-7234-74f6-9446-6c3a0f78624a','2026-02-09T03:42:34.548Z','2026-02-09T03:42:34.548Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',48,'TEST-48','Add dashboard feature to switch between different deed parser models per new functionality in BE',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/868715939','\n',char(10)),'backlog','medium',NULL,NULL,46000,0);
INSERT INTO tasks VALUES('019c407e-72d9-744f-9071-a458b8beaf38','2026-02-09T03:42:34.713Z','2026-02-09T03:42:34.713Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',49,'TEST-49','Investigate utilizing Elastic APM for web errors',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687y5368','\n',char(10)),'backlog','medium',NULL,NULL,47000,0);
INSERT INTO tasks VALUES('019c407e-7384-763e-a18c-d7e32df1c190','2026-02-09T03:42:34.884Z','2026-02-09T03:42:34.884Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',50,'TEST-50','Purge Check Report that''s older than 2 months',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688e5qkr','\n',char(10)),'backlog','medium',NULL,NULL,48000,0);
INSERT INTO tasks VALUES('019c407e-7434-741c-8723-35f009271a1e','2026-02-09T03:42:35.060Z','2026-02-09T03:42:35.060Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',51,'TEST-51','Better Display Where Match on ES Broad Search Came From',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685efa4b','\n',char(10)),'backlog','medium',NULL,NULL,49000,0);
INSERT INTO tasks VALUES('019c407e-74eb-711c-8a7e-324c396f9cbe','2026-02-09T03:42:35.243Z','2026-02-09T03:42:35.243Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',52,'TEST-52','Add a Text Search box in the annotations screen so that users can search a document for specific text (e.g. a parcel ID number)',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86859nfk8','\n',char(10)),'backlog','medium',NULL,NULL,50000,0);
INSERT INTO tasks VALUES('019c407e-7597-74da-b52e-6ba7990fb4cc','2026-02-09T03:42:35.415Z','2026-02-09T03:42:35.415Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',53,'TEST-53','Add button to process OCR only, using new Deed Parser endpoint',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685hyc1j','\n',char(10)),'backlog','medium',NULL,NULL,51000,0);
INSERT INTO tasks VALUES('019c407e-763b-766a-905e-1cdb5ab017c9','2026-02-09T03:42:35.579Z','2026-02-09T03:42:35.579Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',54,'TEST-54','Warning Screen for Identical Documents Uploaded',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8685fuz7b','\n',char(10)),'backlog','medium',NULL,NULL,52000,0);
INSERT INTO tasks VALUES('019c407e-76ed-7359-be69-11bf05c6744e','2026-02-09T03:42:35.757Z','2026-02-09T03:42:35.757Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',55,'TEST-55','Edit Annotation OCR Results',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86867595c','\n',char(10)),'backlog','medium',NULL,NULL,53000,0);
INSERT INTO tasks VALUES('019c407e-7796-777a-b735-a2341fc5dacb','2026-02-09T03:42:35.926Z','2026-02-09T03:42:35.926Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',56,'TEST-56','Update Document, Refresh Page, Verify All Annotation Edits Persist',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86867595e','\n',char(10)),'backlog','medium',NULL,NULL,54000,0);
INSERT INTO tasks VALUES('019c407e-7840-75e4-b7b4-5eca8d03aeec','2026-02-09T03:42:36.096Z','2026-02-09T03:42:36.096Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',57,'TEST-57','Verify All Annotated Data Displaying on Doc Search Page',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86867595k','\n',char(10)),'backlog','medium',NULL,NULL,55000,0);
INSERT INTO tasks VALUES('019c407e-78e5-704a-96fa-68790c3d0ad3','2026-02-09T03:42:36.261Z','2026-02-09T03:42:36.261Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',58,'TEST-58','Remove react-tooltip to use daisyui tooltip',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686fj582','\n',char(10)),'backlog','medium',NULL,NULL,56000,0);
INSERT INTO tasks VALUES('019c407e-798b-7508-8f01-406cdae58996','2026-02-09T03:42:36.427Z','2026-02-09T03:42:36.427Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',59,'TEST-59','On LabelStudio, change the cursor when Rectangle is selected to ''crosshair''',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686hkv1d','\n',char(10)),'backlog','medium',NULL,NULL,57000,0);
INSERT INTO tasks VALUES('019c407e-7a3a-7325-91e7-a015b8186d2c','2026-02-09T03:42:36.602Z','2026-02-09T03:42:36.602Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',60,'TEST-60','On LabelStudio, Scroll to the bounding box whenever an annotation is selected on the right side',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686hkwkj','\n',char(10)),'backlog','medium',NULL,NULL,58000,0);
INSERT INTO tasks VALUES('019c407e-7ae0-733f-9e08-d6d267371642','2026-02-09T03:42:36.768Z','2026-02-09T03:42:36.768Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',61,'TEST-61','Logical Check for Grantors/Grantees'' Names',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686rayf4','\n',char(10)),'backlog','medium',NULL,NULL,59000,0);
INSERT INTO tasks VALUES('019c407e-7b88-7755-8434-0aaa088a147a','2026-02-09T03:42:36.936Z','2026-02-09T03:42:36.936Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',62,'TEST-62','Create separate buckets for saving document images for each environment',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688zz7q9','\n',char(10)),'backlog','medium',NULL,NULL,60000,0);
INSERT INTO tasks VALUES('019c407e-7c31-7173-b924-29e7611a6d69','2026-02-09T03:42:37.105Z','2026-02-09T03:42:37.105Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',63,'TEST-63','Add a new column into the title chainer UI to determine whether its dynamic or not',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686pma0e','\n',char(10)),'backlog','medium',NULL,NULL,61000,0);
INSERT INTO tasks VALUES('019c407e-7d5d-7048-a0a9-5a22fcd45d06','2026-02-09T03:42:37.405Z','2026-02-09T03:42:37.405Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',64,'TEST-64','SendGrid domain doesn''t have a valid TLS cert',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86870nkup','\n',char(10)),'backlog','medium',NULL,NULL,62000,0);
INSERT INTO tasks VALUES('019c407e-7e04-72bb-8452-02554a69043f','2026-02-09T03:42:37.573Z','2026-02-09T03:42:37.573Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',65,'TEST-65','Structurize out of network check annotation process (MWF update)',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8686ad33g','\n',char(10)),'backlog','medium',NULL,NULL,63000,0);
INSERT INTO tasks VALUES('019c407e-7eb6-767e-886c-83230059b94e','2026-02-09T03:42:37.750Z','2026-02-09T03:42:37.750Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',66,'TEST-66','SendGrid redirect domain SSL certificate flagged',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/868728j14','\n',char(10)),'backlog','medium',NULL,NULL,64000,0);
INSERT INTO tasks VALUES('019c407e-7f67-72a8-8321-75303fa7d466','2026-02-09T03:42:37.927Z','2026-02-09T03:42:37.927Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',67,'TEST-67','Export all users to a spreadsheet for backup',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/86878ra72','\n',char(10)),'backlog','medium',NULL,NULL,65000,0);
INSERT INTO tasks VALUES('019c407e-800d-709b-9444-6c657bd6c383','2026-02-09T03:42:38.093Z','2026-02-09T03:42:38.093Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',68,'TEST-68','Investigate page flicker on web',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687a5yge','\n',char(10)),'backlog','medium',NULL,NULL,66000,0);
INSERT INTO tasks VALUES('019c407e-80b8-736e-85b3-3fd3167dd833','2026-02-09T03:42:38.264Z','2026-02-09T03:42:38.264Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',69,'TEST-69','Fix county collection search highlighting bbox scaling',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687ak4tn','\n',char(10)),'backlog','medium',NULL,NULL,67000,0);
INSERT INTO tasks VALUES('019c407e-8167-770c-9919-7c9e410e78aa','2026-02-09T03:42:38.439Z','2026-02-09T03:42:38.439Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',70,'TEST-70','Investigate failing runsheet exports',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687bpa9k','\n',char(10)),'backlog','medium',NULL,NULL,68000,0);
INSERT INTO tasks VALUES('019c407e-8213-77f8-b2ad-dc94a46aee92','2026-02-09T03:42:38.611Z','2026-02-09T03:42:38.611Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',71,'TEST-71','Enable cloud firewalls to restrict region access',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687e0m6m','\n',char(10)),'backlog','medium',NULL,NULL,69000,0);
INSERT INTO tasks VALUES('019c407e-82b9-728f-bdd5-88b48e2fb9ac','2026-02-09T03:42:38.777Z','2026-02-09T03:42:38.777Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',72,'TEST-72','Queue CRON job to check parity between database & ElasticSearch',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687efjx7','\n',char(10)),'backlog','medium',NULL,NULL,70000,0);
INSERT INTO tasks VALUES('019c407e-8365-706c-8adf-8e8f8911656e','2026-02-09T03:42:38.949Z','2026-02-09T03:42:38.949Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',73,'TEST-73','Create integration test to validate collection flow',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687eqzy4','\n',char(10)),'backlog','medium',NULL,NULL,71000,0);
INSERT INTO tasks VALUES('019c407e-840f-7542-a60d-c0eabda1481c','2026-02-09T03:42:39.119Z','2026-02-09T03:42:39.119Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',74,'TEST-74','Create integration test to validate runsheet flow',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687er01m','\n',char(10)),'backlog','medium',NULL,NULL,72000,0);
INSERT INTO tasks VALUES('019c407e-84be-7483-bc73-2071e95e6dc8','2026-02-09T03:42:39.294Z','2026-02-09T03:42:39.294Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',75,'TEST-75','Inform the user that a document within a runsheet got annotation updates',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687f9jw1','\n',char(10)),'backlog','medium',NULL,NULL,73000,0);
INSERT INTO tasks VALUES('019c407e-856d-71ce-859d-094d0b0018ef','2026-02-09T03:42:39.469Z','2026-02-09T03:42:39.469Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',76,'TEST-76','Check on Elastic Search Dashboard. Some queries seem to be failing',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687v8k69','\n',char(10)),'backlog','medium',NULL,NULL,74000,0);
INSERT INTO tasks VALUES('019c407e-8613-747c-ac6e-38fe0452395f','2026-02-09T03:42:39.635Z','2026-02-09T03:42:39.635Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',77,'TEST-77','Fork Label Studio',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687zcazp','\n',char(10)),'backlog','medium',NULL,NULL,75000,0);
INSERT INTO tasks VALUES('019c407e-86ba-75a9-a3d0-ddedd9483a4b','2026-02-09T03:42:39.802Z','2026-02-09T03:42:39.802Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',78,'TEST-78','Make bounding boxes updatable after repositioning in document editor',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687z3w7j','\n',char(10)),'backlog','medium',NULL,NULL,76000,0);
INSERT INTO tasks VALUES('019c407e-8767-74fc-ad70-55f24fa39be3','2026-02-09T03:42:39.975Z','2026-02-09T03:42:39.975Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',79,'TEST-79','Investigate database options',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8687et4a0','\n',char(10)),'backlog','medium',NULL,NULL,77000,0);
INSERT INTO tasks VALUES('019c407e-880f-75cb-aa54-5d636cc6d312','2026-02-09T03:42:40.143Z','2026-02-09T03:42:40.143Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',80,'TEST-80','[Vanta] Remediate "General security awareness training records tracked" for Wes Bliss',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/868839q8b','\n',char(10)),'backlog','medium',NULL,NULL,78000,0);
INSERT INTO tasks VALUES('019c407e-88b5-70ed-817a-7c2c1f1dd216','2026-02-09T03:42:40.309Z','2026-02-09T03:42:40.310Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',81,'TEST-81','[Vanta] Remediate "General security awareness training records tracked" for John Michael Wilshusen',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/868839rwd','\n',char(10)),'backlog','medium',NULL,NULL,79000,0);
INSERT INTO tasks VALUES('019c407e-8967-70b6-899e-2083915df1d0','2026-02-09T03:42:40.487Z','2026-02-09T03:42:40.487Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',82,'TEST-82','Send alert to monitoring channel whenever deedparse fails to process a document',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688e15df','\n',char(10)),'backlog','medium',NULL,NULL,80000,0);
INSERT INTO tasks VALUES('019c407e-8a0e-75ae-a94e-83959843f50d','2026-02-09T03:42:40.654Z','2026-02-09T03:42:40.654Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',83,'TEST-83','By default, Runsheet fields should hide Full Grantor and Full Grantee',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688d6f1j','\n',char(10)),'backlog','medium',NULL,NULL,81000,0);
INSERT INTO tasks VALUES('019c407e-8ab6-761c-b9ae-6a46abc170ce','2026-02-09T03:42:40.822Z','2026-02-09T03:42:40.822Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',84,'TEST-84','Documents not showing if user has Annotator Role and its not assigned to any',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688dd355','\n',char(10)),'backlog','medium',NULL,NULL,82000,0);
INSERT INTO tasks VALUES('019c407e-8b65-7364-b3a5-a7c87b64ed28','2026-02-09T03:42:40.998Z','2026-02-09T03:42:40.998Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',85,'TEST-85','Incorporate state court case search API for current owners',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688f40aa','\n',char(10)),'backlog','medium',NULL,NULL,83000,0);
INSERT INTO tasks VALUES('019c407e-8c0b-76a8-97eb-374212e3171f','2026-02-09T03:42:41.163Z','2026-02-09T03:42:41.163Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',86,'TEST-86','Mark property as SOLD',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688f8ny4','\n',char(10)),'backlog','medium',NULL,NULL,84000,0);
INSERT INTO tasks VALUES('019c407e-8cb6-7606-8732-722cc5cc73c3','2026-02-09T03:42:41.335Z','2026-02-09T03:42:41.335Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',87,'TEST-87','Add possibility to allow checks for deals that are being evaluated but have not been acquired',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688f8pdt','\n',char(10)),'backlog','medium',NULL,NULL,85000,0);
INSERT INTO tasks VALUES('019c407e-8d5c-7738-a69d-0fceb0640c00','2026-02-09T03:42:41.500Z','2026-02-09T03:42:41.500Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',88,'TEST-88','Add feature to detect/handle duplicate documents',replace('Imported from ClickUp\n\nOriginal URL: https://app.clickup.com/t/8688ne5zn','\n',char(10)),'backlog','medium',NULL,NULL,86000,0);
INSERT INTO tasks VALUES('019c6933-213f-77bf-9e36-aa56dc2c45fc','2026-02-17T01:24:44.715Z','2026-02-17T01:24:44.715Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c692b-e451-73e4-b8d1-2f85364b8621',1,'NY2-1','Finish RSVP website','<p></p>','todo','medium',NULL,NULL,1000,0);
INSERT INTO tasks VALUES('019c6a01-7c50-77ed-be11-04c2b6ecbba9','2026-02-17T05:10:08.412Z','2026-02-17T05:10:08.412Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c692b-e451-73e4-b8d1-2f85364b8621',2,'NY2-2','Find accommodations','<ul><li><p>Me &amp; gabby</p></li><li><p>Family</p></li></ul><p></p>','todo','medium',NULL,NULL,2000,0);
INSERT INTO tasks VALUES('019c6a02-d439-73ce-a661-5d87939a1ed5','2026-02-17T05:11:36.453Z','2026-02-17T05:11:36.454Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c692b-e451-73e4-b8d1-2f85364b8621',3,'NY2-3','Find a job','<p></p>','todo','medium',NULL,NULL,3000,0);
INSERT INTO tasks VALUES('01a199c5-0293-77b1-b6be-6bd3bec57164','2026-11-02T00:59:47.883Z','2026-11-02T00:59:47.883Z',NULL,'019c25bf-2c88-7317-a971-da87c8c8eebb','019c3f22-d790-7769-ba24-aa6e5b40691c',89,'TEST-89','New Task','','backlog','medium',NULL,NULL,89000,0);
CREATE UNIQUE INDEX `accounts_provider_account_unique` ON `accounts` (`providerId`,`accountId`);
CREATE UNIQUE INDEX `accounts_user_provider_unique` ON `accounts` (`userId`,`providerId`);
CREATE INDEX `comments_task_id_idx` ON `comments` (`taskId`);
CREATE INDEX `comments_user_id_idx` ON `comments` (`userId`);
CREATE UNIQUE INDEX `projects_team_name_unique` ON `projects` (`teamId`,`name`);
CREATE UNIQUE INDEX `projects_team_slug_unique` ON `projects` (`teamId`,`slug`);
CREATE INDEX `projects_team_id_idx` ON `projects` (`teamId`);
CREATE INDEX `projects_owner_id_idx` ON `projects` (`ownerId`);
CREATE INDEX `task_lanes_project_id_idx` ON `taskLanes` (`projectId`);
CREATE UNIQUE INDEX `task_lanes_project_key_unique` ON `taskLanes` (`projectId`,`key`);
CREATE UNIQUE INDEX `team_members_team_user_unique` ON `teamMembers` (`teamId`,`userId`);
CREATE INDEX `team_members_team_id_idx` ON `teamMembers` (`teamId`);
CREATE INDEX `team_members_user_id_idx` ON `teamMembers` (`userId`);
CREATE UNIQUE INDEX `teams_owner_name_unique` ON `teams` (`ownerId`,`name`);
CREATE UNIQUE INDEX `teams_owner_slug_unique` ON `teams` (`ownerId`,`slug`);
CREATE INDEX `teams_owner_id_idx` ON `teams` (`ownerId`);
CREATE UNIQUE INDEX `verifications_identifier_value_unique` ON `verifications` (`identifier`,`value`);
CREATE UNIQUE INDEX `trello_board_links_board_unique` ON `trelloBoardLinks` (`trelloBoardId`);
CREATE UNIQUE INDEX `trello_board_links_project_unique` ON `trelloBoardLinks` (`projectId`);
CREATE INDEX `trello_board_links_team_id_idx` ON `trelloBoardLinks` (`teamId`);
CREATE INDEX `trello_board_links_user_id_idx` ON `trelloBoardLinks` (`userId`);
CREATE UNIQUE INDEX `trello_card_links_card_unique` ON `trelloCardLinks` (`trelloCardId`);
CREATE UNIQUE INDEX `trello_card_links_task_unique` ON `trelloCardLinks` (`taskId`);
CREATE INDEX `trello_card_links_board_link_id_idx` ON `trelloCardLinks` (`boardLinkId`);
CREATE UNIQUE INDEX `trello_connections_team_id_unique` ON `trelloConnections` (`teamId`);
CREATE INDEX `trello_connections_member_id_idx` ON `trelloConnections` (`trelloMemberId`);
CREATE INDEX `trello_connections_connected_by_user_id_idx` ON `trelloConnections` (`connectedByUserId`);
CREATE UNIQUE INDEX `trello_list_links_list_unique` ON `trelloListLinks` (`trelloListId`);
CREATE UNIQUE INDEX `trello_list_links_lane_unique` ON `trelloListLinks` (`laneId`);
CREATE INDEX `trello_list_links_board_link_id_idx` ON `trelloListLinks` (`boardLinkId`);
CREATE INDEX `trello_oauth_states_user_id_idx` ON `trelloOauthStates` (`userId`);
CREATE INDEX `trello_oauth_states_team_id_idx` ON `trelloOauthStates` (`teamId`);
CREATE UNIQUE INDEX `trello_workspace_links_workspace_unique` ON `trelloWorkspaceLinks` (`teamId`,`trelloWorkspaceId`);
CREATE INDEX `trello_workspace_links_team_id_idx` ON `trelloWorkspaceLinks` (`teamId`);
CREATE UNIQUE INDEX `trello_member_links_team_member_unique` ON `trelloMemberLinks` (`teamId`,`trelloMemberId`);
CREATE INDEX `trello_member_links_team_id_idx` ON `trelloMemberLinks` (`teamId`);
CREATE INDEX `trello_member_links_user_id_idx` ON `trelloMemberLinks` (`userId`);
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`userId`);
CREATE INDEX `tasks_project_id_idx` ON `tasks` (`projectId`);
CREATE UNIQUE INDEX `tasks_project_local_id_unique` ON `tasks` (`projectId`,`localId`);
CREATE UNIQUE INDEX `tasks_project_key_unique` ON `tasks` (`projectId`,`key`);
CREATE INDEX `tasks_user_id_idx` ON `tasks` (`userId`);
CREATE INDEX `tasks_assignee_id_idx` ON `tasks` (`assigneeId`);
CREATE INDEX `tasks_status_idx` ON `tasks` (`status`);
COMMIT;
