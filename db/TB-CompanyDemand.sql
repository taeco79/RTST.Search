CREATE TABLE `TB-CompanyDemand` (
	`companyDemand` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`company` BIGINT(20) UNSIGNED NULL DEFAULT NULL,
	`companyName` VARCHAR(50) NOT NULL COMMENT '기업명' COLLATE 'utf8mb4_general_ci',
	`registerNumber` VARCHAR(50) NULL DEFAULT NULL COMMENT '사업자등록번호' COLLATE 'utf8mb4_general_ci',
	`keyCompany` VARCHAR(50) NULL DEFAULT NULL COMMENT '기업코드' COLLATE 'utf8mb4_general_ci',
	`demandingTechnology` VARCHAR(50) NULL DEFAULT NULL COMMENT '수요기술' COLLATE 'utf8mb4_general_ci',
	`introductoryIntention` VARCHAR(50) NULL DEFAULT NULL COMMENT '기술도입의향' COLLATE 'utf8mb4_general_ci',
	`technologyTransfer` VARCHAR(50) NULL DEFAULT NULL COMMENT '기술이전' COLLATE 'utf8mb4_general_ci',
	`technologyTransferDepartment` VARCHAR(50) NULL DEFAULT NULL COMMENT '기술이전전담부서' COLLATE 'utf8mb4_general_ci',
	`technologyTransferOfficer` VARCHAR(50) NULL DEFAULT NULL COMMENT '수요기술담당자' COLLATE 'utf8mb4_general_ci',
	`technologyTransferTel` VARCHAR(50) NULL DEFAULT NULL COMMENT '수요기술담당자연락처' COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`companyDemand`) USING BTREE,
	UNIQUE INDEX `keyCompany` (`keyCompany`) USING BTREE,
	INDEX `FK_TB-CompanyDemand_TB-Company` (`company`) USING BTREE,
	CONSTRAINT `FK_TB-CompanyDemand_TB-Company` FOREIGN KEY (`company`) REFERENCES `DB-RTST`.`TB-Company` (`company`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_general_ci' ENGINE=InnoDB;

TRUNCATE `TB-CompanyDemand`;
INSERT INTO `TB-CompanyDemand`(`company`, `companyName`, `registerNumber`, `keyCompany`, `demandingTechnology`, `introductoryIntention`, `technologyTransfer`, `technologyTransferDepartment`, `technologyTransferOfficer`, `technologyTransferTel`)
SELECT `TB-Company`.`Company`, `corp_demand_db`.`기업명`, `corp_demand_db`.`사업자등록번호`, `corp_demand_db`.`기업코드`
, CAST(IF(`수요기술` = '-', NULL, `수요기술`) AS INTEGER) AS `demandingTechnology`
, CAST(IF(`기술도입의향` = '-', NULL, `기술도입의향`) AS INTEGER) AS `introductoryIntention`
, CAST(IF(`기술이전` = '-', NULL, `기술이전`) AS INTEGER) AS `technologyTransfer`
, CAST(IF(`기술이전전담부서` = '-', NULL, `기술이전전담부서`) AS INTEGER) AS `technologyTransferDepartment`
, CAST(IF(`수요기술담당자` = '-', NULL, `수요기술담당자`) AS INTEGER) AS `technologyTransferOfficer`
, CAST(IF(`수요기술담당자연락처` = '-', NULL, `수요기술담당자연락처`) AS INTEGER) AS `technologyTransferTel`
FROM `corp_demand_db`
LEFT OUTER JOIN `TB-Company` ON `corp_demand_db`.`기업코드` = `TB-Company`.`keyCompany`;`TB-CompanyDemand`
