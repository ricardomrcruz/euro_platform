import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeVehicleTrimYearOptional1786900000003 implements MigrationInterface {
    name = 'MakeVehicleTrimYearOptional1786900000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // A trim name isn't tied to one model-year -- e.g. "AMG Line" has existed across several
        // C-Class generations. Drop year from what makes a trim unique; the car's own year
        // already lives on the Vehicle row.
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_73cb9008ffd28c5e8c28f21d34"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ALTER COLUMN "year" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vehicle_trims_model_name" ON "vehicle_trims" ("modelId", "name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_vehicle_trims_model_name"`);
        await queryRunner.query(`UPDATE "vehicle_trims" SET "year" = 1900 WHERE "year" IS NULL`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ALTER COLUMN "year" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_73cb9008ffd28c5e8c28f21d34" ON "vehicle_trims" ("modelId", "name", "year")`);
    }

}
