USE `DB-RTST_2101`;

DROP TABLE IF EXISTS `TB-PatentRight`;

CREATE TABLE IF NOT EXISTS `TB-PatentRight` (
	`patent` BIGINT(20) UNSIGNED NULL DEFAULT NULL COMMENT '등록번호',
	`index` TINYINT(3) UNSIGNED NULL DEFAULT NULL COMMENT '순번',
	`id` BIGINT(20) UNSIGNED NULL DEFAULT NULL COMMENT '특허고객번호',
	`name` VARCHAR(256) NULL DEFAULT NULL COMMENT '이름' COLLATE 'utf8mb4_general_ci',
	`nice` VARCHAR(50) NULL DEFAULT NULL COMMENT 'NICE업체코드' COLLATE 'utf8mb4_general_ci',
	UNIQUE INDEX `patent_index` (`patent`, `index`) USING BTREE,
	CONSTRAINT `FK_TB-PatentRight_TB-Patent` FOREIGN KEY (`patent`) REFERENCES `DB-RTST_2101`.`TB-Patent` (`patent`) ON UPDATE CASCADE ON DELETE SET NULL
) COMMENT='현재 권리자' COLLATE='utf8mb4_general_ci' ENGINE=INNODB;

TRUNCATE `TB-PatentRight`;

INSERT INTO `TB-PatentRight`(`patent`, `index`, `id`, `name`, `nice`)
SELECT `TB-Patent`.`patent`
, CAST(`patent_right_db`.`순번` AS UNSIGNED) AS `index`
, IF(TRIM(IFNULL(`patent_right_db`.`현재권리자 특허고객번호`, '')) = '', NULL, TRIM(IFNULL(`patent_right_db`.`현재권리자 특허고객번호`, ''))) AS `id`
, IF(TRIM(IFNULL(`patent_right_db`.`현재권리자`, '')) = '', NULL, TRIM(IFNULL(`patent_right_db`.`현재권리자`, ''))) AS `name`
, IF(TRIM(IFNULL(`patent_right_db`.`현재권리자 NICE업체코드`, '')) = '', NULL, TRIM(IFNULL(`patent_right_db`.`현재권리자 NICE업체코드`, ''))) AS `nice`
FROM `TB-Patent`
INNER JOIN `patent_right_db` ON `TB-Patent`.`patent` = `patent_right_db`.`등록번호`;

SELECT COUNT(*) FROM `patent_right_db`;
