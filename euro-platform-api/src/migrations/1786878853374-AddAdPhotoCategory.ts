import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdPhotoCategory1786878853374 implements MigrationInterface {
    name = 'AddAdPhotoCategory1786878853374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."ad_photos_category_enum" AS ENUM('EXTERIOR_FRONT', 'EXTERIOR_REAR', 'EXTERIOR_DRIVER_SIDE', 'EXTERIOR_PASSENGER_SIDE', 'EXTERIOR_FRONT_THREE_QUARTER', 'EXTERIOR_REAR_THREE_QUARTER', 'EXTERIOR_UNDERCARRIAGE', 'WHEELS_TIRES', 'ENGINE_BAY', 'INTERIOR_DASHBOARD', 'INTERIOR_FRONT_SEATS', 'INTERIOR_REAR_SEATS', 'ODOMETER', 'TRUNK', 'REGISTRATION_DOCUMENT', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`ALTER TABLE "ad_photos" ADD IF NOT EXISTS "category" "public"."ad_photos_category_enum" NOT NULL DEFAULT 'OTHER'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ad_photos" DROP COLUMN IF EXISTS "category"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."ad_photos_category_enum"`);
    }

}
