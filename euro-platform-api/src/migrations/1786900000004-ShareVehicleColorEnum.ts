import { MigrationInterface, QueryRunner } from "typeorm";

export class ShareVehicleColorEnum1786900000004 implements MigrationInterface {
    name = 'ShareVehicleColorEnum1786900000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // The enum type was originally named after its first (and only) use -- now that
        // interior_color uses it too, give it a name that doesn't imply exterior-only.
        await queryRunner.query(`ALTER TYPE "public"."vehicles_exterior_color_enum" RENAME TO "vehicle_color_enum"`);

        await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "interior_color" TYPE "public"."vehicle_color_enum" USING (
            CASE
                WHEN interior_color IS NULL THEN NULL
                WHEN interior_color ILIKE '%blanc%' OR interior_color ILIKE '%white%' OR interior_color ILIKE '%ivoire%' OR interior_color ILIKE '%pearl%' THEN 'WHITE'
                WHEN interior_color ILIKE '%noir%' OR interior_color ILIKE '%black%' OR interior_color ILIKE '%obsidian%' THEN 'BLACK'
                WHEN interior_color ILIKE '%gris%' OR interior_color ILIKE '%grey%' OR interior_color ILIKE '%gray%' OR interior_color ILIKE '%meteor%' THEN 'GREY'
                WHEN interior_color ILIKE '%argent%' OR interior_color ILIKE '%silver%' THEN 'SILVER'
                WHEN interior_color ILIKE '%bleu%' OR interior_color ILIKE '%blue%' THEN 'BLUE'
                WHEN interior_color ILIKE '%rouge%' OR interior_color ILIKE '%red%' THEN 'RED'
                WHEN interior_color ILIKE '%vert%' OR interior_color ILIKE '%green%' THEN 'GREEN'
                WHEN interior_color ILIKE '%jaune%' OR interior_color ILIKE '%yellow%' THEN 'YELLOW'
                WHEN interior_color ILIKE '%dore%' OR interior_color ILIKE '%doré%' OR interior_color ILIKE '%gold%' THEN 'GOLD'
                WHEN interior_color ILIKE '%beige%' OR interior_color ILIKE '%cream%' THEN 'BEIGE'
                WHEN interior_color ILIKE '%marron%' OR interior_color ILIKE '%brun%' OR interior_color ILIKE '%brown%' OR interior_color ILIKE '%tan%' THEN 'BROWN'
                WHEN interior_color ILIKE '%orange%' THEN 'ORANGE'
                WHEN interior_color ILIKE '%violet%' OR interior_color ILIKE '%purple%' THEN 'PURPLE'
                WHEN interior_color ILIKE '%rose%' OR interior_color ILIKE '%pink%' THEN 'PINK'
                WHEN interior_color ILIKE '%bordeaux%' OR interior_color ILIKE '%burgundy%' THEN 'BURGUNDY'
                ELSE 'OTHER'
            END
        )::"public"."vehicle_color_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "interior_color" TYPE character varying USING "interior_color"::text`);
        await queryRunner.query(`ALTER TYPE "public"."vehicle_color_enum" RENAME TO "vehicles_exterior_color_enum"`);
    }

}
