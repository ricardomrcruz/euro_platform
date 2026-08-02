import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdModule1785702538558 implements MigrationInterface {
    name = 'AddAdModule1785702538558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ad_photos" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "caption" character varying, "sort_order" integer NOT NULL DEFAULT '0', "is_primary" boolean NOT NULL DEFAULT false, "adId" integer, CONSTRAINT "PK_86bec958030e4771cd9b14427df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."ads_condition_enum" AS ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."ads_status_enum" AS ENUM('DRAFT', 'REVIEW', 'VALIDATED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ads" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "condition" "public"."ads_condition_enum" NOT NULL, "status" "public"."ads_status_enum" NOT NULL DEFAULT 'DRAFT', "highlights" text, "known_flaws" text, "modifications" text, "service_history" text, "location" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "rejection_message" text, "seller_id" integer NOT NULL, "vehicleId" integer, CONSTRAINT "PK_a7af7d1998037a97076f758fc23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "ad_photos" ADD CONSTRAINT "FK_29f235d74876932a5dacb09f4a7" FOREIGN KEY ("adId") REFERENCES "ads"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "ads" ADD CONSTRAINT "FK_e1664c4b00b5208f3bd97f52b09" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ads" DROP CONSTRAINT IF EXISTS "FK_e1664c4b00b5208f3bd97f52b09"`);
        await queryRunner.query(`ALTER TABLE "ad_photos" DROP CONSTRAINT IF EXISTS "FK_29f235d74876932a5dacb09f4a7"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ads"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."ads_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."ads_condition_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ad_photos"`);
    }

}
