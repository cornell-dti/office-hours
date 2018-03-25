CREATE TABLE "users" (
	"userId" serial NOT NULL UNIQUE,
	"netId" TEXT NOT NULL UNIQUE,
	"googleId" TEXT NOT NULL UNIQUE,
	"firstName" TEXT,
	"lastName" TEXT,
	"createdAt" TIMESTAMP,
	"lastActivityAt" TIMESTAMP,
	CONSTRAINT users_pk PRIMARY KEY ("userId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "courses" (
	"courseId" serial NOT NULL,
	"code" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"semester" TEXT NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE NOT NULL,
	CONSTRAINT courses_pk PRIMARY KEY ("courseId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "questions" (
	"questionId" serial NOT NULL,
	"content" TEXT NOT NULL,
	"timeEntered" TIMESTAMP NOT NULL,
	"status" TEXT NOT NULL,
	"timeResolved" TIMESTAMP,
	"sessionId" integer NOT NULL,
	"askerId" integer NOT NULL,
	"answererId" integer,
	CONSTRAINT questions_pk PRIMARY KEY ("questionId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "sessionSeries" (
	"sessionSeriesId" serial NOT NULL,
	"startTime" TIMESTAMP NOT NULL,
	"endTime" TIMESTAMP NOT NULL,
	"location" TEXT NOT NULL,
	"courseId" integer NOT NULL,
	CONSTRAINT sessionSeries_pk PRIMARY KEY ("sessionSeriesId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "sessions" (
	"sessionId" serial NOT NULL,
	"startTime" TIMESTAMP,
	"endTime" TIMESTAMP,
	"location" TEXT,
	"sessionSeriesId" integer,
	CONSTRAINT sessions_pk PRIMARY KEY ("sessionId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "tags" (
	"tagId" serial NOT NULL,
	"name" TEXT NOT NULL,
	"courseId" integer NOT NULL,
	"level" integer NOT NULL,
	CONSTRAINT tags_pk PRIMARY KEY ("tagId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "tagRelations" (
	"parentId" integer NOT NULL,
	"childId" integer NOT NULL,
	CONSTRAINT tagRelations_pk PRIMARY KEY ("parentId","childId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "courseUsers" (
	"courseId" integer NOT NULL,
	"userId" integer NOT NULL,
	"role" TEXT NOT NULL,
	CONSTRAINT courseUsers_pk PRIMARY KEY ("courseId","userId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "questionTags" (
	"questionId" integer NOT NULL,
	"tagId" integer NOT NULL,
	CONSTRAINT questionTags_pk PRIMARY KEY ("questionId","tagId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "sessionTas" (
	"sessionId" integer NOT NULL,
	"userId" integer NOT NULL,
	CONSTRAINT sessionTas_pk PRIMARY KEY ("sessionId","userId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "sessionSeriesTas" (
	"sessionSeriesId" integer NOT NULL,
	"userId" integer NOT NULL,
	CONSTRAINT sessionSeriesTas_pk PRIMARY KEY ("sessionSeriesId","userId")
) WITH (
  OIDS=FALSE
);





ALTER TABLE "questions" ADD CONSTRAINT "questions_fk0" FOREIGN KEY ("sessionId") REFERENCES "sessions"("sessionId");
ALTER TABLE "questions" ADD CONSTRAINT "questions_fk1" FOREIGN KEY ("askerId") REFERENCES "users"("userId");
ALTER TABLE "questions" ADD CONSTRAINT "questions_fk2" FOREIGN KEY ("answererId") REFERENCES "users"("userId");

ALTER TABLE "sessionSeries" ADD CONSTRAINT "sessionSeries_fk0" FOREIGN KEY ("courseId") REFERENCES "courses"("courseId");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_fk0" FOREIGN KEY ("sessionSeriesId") REFERENCES "sessionSeries"("sessionSeriesId");

ALTER TABLE "tags" ADD CONSTRAINT "tags_fk0" FOREIGN KEY ("courseId") REFERENCES "courses"("courseId");

ALTER TABLE "tagRelations" ADD CONSTRAINT "tagRelations_fk0" FOREIGN KEY ("parentId") REFERENCES "tags"("tagId");
ALTER TABLE "tagRelations" ADD CONSTRAINT "tagRelations_fk1" FOREIGN KEY ("childId") REFERENCES "tags"("tagId");

ALTER TABLE "courseUsers" ADD CONSTRAINT "courseUsers_fk0" FOREIGN KEY ("courseId") REFERENCES "courses"("courseId");
ALTER TABLE "courseUsers" ADD CONSTRAINT "courseUsers_fk1" FOREIGN KEY ("userId") REFERENCES "users"("userId");

ALTER TABLE "questionTags" ADD CONSTRAINT "questionTags_fk0" FOREIGN KEY ("questionId") REFERENCES "questions"("questionId");
ALTER TABLE "questionTags" ADD CONSTRAINT "questionTags_fk1" FOREIGN KEY ("tagId") REFERENCES "tags"("tagId");

ALTER TABLE "sessionTas" ADD CONSTRAINT "sessionTas_fk0" FOREIGN KEY ("sessionId") REFERENCES "sessions"("sessionId");
ALTER TABLE "sessionTas" ADD CONSTRAINT "sessionTas_fk1" FOREIGN KEY ("userId") REFERENCES "users"("userId");

ALTER TABLE "sessionSeriesTas" ADD CONSTRAINT "sessionSeriesTas_fk0" FOREIGN KEY ("sessionSeriesId") REFERENCES "sessionSeries"("sessionSeriesId");
ALTER TABLE "sessionSeriesTas" ADD CONSTRAINT "sessionSeriesTas_fk1" FOREIGN KEY ("userId") REFERENCES "users"("userId");

