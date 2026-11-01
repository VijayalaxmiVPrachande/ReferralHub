-- ReferralHub Database Migration
-- Execute this migration script on existing MySQL databases to upgrade schema.

ALTER TABLE job MODIFY description TEXT;
