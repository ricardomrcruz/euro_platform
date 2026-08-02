import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModelYearEndImageUrl1785693287426 implements MigrationInterface {
    name = 'AddModelYearEndImageUrl1785693287426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicle_models" ADD COLUMN IF NOT EXISTS "image_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicle_models" DROP COLUMN IF EXISTS "image_url"`);
    }

}
