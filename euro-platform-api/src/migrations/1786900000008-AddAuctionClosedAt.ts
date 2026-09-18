import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuctionClosedAt1786900000008 implements MigrationInterface {
    name = 'AddAuctionClosedAt1786900000008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Only set for a buy-now close -- endDate is the scheduled end and stays accurate for
        // every other way an auction closes (reaching it naturally, or a manual early end),
        // so those don't need this at all.
        await queryRunner.query(`ALTER TABLE "auctions" ADD IF NOT EXISTS "closed_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN IF EXISTS "closed_at"`);
    }

}
