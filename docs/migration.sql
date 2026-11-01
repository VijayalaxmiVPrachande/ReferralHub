-- ReferralHub Database Migration
-- Execute this migration script on existing MySQL databases to upgrade schema.

-- Slice B: Job description as TEXT
ALTER TABLE job MODIFY description TEXT;

-- Slice C: Referral location/title column sizes
ALTER TABLE job MODIFY COLUMN location VARCHAR(150);
ALTER TABLE job MODIFY COLUMN title VARCHAR(150) NOT NULL;

-- Slice C: Referral status ENUM with all pipeline values
ALTER TABLE referral MODIFY COLUMN status
  ENUM('REFERRED','IN_REVIEW','NEXT_ROUND','SELECTED','REJECTED')
  NOT NULL DEFAULT 'REFERRED';

-- Slice C: ATS timestamp for last email
ALTER TABLE referral ADD COLUMN IF NOT EXISTS last_email_at DATETIME(6);

-- Slice D: Referral email audit table
CREATE TABLE IF NOT EXISTS referral_email (
  id          BIGINT NOT NULL AUTO_INCREMENT,
  body        TEXT NOT NULL,
  error_message TEXT,
  sent_at     DATETIME(6) NOT NULL,
  status      ENUM('SENT','FAILED') NOT NULL,
  subject     VARCHAR(150) NOT NULL,
  to_email    VARCHAR(255) NOT NULL,
  type        ENUM('NEXT_ROUND','SELECTED','REJECTED','CUSTOM') NOT NULL,
  referral_id BIGINT NOT NULL,
  sent_by_id  BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK_referral_email_referral FOREIGN KEY (referral_id) REFERENCES referral (id) ON DELETE CASCADE,
  CONSTRAINT FK_referral_email_user     FOREIGN KEY (sent_by_id)  REFERENCES users  (id)
) ENGINE=InnoDB;
