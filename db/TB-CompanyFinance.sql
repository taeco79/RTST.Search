CREATE TABLE `TB-CompanyFinance` (
	`CompanyFinance` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`company` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
	`companyName` VARCHAR(50) NULL DEFAULT NULL COMMENT '기업명' COLLATE 'utf8mb4_general_ci',
	`registerNumber` VARCHAR(50) NULL DEFAULT NULL COMMENT '사업자등록번호' COLLATE 'utf8mb4_general_ci',
	`nice` VARCHAR(50) NULL DEFAULT NULL COMMENT 'NICE업체코드' COLLATE 'utf8mb4_general_ci',
	`ked` VARCHAR(50) NULL DEFAULT NULL COMMENT 'KED업체코드' COLLATE 'utf8mb4_general_ci',
	`keyCompany` VARCHAR(50) NULL DEFAULT NULL COMMENT '기업코드' COLLATE 'utf8mb4_general_ci',
	`year` SMALLINT(5) UNSIGNED NULL DEFAULT NULL COMMENT '회계연도',
	`quarter` SMALLINT(5) UNSIGNED NULL DEFAULT NULL COMMENT '회계분기',
	`Assets` BIGINT(20) NULL DEFAULT NULL COMMENT '자산총계',
	`Debt` BIGINT(20) NULL DEFAULT NULL COMMENT '부채총계',
	`Sale` BIGINT(20) NULL DEFAULT NULL COMMENT '매출액',
	`Profit` BIGINT(20) NULL DEFAULT NULL COMMENT '영업이익',
	`NetProfit` BIGINT(20) NULL DEFAULT NULL COMMENT '당기순이익',
	PRIMARY KEY (`CompanyFinance`) USING BTREE,
	UNIQUE INDEX `keyCompany_year_quarter` (`keyCompany`, `year`, `quarter`) USING BTREE,
	INDEX `FK_TB-CompanyFinance_TB-Company` (`company`) USING BTREE,
	CONSTRAINT `FK_TB-CompanyFinance_TB-Company` FOREIGN KEY (`company`) REFERENCES `DB-RTST`.`TB-Company` (`company`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_general_ci' ENGINE=InnoDB;


TRUNCATE `TB-CompanyFinance`;
INSERT INTO `TB-CompanyFinance` (`company`, `companyName`, `registerNumber`, `nice`, `ked`, `keyCompany`, `year`, `quarter`, `Assets`, `Debt`, `Sale`, `Profit`, `NetProfit`)
SELECT `TB-Company`.`Company`, `corp_finance_db`.`기업명`, `corp_finance_db`.`사업자등록번호`, `corp_finance_db`.`NICE업체코드`, `corp_finance_db`.`KED업체코드`, `corp_finance_db`.`기업코드`
, 2019 AS `회계년도`
, NULL AS `회계분기`
, CAST(IF(`(당기)자산총계` = '-', NULL, `(당기)자산총계`) AS INTEGER) AS `자산총계`
, CAST(IF(`(당기)부채총계` = '-', NULL, `(당기)부채총계`) AS INTEGER) AS `부채총계`
, CAST(IF(`(당기)매출액` = '-', NULL, `(당기)매출액`) AS INTEGER) AS `매출액`
, CAST(IF(`(당기)영업이익` = '-', NULL, `(당기)영업이익`) AS INTEGER) AS `영업이익`
, CAST(IF(`(당기)당기순이익` = '-', NULL, `(당기)당기순이익`) AS INTEGER) AS `당기순이익`
FROM `corp_finance_db`
LEFT OUTER JOIN `TB-Company` ON `corp_finance_db`.`기업코드` = `TB-Company`.`keyCompany`;

INSERT INTO `TB-CompanyFinance` (`company`, `companyName`, `registerNumber`, `nice`, `ked`, `keyCompany`, `year`, `quarter`, `Assets`, `Debt`, `Sale`, `Profit`, `NetProfit`)
SELECT `TB-Company`.`Company`, `corp_finance_db`.`기업명`, `corp_finance_db`.`사업자등록번호`, `corp_finance_db`.`NICE업체코드`, `corp_finance_db`.`KED업체코드`, `corp_finance_db`.`기업코드`
, 2018 AS `회계년도`
, NULL AS `회계분기``TB-CompanyFinance`
, CAST(IF(`(전기)자산총계` = '-', NULL, `(전기)자산총계`) AS INTEGER) AS `자산총계`
, CAST(IF(`(전기)부채총계` = '-', NULL, `(전기)부채총계`) AS INTEGER) AS `부채총계`
, CAST(IF(`(전기)매출액` = '-', NULL, `(전기)매출액`) AS INTEGER) AS `매출액`
, CAST(IF(`(전기)영업이익` = '-', NULL, `(전기)영업이익`) AS INTEGER) AS `영업이익`
, CAST(IF(`(전기)당기순이익` = '-', NULL, `(전기)당기순이익`) AS INTEGER) AS `당기순이익`
FROM `corp_finance_db`
LEFT OUTER JOIN `TB-Company` ON `corp_finance_db`.`기업코드` = `TB-Company`.`keyCompany`;

INSERT INTO `TB-CompanyFinance` (`company`, `companyName`, `registerNumber`, `nice`, `ked`, `keyCompany`, `year`, `quarter`, `Assets`, `Debt`, `Sale`, `Profit`, `NetProfit`)
SELECT `TB-Company`.`Company`, `corp_finance_db`.`기업명`, `corp_finance_db`.`사업자등록번호`, `corp_finance_db`.`NICE업체코드`, `corp_finance_db`.`KED업체코드`, `corp_finance_db`.`기업코드`
, 2017 AS `회계년도`
, NULL AS `회계분기`
, CAST(IF(`(전전기)자산총계` = '-', NULL, `(전전기)자산총계`) AS INTEGER) AS `자산총계`
, CAST(IF(`(전전기)부채총계` = '-', NULL, `(전전기)부채총계`) AS INTEGER) AS `부채총계`
, CAST(IF(`(전전기)매출액` = '-', NULL, `(전전기)매출액`) AS INTEGER) AS `매출액`
, CAST(IF(`(전전기)영업이익` = '-', NULL, `(전전기)영업이익`) AS INTEGER) AS `영업이익`
, CAST(IF(`(전전기)당기순이익` = '-', NULL, `(전전기)당기순이익`) AS INTEGER) AS `당기순이익`
FROM `corp_finance_db`
LEFT OUTER JOIN `TB-Company` ON `corp_finance_db`.`기업코드` = `TB-Company`.`keyCompany`;
