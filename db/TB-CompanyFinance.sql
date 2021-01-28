USE `DB-RTST_2101`;

DROP TABLE IF EXISTS `TB-CompanyFinance`;

CREATE TABLE IF NOT EXISTS `TB-CompanyFinance` (
	`CompanyFinance` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`company` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
	`nice` VARCHAR(50) NULL DEFAULT NULL COMMENT 'NICE업체코드' COLLATE 'utf8mb4_general_ci',
	`year` SMALLINT(5) UNSIGNED NULL DEFAULT NULL COMMENT '결산연도',
	`Assets` BIGINT(20) NULL DEFAULT NULL COMMENT '자산총계',
	`Debt` BIGINT(20) NULL DEFAULT NULL COMMENT '부채총계',
	`Sale` BIGINT(20) NULL DEFAULT NULL COMMENT '매출액',
	`Profit` BIGINT(20) NULL DEFAULT NULL COMMENT '영업이익',
	`NetProfit` BIGINT(20) NULL DEFAULT NULL COMMENT '순이익',
	PRIMARY KEY (`CompanyFinance`) USING BTREE,
	UNIQUE INDEX `company_year` (`company`, `year`) USING BTREE,
	UNIQUE INDEX `nice_year` (`nice`, `year`) USING BTREE,
	CONSTRAINT `FK_TB-CompanyFinance_TB-Company` FOREIGN KEY (`company`) REFERENCES `DB-RTST_2101`.`TB-Company` (`company`) ON UPDATE CASCADE ON DELETE SET NULL
) COLLATE='utf8mb4_general_ci' ENGINE=INNODB;

TRUNCATE `TB-CompanyFinance`;

INSERT INTO `TB-CompanyFinance`(`company`, `nice`, `year`, `Assets`, `Debt`, `Sale`, `Profit`, `NetProfit`)
SELECT `TB-Company`.`company`
, IF(TRIM(IFNULL(`corp_finance_db`.`NICE업체코드`, '')) = '', NULL, TRIM(IFNULL(`corp_finance_db`.`NICE업체코드`, ''))) AS `nice`
, CAST(LEFT(TRIM(CONCAT(`corp_finance_db`.`결산연도`, '0000')), 4) AS UNSIGNED) AS `year`
, CAST(`corp_finance_db`.`자산총계` AS SIGNED) AS `Assets`
, CAST(`corp_finance_db`.`부채총계` AS SIGNED) AS `Debt`
, CAST(`corp_finance_db`.`매출액` AS SIGNED) AS `Sale`
, CAST(`corp_finance_db`.`영업이익` AS SIGNED) AS `Profit`
, CAST(`corp_finance_db`.`당기순이익` AS SIGNED) AS `NetProfit`
FROM `TB-Company`
INNER JOIN `corp_finance_db` ON `TB-Company`.`nice` = `corp_finance_db`.`NICE업체코드`
WHERE CAST(LEFT(TRIM(CONCAT(`corp_finance_db`.`결산연도`, '0000')), 4) AS UNSIGNED) > 0;

SELECT COUNT(*) FROM `corp_finance_db` WHERE TRIM(`corp_finance_db`.`결산연도`) <> '';
