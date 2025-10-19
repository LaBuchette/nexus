import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportsTable1760864751816 implements MigrationInterface {
    name = 'CreateReportsTable1760864751816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reports_reason_enum" AS ENUM('harassment', 'hate_speech', 'spam', 'cheating', 'inappropriate_content', 'impersonation', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."reports_status_enum" AS ENUM('pending', 'reviewed', 'resolved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reporterId" uuid NOT NULL, "reportedUserId" uuid NOT NULL, "reason" "public"."reports_reason_enum" NOT NULL, "description" text, "status" "public"."reports_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_4353be8309ce86650def2f8572d" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_c88d2686339ad6d166620b741a6" FOREIGN KEY ("reportedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_c88d2686339ad6d166620b741a6"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_4353be8309ce86650def2f8572d"`);
        await queryRunner.query(`DROP TABLE "reports"`);
        await queryRunner.query(`DROP TYPE "public"."reports_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reports_reason_enum"`);
    }

}
