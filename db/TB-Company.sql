CREATE TABLE `TB-Company` (
	`company` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(50) NOT NULL COMMENT '기업명' COLLATE 'utf8mb4_general_ci',
	`registerNumber` VARCHAR(50) NULL DEFAULT NULL COMMENT '사업자등록번호' COLLATE 'utf8mb4_general_ci',
	`representative` VARCHAR(50) NULL DEFAULT NULL COMMENT '대표자명' COLLATE 'utf8mb4_general_ci',
	`address` VARCHAR(255) NULL DEFAULT NULL COMMENT '주소' COLLATE 'utf8mb4_general_ci',
	`tel` VARCHAR(50) NULL DEFAULT NULL COMMENT '전화번호' COLLATE 'utf8mb4_general_ci',
	`fax` VARCHAR(50) NULL DEFAULT NULL COMMENT '팩스번호' COLLATE 'utf8mb4_general_ci',
	`homepage` VARCHAR(50) NULL DEFAULT NULL COMMENT '홈페이지URL' COLLATE 'utf8mb4_general_ci',
	`email` VARCHAR(50) NULL DEFAULT NULL COMMENT '이메일' COLLATE 'utf8mb4_general_ci',
	`businessTypes` VARCHAR(1024) NULL DEFAULT NULL COMMENT '사업부문명' COLLATE 'utf8mb4_general_ci',
	`businessItems` VARCHAR(1024) NULL DEFAULT NULL COMMENT '주요상품내역' COLLATE 'utf8mb4_general_ci',
	`businessRegisted` DATE NULL DEFAULT NULL COMMENT '설립일자',
	`numberOfEmployees` INT(10) UNSIGNED NULL DEFAULT NULL COMMENT '종업원수',
	`dateByEmployeeCount` DATE NULL DEFAULT NULL COMMENT '종업원수기준일자',
	`isKOSDAQ` VARCHAR(50) NULL DEFAULT NULL COMMENT '상장' COLLATE 'utf8mb4_general_ci',
	`isINNOBIZ` VARCHAR(50) NULL DEFAULT NULL COMMENT '이노비즈인증' COLLATE 'utf8mb4_general_ci',
	`isHidenChampion` VARCHAR(50) NULL DEFAULT NULL COMMENT '강소기업인증' COLLATE 'utf8mb4_general_ci',
	`isVenture` VARCHAR(50) NULL DEFAULT NULL COMMENT '벤처기업인증' COLLATE 'utf8mb4_general_ci',
	`nice` VARCHAR(50) NULL DEFAULT NULL COMMENT 'NICE업체코드' COLLATE 'utf8mb4_general_ci',
	`ked` VARCHAR(50) NULL DEFAULT NULL COMMENT 'KED업체코드' COLLATE 'utf8mb4_general_ci',
	`key` VARCHAR(50) NULL DEFAULT NULL COMMENT '기업코드' COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`company`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=INNODB
;

TRUNCATE `TB-Company`;
INSERT INTO `TB-Company`(`name`, `registerNumber`, `representative`, `address`, `tel`, `fax`, `homepage`, `email`, `businessTypes`, `businessItems`, `businessRegisted`, `numberOfEmployees`, `dateByEmployeeCount`, `isKOSDAQ`, `isINNOBIZ`, `isHidenChampion`, `isVenture`, `nice`, `ked`, `key`)
SELECT IF(`기업명` = '-', NULL, `기업명`) AS `기업명`
, IF(`사업자등록번호` = '-', NULL, `사업자등록번호`) AS `사업자등록번호`
, IF(`대표자명` = '-', NULL, `대표자명`) AS `대표자명`
, IF(`주소` = '-', NULL, `주소`) AS `주소`
, IF(`전화번호` = '-', NULL, `전화번호`) AS `전화번호`
, IF(`팩스번호` = '-', NULL, `팩스번호`) AS `팩스번호`
, IF(`홈페이지URL` = '-', NULL, `홈페이지URL`) AS `홈페이지URL`
, IF(`이메일` = '-', NULL, `이메일`) AS `이메일`
, IF(`사업부문명` = '-', NULL, `사업부문명`) AS `사업부문명`
, IF(`주요상품내역` = '-', NULL, `주요상품내역`) AS `주요상품내역`
, IF(`설립일자` = '-', NULL, `설립일자`) AS `설립일자`
, IF(`종업원수` = '-', NULL, `종업원수`) AS `종업원수`
, IF(`종업원수기준일자` = '-', NULL, `종업원수기준일자`) AS `종업원수기준일자`
, IF(`상장` = '-', NULL, `상장`) AS `상장`
, IF(`이노비즈인증` = '-', NULL, `이노비즈인증`) AS `이노비즈인증`
, IF(`강소기업인증` = '-', NULL, `강소기업인증`) AS `강소기업인증`
, IF(`벤처기업인증` = '-', NULL, `벤처기업인증`) AS `벤처기업인증`
, IF(`NICE업체코드` = '-', NULL, `NICE업체코드`) AS `NICE업체코드`
, IF(`KED업체코드` = '-', NULL, `KED업체코드`) AS `KED업체코드`
, IF(`기업코드` = '-', NULL, `기업코드`) AS `기업코드`
 FROM `corp_overall_db`;