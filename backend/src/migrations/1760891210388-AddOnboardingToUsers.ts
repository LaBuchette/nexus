import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnboardingToUsers1760891210388 implements MigrationInterface {
    name = 'AddOnboardingToUsers1760891210388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "hasCompletedOnboarding" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "hasCompletedOnboarding"`);
    }

}
