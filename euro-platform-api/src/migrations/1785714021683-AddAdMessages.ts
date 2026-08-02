import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdMessages1785714021683 implements MigrationInterface {
    name = 'AddAdMessages1785714021683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."ad_messages_sender_role_enum" AS ENUM('GUEST', 'CLIENT', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ad_messages" ("id" SERIAL NOT NULL, "message" text NOT NULL, "sender_id" integer NOT NULL, "sender_role" "public"."ad_messages_sender_role_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "adId" integer, CONSTRAINT "PK_bdab94085fa9110c5a5b2234636" PRIMARY KEY ("id"))`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "ad_messages" ADD CONSTRAINT "FK_cf63d4d517555c20910e3fe77dc" FOREIGN KEY ("adId") REFERENCES "ads"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ad_messages" DROP CONSTRAINT IF EXISTS "FK_cf63d4d517555c20910e3fe77dc"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ad_messages"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."ad_messages_sender_role_enum"`);
    }

}
