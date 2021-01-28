USE `DB-RTST_2101`;

DROP TABLE IF EXISTS `TB-Company`;

CREATE TABLE IF NOT EXISTS `TB-Company` (
	`company` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`nice` VARCHAR(50) NULL DEFAULT NULL COMMENT 'NICE업체코드' COLLATE 'utf8mb4_general_ci',
	`name` VARCHAR(50) NOT NULL COMMENT '기업명' COLLATE 'utf8mb4_general_ci',
	`code` VARCHAR(50) NULL DEFAULT NULL COMMENT '기업코드' COLLATE 'utf8mb4_general_ci',
	`registerNumber` VARCHAR(50) NULL DEFAULT NULL COMMENT '사업자등록번호' COLLATE 'utf8mb4_general_ci',
	`representative` VARCHAR(50) NULL DEFAULT NULL COMMENT '대표자명' COLLATE 'utf8mb4_general_ci',
	`address` VARCHAR(255) NULL DEFAULT NULL COMMENT '주소' COLLATE 'utf8mb4_general_ci',
	`tel` VARCHAR(50) NULL DEFAULT NULL COMMENT '전화번호' COLLATE 'utf8mb4_general_ci',
	`fax` VARCHAR(50) NULL DEFAULT NULL COMMENT '팩스번호' COLLATE 'utf8mb4_general_ci',
	`homepage` VARCHAR(128) NULL DEFAULT NULL COMMENT '홈페이지URL' COLLATE 'utf8mb4_general_ci',
	`email` VARCHAR(128) NULL DEFAULT NULL COMMENT '이메일' COLLATE 'utf8mb4_general_ci',
	`products` VARCHAR(1024) NULL DEFAULT NULL COMMENT '사업부문명' COLLATE 'utf8mb4_general_ci',
	`registed` DATE NULL DEFAULT NULL COMMENT '설립일자',
	`numberOfEmployees` INT(10) UNSIGNED NULL DEFAULT NULL COMMENT '종업원수',
	`dateByEmployeeCount` DATE NULL DEFAULT NULL COMMENT '종업원수기준일자',
	`isKOSDAQ` CHAR(1) NULL DEFAULT NULL COMMENT '상장' COLLATE 'utf8mb4_general_ci',
	`isINNOBIZ` CHAR(1) NULL DEFAULT NULL COMMENT '이노비즈인증' COLLATE 'utf8mb4_general_ci',
	`isHidenChampion` CHAR(1) NULL DEFAULT NULL COMMENT '강소기업인증' COLLATE 'utf8mb4_general_ci',
	`isVenture` CHAR(1) NULL DEFAULT NULL COMMENT '벤처기업인증' COLLATE 'utf8mb4_general_ci',
	`isDeleted` BIT(1) NOT NULL DEFAULT b'0',
	PRIMARY KEY (`company`) USING BTREE,
	UNIQUE INDEX `nice` (`nice`) USING BTREE,
	UNIQUE INDEX `code` (`code`) USING BTREE
) COLLATE='utf8mb4_general_ci' ENGINE=INNODB;

TRUNCATE `TB-Company`;

INSERT INTO `TB-Company`(
`nice`, `name`, `code`, `registerNumber`, `representative`, `address`, `tel`, `fax`, `homepage`, `email`, `products`, `registed`, `numberOfEmployees`, `dateByEmployeeCount`, `isKOSDAQ`, `isINNOBIZ`, `isHidenChampion`, `isVenture`)
SELECT IF(TRIM(IFNULL(`NICE업체코드`, '')) = '', NULL, TRIM(IFNULL(`NICE업체코드`, ''))) AS `nice`
, IF(TRIM(IFNULL(`기업명`, '')) = '', NULL, TRIM(IFNULL(`기업명`, ''))) AS `name`
, IF(TRIM(IFNULL(`기업코드`, '')) = '', NULL, TRIM(IFNULL(`기업코드`, ''))) AS `code`
, IF(TRIM(IFNULL(`사업자등록번호`, '')) = '', NULL, TRIM(IFNULL(`사업자등록번호`, ''))) AS `registerNumber`
, IF(TRIM(IFNULL(`대표자명`, '')) = '', NULL, TRIM(IFNULL(`대표자명`, ''))) AS `representative`
, IF(TRIM(IFNULL(`주소`, '')) = '', NULL, TRIM(IFNULL(`주소`, ''))) AS `address`
, IF(TRIM(IFNULL(`전화번호`, '')) = '', NULL, TRIM(IFNULL(`전화번호`, ''))) AS `tel`
, IF(TRIM(IFNULL(`팩스번호`, '')) = '', NULL, TRIM(IFNULL(`팩스번호`, ''))) AS `fax`
, IF(TRIM(IFNULL(`홈페이지URL`, '')) = '', NULL, TRIM(IFNULL(`홈페이지URL`, ''))) AS `homepage`
, IF(TRIM(IFNULL(`이메일`, '')) = '', NULL, TRIM(IFNULL(`이메일`, ''))) AS `email`
, IF(TRIM(IFNULL(`주요제품명`, '')) = '', NULL, TRIM(IFNULL(`주요제품명`, ''))) AS `products`
, IF(TRIM(IFNULL(`설립일자`, '')) = '', NULL, DATE_FORMAT(IFNULL(`설립일자`, ''), '%Y-%m-%d')) AS `registed`
, IF(TRIM(IFNULL(`종업원수`, '')) = '', NULL, TRIM(IFNULL(`종업원수`, ''))) AS `numberOfEmployees`
, IF(TRIM(IFNULL(`종업원수 기준일자`, '')) = '', NULL, DATE_FORMAT(IFNULL(`종업원수 기준일자`, ''), '%Y-%m-%d')) AS `dateByEmployeeCount`
, IF(TRIM(IFNULL(`상장`, 'N')) LIKE 'Y', 'Y', 'N') AS `isKOSDAQ`
, IF(TRIM(IFNULL(`이노비즈 인증`, 'N')) LIKE 'Y', 'Y', 'N') AS `isINNOBIZ`
, IF(TRIM(IFNULL(`강소기업 인증`, 'N')) LIKE 'Y', 'Y', 'N') AS `isHidenChampion`
, IF(TRIM(IFNULL(`벤처기업 인증`, 'N')) LIKE 'Y', 'Y', 'N') AS `isVenture`
FROM `corp_overall_db`;

SELECT COUNT(*) FROM `corp_overall_db`;
