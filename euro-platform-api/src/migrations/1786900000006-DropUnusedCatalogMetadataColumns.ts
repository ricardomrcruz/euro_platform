import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUnusedCatalogMetadataColumns1786900000006 implements MigrationInterface {
    name = 'DropUnusedCatalogMetadataColumns1786900000006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Wikidata QID references that were never actually read back -- vehicle_models kept
        // its own externalId for seed dedup, but vehicle_makes' was write-only from the start.
        await queryRunner.query(`ALTER TABLE "vehicle_makes" DROP COLUMN IF EXISTS "external_id"`);

        // yearStart/yearEnd/imageUrl/externalId were seed-only metadata never surfaced
        // anywhere in the app -- the seed script's own (make, name) fallback lookup already
        // covers dedup without externalId.
        await queryRunner.query(`ALTER TABLE "vehicle_models" DROP COLUMN IF EXISTS "year_start"`);
        await queryRunner.query(`ALTER TABLE "vehicle_models" DROP COLUMN IF EXISTS "year_end"`);
        await queryRunner.query(`ALTER TABLE "vehicle_models" DROP COLUMN IF EXISTS "external_id"`);
        await queryRunner.query(`ALTER TABLE "vehicle_models" DROP COLUMN IF EXISTS "image_url"`);

        // A finition badge (e.g. "GT Line") isn't tied to one model-year -- it can span
        // several generations -- so this was never a meaningful part of a trim's identity.
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "year"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "year" integer`);
        await queryRunner.query(`ALTER TABLE "vehicle_models" ADD IF NOT EXISTS "image_url" character varying`);
        await queryRunner.query(`ALTER TABLE "vehicle_models" ADD IF NOT EXISTS "external_id" integer`);
        await queryRunner.query(`ALTER TABLE "vehicle_models" ADD IF NOT EXISTS "year_end" integer`);
        await queryRunner.query(`ALTER TABLE "vehicle_models" ADD IF NOT EXISTS "year_start" integer`);
        await queryRunner.query(`ALTER TABLE "vehicle_makes" ADD IF NOT EXISTS "external_id" integer`);
    }

}
