import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVehicleColorAndConditionEnums1786900000001 implements MigrationInterface {
    name = 'AddVehicleColorAndConditionEnums1786900000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ads.condition: old 4-value scale -> a finer 8-value scale. Postgres can't drop enum
        // values in place, so swap in a new type via a USING remap.
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."ads_condition_enum_new" AS ENUM('EXCELLENT', 'NOT_DAMAGED', 'GOOD', 'NORMAL_WEAR', 'MINOR_REPAIRS_NEEDED', 'MAJOR_REPAIRS_NEEDED', 'DAMAGED', 'NOT_RUNNING'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`ALTER TABLE "ads" ALTER COLUMN "condition" TYPE "public"."ads_condition_enum_new" USING (CASE "condition"::text WHEN 'FAIR' THEN 'NORMAL_WEAR' WHEN 'POOR' THEN 'DAMAGED' ELSE "condition"::text END)::"public"."ads_condition_enum_new"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."ads_condition_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."ads_condition_enum_new" RENAME TO "ads_condition_enum"`);

        // vehicles.exterior_color: free text -> a fixed color palette, so it can be filtered on.
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."vehicles_exterior_color_enum" AS ENUM('SILVER', 'BEIGE', 'WHITE', 'BLUE', 'BURGUNDY', 'GOLD', 'GREY', 'IVORY', 'YELLOW', 'BROWN', 'BLACK', 'ORANGE', 'PINK', 'RED', 'GREEN', 'PURPLE', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "exterior_color" TYPE "public"."vehicles_exterior_color_enum" USING (
            CASE
                WHEN exterior_color IS NULL THEN NULL
                WHEN exterior_color ILIKE '%blanc%' OR exterior_color ILIKE '%white%' OR exterior_color ILIKE '%ivoire%' OR exterior_color ILIKE '%pearl%' THEN 'WHITE'
                WHEN exterior_color ILIKE '%noir%' OR exterior_color ILIKE '%black%' OR exterior_color ILIKE '%obsidian%' THEN 'BLACK'
                WHEN exterior_color ILIKE '%gris%' OR exterior_color ILIKE '%grey%' OR exterior_color ILIKE '%gray%' OR exterior_color ILIKE '%meteor%' THEN 'GREY'
                WHEN exterior_color ILIKE '%argent%' OR exterior_color ILIKE '%silver%' THEN 'SILVER'
                WHEN exterior_color ILIKE '%bleu%' OR exterior_color ILIKE '%blue%' THEN 'BLUE'
                WHEN exterior_color ILIKE '%rouge%' OR exterior_color ILIKE '%red%' THEN 'RED'
                WHEN exterior_color ILIKE '%vert%' OR exterior_color ILIKE '%green%' THEN 'GREEN'
                WHEN exterior_color ILIKE '%jaune%' OR exterior_color ILIKE '%yellow%' THEN 'YELLOW'
                WHEN exterior_color ILIKE '%dore%' OR exterior_color ILIKE '%doré%' OR exterior_color ILIKE '%gold%' THEN 'GOLD'
                WHEN exterior_color ILIKE '%beige%' THEN 'BEIGE'
                WHEN exterior_color ILIKE '%marron%' OR exterior_color ILIKE '%brun%' OR exterior_color ILIKE '%brown%' THEN 'BROWN'
                WHEN exterior_color ILIKE '%orange%' THEN 'ORANGE'
                WHEN exterior_color ILIKE '%violet%' OR exterior_color ILIKE '%purple%' THEN 'PURPLE'
                WHEN exterior_color ILIKE '%rose%' OR exterior_color ILIKE '%pink%' THEN 'PINK'
                WHEN exterior_color ILIKE '%bordeaux%' OR exterior_color ILIKE '%burgundy%' THEN 'BURGUNDY'
                ELSE 'OTHER'
            END
        )::"public"."vehicles_exterior_color_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "exterior_color" TYPE character varying USING "exterior_color"::text`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."vehicles_exterior_color_enum"`);

        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."ads_condition_enum_old" AS ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`ALTER TABLE "ads" ALTER COLUMN "condition" TYPE "public"."ads_condition_enum_old" USING (CASE "condition"::text WHEN 'NOT_DAMAGED' THEN 'GOOD' WHEN 'NORMAL_WEAR' THEN 'FAIR' WHEN 'MINOR_REPAIRS_NEEDED' THEN 'FAIR' WHEN 'MAJOR_REPAIRS_NEEDED' THEN 'POOR' WHEN 'DAMAGED' THEN 'POOR' WHEN 'NOT_RUNNING' THEN 'POOR' ELSE "condition"::text END)::"public"."ads_condition_enum_old"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."ads_condition_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."ads_condition_enum_old" RENAME TO "ads_condition_enum"`);
    }

}
