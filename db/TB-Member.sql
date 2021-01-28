USE `DB-RTST_2101`;

CREATE TABLE IF NOT EXISTS `TB-Member` (
	`member` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`ref` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
	`key` CHAR(36) NOT NULL COLLATE 'utf8mb4_general_ci',
	`id` VARCHAR(64) NOT NULL COLLATE 'utf8mb4_general_ci',
	`grade` TINYINT(3) UNSIGNED NOT NULL DEFAULT '1',
	`password` CHAR(64) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`name` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`isDeleted` BIT(1) NOT NULL DEFAULT b'0',
	`update` TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	`entry` DATETIME NOT NULL,
	PRIMARY KEY (`member`) USING BTREE,
	UNIQUE INDEX `key` (`key`) USING BTREE,
	UNIQUE INDEX `id` (`id`) USING BTREE
) COLLATE = 'utf8mb4_general_ci' ENGINE = InnoDB;