USE `DB-RTST_2101`;

DROP TABLE IF EXISTS `TB-PatentApplicant`;

CREATE TABLE IF NOT EXISTS `TB-PatentApplicant` (
	`patent` BIGINT(20) UNSIGNED NULL DEFAULT NULL COMMENT '등록번호',
	`index` TINYINT(3) UNSIGNED NULL DEFAULT NULL COMMENT '순번',
	`id` BIGINT(20) UNSIGNED NULL DEFAULT NULL COMMENT '특허고객번호',
	`name` VARCHAR(256) NULL DEFAULT NULL COMMENT '이름' COLLATE 'utf8mb4_general_ci',
	`nice` VARCHAR(50) NULL DEFAULT NULL COMMENT 'NICE업체코드' COLLATE 'utf8mb4_general_ci',
	UNIQUE INDEX `patent_index` (`patent`, `index`) USING BTREE,
	CONSTRAINT `FK_TB-PatentApplicant_TB-Patent` FOREIGN KEY (`patent`) REFERENCES `TB-Patent` (`patent`) ON UPDATE CASCADE ON DELETE SET NULL
) COMMENT='출원인' COLLATE='utf8mb4_general_ci' ENGINE=INNODB;

TRUNCATE `TB-PatentApplicant`;

INSERT INTO `TB-PatentApplicant`(`patent`, `index`, `id`, `name`, `nice`)
SELECT `TB-Patent`.`patent`
, CAST(`patent_app_db`.`순번` AS UNSIGNED) AS `index`
, IF(TRIM(IFNULL(`patent_app_db`.`출원인 특허고객번호`, '')) = '', NULL, TRIM(IFNULL(`patent_app_db`.`출원인 특허고객번호`, ''))) AS `id`
, IF(TRIM(IFNULL(`patent_app_db`.`출원인`, '')) = '', NULL, TRIM(IFNULL(`patent_app_db`.`출원인`, ''))) AS `name`
, IF(TRIM(IFNULL(`patent_app_db`.`출원인 NICE업체코드`, '')) = '', NULL, TRIM(IFNULL(`patent_app_db`.`출원인 NICE업체코드`, ''))) AS `nice`
FROM `TB-Patent`
INNER JOIN `patent_app_db` ON `TB-Patent`.`patent` = `patent_app_db`.`등록번호`;

SELECT COUNT(*) FROM `patent_app_db`;
