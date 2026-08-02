import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785643170186 implements MigrationInterface {
    name = 'InitialSchema1785643170186'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Postgres has no "CREATE TYPE IF NOT EXISTS" -- guard each with a DO block instead.
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."vehicle_trims_transmission_enum" AS ENUM('MANUAL', 'AUTOMATIC', 'CVT', 'SEMI_AUTOMATIC'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."vehicle_trims_drivetrain_enum" AS ENUM('FWD', 'RWD', 'AWD', 'FOUR_WD'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."vehicle_trims_fuel_type_enum" AS ENUM('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID', 'LPG', 'ETHANOL'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "vehicle_trims" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "year" integer NOT NULL, "engine" character varying, "displacement" double precision, "horsepower" integer, "torque" integer, "transmission" "public"."vehicle_trims_transmission_enum", "drivetrain" "public"."vehicle_trims_drivetrain_enum", "fuel_type" "public"."vehicle_trims_fuel_type_enum", "number_of_doors" integer, "weight" integer, "external_id" integer, "modelId" integer, CONSTRAINT "PK_eaff9c3796a1931884eabcd7ec6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_73cb9008ffd28c5e8c28f21d34" ON "vehicle_trims" ("modelId", "name", "year") `);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."vehicle_models_body_type_enum" AS ENUM('SEDAN', 'HATCHBACK', 'WAGON', 'COUPE', 'CONVERTIBLE', 'SUV', 'CROSSOVER', 'MINIVAN', 'PICKUP', 'VAN'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "vehicle_models" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "body_type" "public"."vehicle_models_body_type_enum", "year_start" integer, "year_end" integer, "external_id" integer, "makeId" integer, CONSTRAINT "PK_1c01752184334fdbcae9bbaa67f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_5315f092f2fee66f2854ced064" ON "vehicle_models" ("makeId", "name") `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "vehicle_makes" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "country" character varying, "logo_url" character varying, "external_id" integer, "wmi_codes" text array, CONSTRAINT "UQ_d2aba3559e255fdb95c58d800d5" UNIQUE ("name"), CONSTRAINT "PK_407794f6d12fb1f8f7c4ba1d52b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "vehicles" ("id" SERIAL NOT NULL, "vin" character varying, "year" integer NOT NULL, "exterior_color" character varying, "interior_color" character varying, "mileage" integer, "number_of_owners" integer, "plate_country" character varying, "makeId" integer, "modelId" integer, "trimId" integer, CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        // Postgres has no "ADD CONSTRAINT IF NOT EXISTS" either -- same DO-block guard,
        // since a duplicate constraint name also raises duplicate_object.
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "vehicle_trims" ADD CONSTRAINT "FK_712b382dfa04bb58ab29f73a9dc" FOREIGN KEY ("modelId") REFERENCES "vehicle_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "vehicle_models" ADD CONSTRAINT "FK_d2ec9cc9ea521d4cfeee631c92a" FOREIGN KEY ("makeId") REFERENCES "vehicle_makes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "vehicles" ADD CONSTRAINT "FK_79fca6666a47ba03a2d5e3d5f80" FOREIGN KEY ("makeId") REFERENCES "vehicle_makes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "vehicles" ADD CONSTRAINT "FK_5fe3e38b9bf4649e65fdfb04bdf" FOREIGN KEY ("modelId") REFERENCES "vehicle_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "vehicles" ADD CONSTRAINT "FK_c84eddcf894a41d23220a6ff6ba" FOREIGN KEY ("trimId") REFERENCES "vehicle_trims"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT IF EXISTS "FK_c84eddcf894a41d23220a6ff6ba"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT IF EXISTS "FK_5fe3e38b9bf4649e65fdfb04bdf"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT IF EXISTS "FK_79fca6666a47ba03a2d5e3d5f80"`);
        await queryRunner.query(`ALTER TABLE "vehicle_models" DROP CONSTRAINT IF EXISTS "FK_d2ec9cc9ea521d4cfeee631c92a"`);
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP CONSTRAINT IF EXISTS "FK_712b382dfa04bb58ab29f73a9dc"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vehicles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_makes"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_5315f092f2fee66f2854ced064"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_models"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."vehicle_models_body_type_enum"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_73cb9008ffd28c5e8c28f21d34"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_trims"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."vehicle_trims_fuel_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."vehicle_trims_drivetrain_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."vehicle_trims_transmission_enum"`);
    }

}
