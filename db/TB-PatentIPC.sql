USE `DB-RTST_2101`;

DROP TABLE IF EXISTS `TB-PatentIPC`;

CREATE TABLE IF NOT EXISTS `TB-PatentIPC` (
	`patent` BIGINT(20) UNSIGNED NULL DEFAULT NULL COMMENT '등록번호',
	`index` TINYINT(3) UNSIGNED NULL DEFAULT NULL COMMENT '순번',
	`ipc` VARCHAR(50) NULL DEFAULT NULL COMMENT '수요기술' COLLATE 'utf8mb4_general_ci',
	UNIQUE INDEX `patent_index` (`patent`, `index`) USING BTREE,
	CONSTRAINT `FK_TB-PatentIPC_TB-Patent` FOREIGN KEY (`patent`) REFERENCES `DB-RTST_2101`.`TB-Patent` (`patent`) ON UPDATE CASCADE ON DELETE SET NULL
) COLLATE='utf8mb4_general_ci' ENGINE=INNODB;

TRUNCATE `TB-PatentIPC`;

SET GLOBAL innodb_buffer_pool_size=1073741824;

INSERT INTO `TB-PatentIPC`(`patent`, `index`, `ipc`)
SELECT `TB-Patent`.`patent`
, CAST(`patent_ipc_db`.`순번` AS UNSIGNED) AS `index`
, IF(TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, '')) = '', NULL, TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, ''))) AS `ipc`
FROM `TB-Patent`
INNER JOIN `patent_ipc_db` ON `TB-Patent`.`patent` = `patent_ipc_db`.`등록번호`
ORDER BY `patent_ipc_db`.`등록번호`, `patent_ipc_db`.`순번` LIMIT 0, 300000;

INSERT INTO `TB-PatentIPC`(`patent`, `index`, `ipc`)
SELECT `TB-Patent`.`patent`
, CAST(`patent_ipc_db`.`순번` AS UNSIGNED) AS `index`
, IF(TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, '')) = '', NULL, TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, ''))) AS `ipc`
FROM `TB-Patent`
INNER JOIN `patent_ipc_db` ON `TB-Patent`.`patent` = `patent_ipc_db`.`등록번호`
ORDER BY `patent_ipc_db`.`등록번호`, `patent_ipc_db`.`순번` LIMIT 300000, 300000;

INSERT INTO `TB-PatentIPC`(`patent`, `index`, `ipc`)
SELECT `TB-Patent`.`patent`
, CAST(`patent_ipc_db`.`순번` AS UNSIGNED) AS `index`
, IF(TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, '')) = '', NULL, TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, ''))) AS `ipc`
FROM `TB-Patent`
INNER JOIN `patent_ipc_db` ON `TB-Patent`.`patent` = `patent_ipc_db`.`등록번호`
ORDER BY `patent_ipc_db`.`등록번호`, `patent_ipc_db`.`순번` LIMIT 600000, 300000;

INSERT INTO `TB-PatentIPC`(`patent`, `index`, `ipc`)
SELECT `TB-Patent`.`patent`
, CAST(`patent_ipc_db`.`순번` AS UNSIGNED) AS `index`
, IF(TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, '')) = '', NULL, TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, ''))) AS `ipc`
FROM `TB-Patent`
INNER JOIN `patent_ipc_db` ON `TB-Patent`.`patent` = `patent_ipc_db`.`등록번호`
ORDER BY `patent_ipc_db`.`등록번호`, `patent_ipc_db`.`순번` LIMIT 900000, 300000;

INSERT INTO `TB-PatentIPC`(`patent`, `index`, `ipc`)
SELECT `TB-Patent`.`patent`
, CAST(`patent_ipc_db`.`순번` AS UNSIGNED) AS `index`
, IF(TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, '')) = '', NULL, TRIM(IFNULL(`patent_ipc_db`.`전체 IPC`, ''))) AS `ipc`
FROM `TB-Patent`
INNER JOIN `patent_ipc_db` ON `TB-Patent`.`patent` = `patent_ipc_db`.`등록번호`
ORDER BY `patent_ipc_db`.`등록번호`, `patent_ipc_db`.`순번` LIMIT 1200000, 300000;

SELECT COUNT(*) FROM `TB-PatentIPC`;
SELECT COUNT(*) FROM `patent_ipc_db`;
