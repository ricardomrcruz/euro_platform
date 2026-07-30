import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1784427513084 implements MigrationInterface {
    name = 'InitialSchema1784427513084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "auth"`);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "auth"."users_role_enum" AS ENUM('GUEST', 'CLIENT', 'ADMIN');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "auth"."users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "role" "auth"."users_role_enum" NOT NULL DEFAULT 'CLIENT', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "token_version" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "auth"."users"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "auth"."users_role_enum"`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS "auth"`);
    }

}
