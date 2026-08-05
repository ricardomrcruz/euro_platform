import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuctionModule1785884115192 implements MigrationInterface {
    name = 'AddAuctionModule1785884115192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "bids" ("id" SERIAL NOT NULL, "amount" double precision NOT NULL, "commission" double precision NOT NULL, "timestamp" TIMESTAMP NOT NULL, "bidder_id" integer NOT NULL, "auctionId" integer, CONSTRAINT "PK_7950d066d322aab3a488ac39fe5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."auctions_state_enum" AS ENUM('LIVE', 'SOLD', 'EXPIRED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "auctions" ("id" SERIAL NOT NULL, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP NOT NULL, "reserve_price" double precision NOT NULL, "buy_now_price" double precision, "current_highest_bid" double precision, "state" "public"."auctions_state_enum" NOT NULL DEFAULT 'LIVE', "adId" integer, CONSTRAINT "REL_37d4ae81095b69e1e285cdaf69" UNIQUE ("adId"), CONSTRAINT "PK_87d2b34d4829f0519a5c5570368" PRIMARY KEY ("id"))`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "bids" ADD CONSTRAINT "FK_6d6b20987ed2f61e8801398f8d1" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "auctions" ADD CONSTRAINT "FK_37d4ae81095b69e1e285cdaf69d" FOREIGN KEY ("adId") REFERENCES "ads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT IF EXISTS "FK_37d4ae81095b69e1e285cdaf69d"`);
        await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT IF EXISTS "FK_6d6b20987ed2f61e8801398f8d1"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "auctions"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."auctions_state_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "bids"`);
    }

}
