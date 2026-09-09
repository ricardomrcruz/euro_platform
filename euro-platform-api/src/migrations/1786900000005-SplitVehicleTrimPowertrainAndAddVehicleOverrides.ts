import { MigrationInterface, QueryRunner } from "typeorm";

export class SplitVehicleTrimPowertrainAndAddVehicleOverrides1786900000005 implements MigrationInterface {
    name = 'SplitVehicleTrimPowertrainAndAddVehicleOverrides1786900000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // These enum types were named after vehicle_trims, their only user so far -- now
        // that vehicle_trim_powertrains and vehicles also use them, drop the table-specific name.
        await queryRunner.query(`ALTER TYPE "public"."vehicle_trims_transmission_enum" RENAME TO "transmission_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."vehicle_trims_drivetrain_enum" RENAME TO "drivetrain_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."vehicle_trims_fuel_type_enum" RENAME TO "fuel_type_enum"`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "vehicle_trim_powertrains" (
                "id" SERIAL PRIMARY KEY,
                "fuel_type" "public"."fuel_type_enum" NOT NULL,
                "engine" character varying,
                "displacement" float,
                "horsepower" integer,
                "torque" integer,
                "transmission" "public"."transmission_enum",
                "drivetrain" "public"."drivetrain_enum",
                "weight" integer,
                "trimId" integer NOT NULL REFERENCES "vehicle_trims"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vehicle_trim_powertrains_trim_fuel_type"
            ON "vehicle_trim_powertrains" ("trimId", "fuel_type")
        `);

        // One finition previously carried exactly one engine -- migrate that single set of
        // values into its own powertrain row wherever a fuel type was actually known.
        await queryRunner.query(`
            INSERT INTO "vehicle_trim_powertrains" ("trimId", "fuel_type", "engine", "displacement", "horsepower", "torque", "transmission", "drivetrain", "weight")
            SELECT "id", "fuel_type", "engine", "displacement", "horsepower", "torque", "transmission", "drivetrain", "weight"
            FROM "vehicle_trims"
            WHERE "fuel_type" IS NOT NULL
        `);

        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "engine" character varying`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "displacement" float`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "horsepower" integer`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "torque" integer`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "transmission" "public"."transmission_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "drivetrain" "public"."drivetrain_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "fuel_type" "public"."fuel_type_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD IF NOT EXISTS "weight" integer`);

        // Per-car values default to whatever the finition's matching powertrain specifies --
        // sellers can override any of them afterwards.
        await queryRunner.query(`
            UPDATE "vehicles" v SET
                "engine" = p."engine",
                "displacement" = p."displacement",
                "horsepower" = p."horsepower",
                "torque" = p."torque",
                "transmission" = p."transmission",
                "drivetrain" = p."drivetrain",
                "fuel_type" = p."fuel_type",
                "weight" = p."weight"
            FROM "vehicle_trim_powertrains" p
            WHERE v."trimId" = p."trimId"
        `);

        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "engine"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "displacement"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "horsepower"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "torque"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "transmission"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "drivetrain"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "fuel_type"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "weight"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "engine" character varying`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "displacement" float`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "horsepower" integer`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "torque" integer`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "transmission" "public"."transmission_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "drivetrain" "public"."drivetrain_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "fuel_type" "public"."fuel_type_enum"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "weight" integer`);

        // A trim with more than one powertrain row lost that fan-out on revert -- only the
        // first row (by id) per trim survives, matching the pre-split one-engine-per-trim shape.
        await queryRunner.query(`
            UPDATE "vehicle_trims" t SET
                "engine" = p."engine",
                "displacement" = p."displacement",
                "horsepower" = p."horsepower",
                "torque" = p."torque",
                "transmission" = p."transmission",
                "drivetrain" = p."drivetrain",
                "fuel_type" = p."fuel_type",
                "weight" = p."weight"
            FROM (
                SELECT DISTINCT ON ("trimId") *
                FROM "vehicle_trim_powertrains"
                ORDER BY "trimId", "id"
            ) p
            WHERE t."id" = p."trimId"
        `);

        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "weight"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "fuel_type"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "drivetrain"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "transmission"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "torque"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "horsepower"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "displacement"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "engine"`);

        await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_trim_powertrains"`);

        await queryRunner.query(`ALTER TYPE "public"."fuel_type_enum" RENAME TO "vehicle_trims_fuel_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."drivetrain_enum" RENAME TO "vehicle_trims_drivetrain_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."transmission_enum" RENAME TO "vehicle_trims_transmission_enum"`);
    }

}
