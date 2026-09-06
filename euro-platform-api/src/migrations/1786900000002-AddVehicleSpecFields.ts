import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVehicleSpecFields1786900000002 implements MigrationInterface {
    name = 'AddVehicleSpecFields1786900000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Additive fuel types -- the old 7 values were missing hydrogen and compressed natural gas.
        await queryRunner.query(`ALTER TYPE "public"."vehicle_trims_fuel_type_enum" ADD VALUE IF NOT EXISTS 'HYDROGEN'`);
        await queryRunner.query(`ALTER TYPE "public"."vehicle_trims_fuel_type_enum" ADD VALUE IF NOT EXISTS 'CNG'`);

        // number_of_doors moves from vehicle_trims (a catalog-level fact) to vehicles (a
        // per-car fact -- the same trim name commonly ships as both a 3-door and 5-door car).
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "number_of_doors" integer`);
        await queryRunner.query(`UPDATE "vehicles" v SET "number_of_doors" = t."number_of_doors" FROM "vehicle_trims" t WHERE v."trimId" = t."id" AND t."number_of_doors" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "number_of_doors"`);

        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "number_of_seats" integer`);

        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."vehicles_crit_air_enum" AS ENUM('CRITAIR_0', 'CRITAIR_1', 'CRITAIR_2', 'CRITAIR_3', 'CRITAIR_4', 'CRITAIR_5'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "crit_air" "public"."vehicles_crit_air_enum"`);

        // fiscal_power (French administrative "puissance fiscale", cv) is required going
        // forward -- backfill existing rows from trim horsepower (a rough estimate, existing
        // data is all demo/seed data anyway) before enforcing NOT NULL.
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "fiscal_power" integer`);
        await queryRunner.query(`UPDATE "vehicles" v SET "fiscal_power" = GREATEST(1, ROUND(COALESCE(t."horsepower", 100) / 10.0)) FROM "vehicle_trims" t WHERE v."trimId" = t."id" AND v."fiscal_power" IS NULL`);
        await queryRunner.query(`UPDATE "vehicles" SET "fiscal_power" = 10 WHERE "fiscal_power" IS NULL`);
        await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "fiscal_power" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "fiscal_power"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "crit_air"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."vehicles_crit_air_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "number_of_seats"`);

        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "number_of_doors" integer`);
        await queryRunner.query(`UPDATE "vehicle_trims" t SET "number_of_doors" = v."number_of_doors" FROM "vehicles" v WHERE v."trimId" = t."id" AND v."number_of_doors" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "number_of_doors"`);

        // Postgres can't remove enum values -- HYDROGEN/CNG are left in place on revert.
    }

}
