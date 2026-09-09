import { MigrationInterface, QueryRunner } from "typeorm";

export class DropVehicleTrimExternalId1786900000007 implements MigrationInterface {
    name = 'DropVehicleTrimExternalId1786900000007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Redundant with the (model, name) unique index the seed script already falls back
        // to -- same reasoning as dropping vehicle_models.external_id.
        await queryRunner.query(`ALTER TABLE "vehicle_trims" DROP COLUMN IF EXISTS "external_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vehicle_trims" ADD IF NOT EXISTS "external_id" integer`);
    }

}
