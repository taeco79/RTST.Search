USE `DB-RTST_2101`;

DROP TABLE IF EXISTS `TB-CompanyDemand`;

CREATE TABLE IF NOT EXISTS `TB-CompanyDemand` (
	`companyDemand` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`company` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
	`nice` VARCHAR(50) NULL DEFAULT NULL COMMENT 'NICE업체코드' COLLATE 'utf8mb4_general_ci',
	`demandingTechnology` VARCHAR(1024) NULL DEFAULT NULL COMMENT '수요기술' COLLATE 'utf8mb4_general_ci',
	`introductoryIntention` CHAR(1) NULL DEFAULT NULL COMMENT '기술도입의향' COLLATE 'utf8mb4_general_ci',
	`technologyTransfer` CHAR(1) NULL DEFAULT NULL COMMENT '기술이전' COLLATE 'utf8mb4_general_ci',
	`technologyTransferDepartment` CHAR(1) NULL DEFAULT NULL COMMENT '기술이전전담부서' COLLATE 'utf8mb4_general_ci',
	`technologyTransferOfficer` VARCHAR(256) NULL DEFAULT NULL COMMENT '수요기술담당자' COLLATE 'utf8mb4_general_ci',
	`technologyTransferTel` VARCHAR(256) NULL DEFAULT NULL COMMENT '수요기술담당자연락처' COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`companyDemand`) USING BTREE,
	UNIQUE INDEX `company` (`company`) USING BTREE,
	UNIQUE INDEX `nice` (`nice`) USING BTREE,
	CONSTRAINT `FK_TB-CompanyDemand_TB-Company` FOREIGN KEY (`company`) REFERENCES `DB-RTST_2101`.`TB-Company` (`company`) ON UPDATE CASCADE ON DELETE SET NULL
) COLLATE='utf8mb4_general_ci' ENGINE=INNODB;

TRUNCATE `TB-CompanyDemand`;

INSERT INTO `TB-CompanyDemand`(`company`, `nice`, `demandingTechnology`, `introductoryIntention`, `technologyTransfer`, `technologyTransferDepartment`, `technologyTransferOfficer`, `technologyTransferTel`)
SELECT `TB-Company`.`company`
, IF(TRIM(IFNULL(`corp_demand_db`.`NICE업체코드`, '')) = '', NULL, TRIM(IFNULL(`corp_demand_db`.`NICE업체코드`, ''))) AS `nice`
, IF(TRIM(IFNULL(`corp_demand_db`.`수요기술`, '')) = '', NULL, TRIM(IFNULL(`corp_demand_db`.`수요기술`, ''))) AS `demandingTechnology`
, IF(TRIM(IFNULL(`corp_demand_db`.`기술도입의향`, 'N')) LIKE 'Y', 'Y', 'N') AS `introductoryIntention`
, IF(TRIM(IFNULL(`corp_demand_db`.`기술이전`, 'N')) LIKE 'Y', 'Y', 'N') AS `technologyTransfer`
, IF(TRIM(IFNULL(`corp_demand_db`.`기술이전 전담부서`, 'N')) LIKE 'Y', 'Y', 'N') AS `technologyTransferDepartment`
, IF(TRIM(IFNULL(`corp_demand_db`.`수요기술 담당자`, '')) = '', NULL, TRIM(IFNULL(`corp_demand_db`.`수요기술 담당자`, ''))) AS `technologyTransferOfficer`
, IF(TRIM(IFNULL(`corp_demand_db`.`수요기술 담당자 연락처`, '')) = '', NULL, TRIM(IFNULL(`corp_demand_db`.`수요기술 담당자 연락처`, ''))) AS `technologyTransferTel`
FROM `TB-Company`
INNER JOIN `corp_demand_db` ON `TB-Company`.`nice` = `corp_demand_db`.`NICE업체코드`
WHERE `corp_demand_db`.`isDeleted` = 0;

SELECT COUNT(*) FROM `corp_demand_db` WHERE `corp_demand_db`.`isDeleted` = 0;
