USE `DB-RTST_2101`;

DROP TABLE IF EXISTS `TB-Patent`;

CREATE TABLE IF NOT EXISTS `TB-Patent` (
	`patent` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '등록번호',
	`registed` DATE NULL DEFAULT NULL COMMENT '등록일',
	`expireDate` DATE NULL DEFAULT NULL COMMENT '존속기간 만료일',
	`inventionTitle` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci',
	`applicationNumber` BIGINT(20) UNSIGNED NULL DEFAULT NULL COMMENT '출원번호' COLLATE 'utf8mb4_general_ci',
	`applicationDate` DATE NULL DEFAULT NULL COMMENT '출원일',
	`internationalApplicationNumber` VARCHAR(32) NULL DEFAULT NULL COMMENT '국제출원번호' COLLATE 'utf8mb4_general_ci',
	`internationalApplicationDate` DATE NULL DEFAULT NULL COMMENT '국제출원일' COLLATE 'utf8mb4_general_ci',
	`internationalPublicationNumber` VARCHAR(32) NULL DEFAULT NULL COMMENT '국제공개번호' COLLATE 'utf8mb4_general_ci',
	`internationalPublicationDate` DATE NULL DEFAULT NULL COMMENT '국제공개일' COLLATE 'utf8mb4_general_ci',
	`astrtCont` LONGTEXT NULL DEFAULT NULL COMMENT '요약' COLLATE 'utf8mb4_general_ci',
	`representativeClaim` LONGTEXT NULL DEFAULT NULL COMMENT '대표청구항' COLLATE 'utf8mb4_general_ci',
	`gradeAppraisal` VARCHAR(4) NULL DEFAULT NULL COMMENT '특허평가등급' COLLATE 'utf8mb4_general_ci',
	`gradeRight` VARCHAR(4) NULL DEFAULT NULL COMMENT '권리등급' COLLATE 'utf8mb4_general_ci',
	`gradeTech` VARCHAR(4) NULL DEFAULT NULL COMMENT '기술등급' COLLATE 'utf8mb4_general_ci',
	`gradeUse` VARCHAR(4) NULL DEFAULT NULL COMMENT '활용등급' COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`patent`) USING BTREE
) COLLATE='utf8mb4_general_ci' ENGINE=INNODB;

TRUNCATE `TB-Patent`;

INSERT INTO `TB-Patent`(`patent`, `registed`, `expireDate`, `inventionTitle`, `applicationNumber`, `applicationDate`, `internationalApplicationNumber`, `internationalApplicationDate`, `internationalPublicationNumber`,  `internationalPublicationDate`, `astrtCont`, `representativeClaim`, `gradeAppraisal`, `gradeRight`, `gradeTech`, `gradeUse`)
SELECT CAST(`patent_overall_db`.`등록번호` AS UNSIGNED) AS `patent`
, IF(TRIM(IFNULL(`patent_overall_db`.`등록일`, '')) = '', NULL, DATE_FORMAT(IFNULL(`patent_overall_db`.`등록일`, ''), '%Y-%m-%d')) AS `registed`
, IF(TRIM(IFNULL(`patent_overall_db`.`존속기간 만료일`, '')) = '', NULL, DATE_FORMAT(IFNULL(`patent_overall_db`.`존속기간 만료일`, ''), '%Y-%m-%d')) AS `expireDate`
, IF(TRIM(IFNULL(`patent_overall_db`.`발명의 명칭`, '')) = '', NULL, TRIM(IFNULL(`patent_overall_db`.`발명의 명칭`, ''))) AS `inventionTitle`
, CAST(`patent_overall_db`.`출원번호` AS UNSIGNED) AS `applicationNumber`
, IF(TRIM(IFNULL(`patent_overall_db`.`출원일`, '')) = '', NULL, DATE_FORMAT(IFNULL(`patent_overall_db`.`출원일`, ''), '%Y-%m-%d')) AS `applicationDate`
, IF(TRIM(IFNULL(`patent_overall_db`.`국제출원번호`, '')) = '', NULL, TRIM(IFNULL(`patent_overall_db`.`국제출원번호`, ''))) AS `internationalApplicationNumber`
, IF(TRIM(IFNULL(`patent_overall_db`.`국제출원일`, '')) = '', NULL, DATE_FORMAT(IFNULL(`patent_overall_db`.`국제출원일`, ''), '%Y-%m-%d')) AS `internationalApplicationDate`
, IF(TRIM(IFNULL(`patent_overall_db`.`국제공개번호`, '')) = '', NULL, TRIM(IFNULL(`patent_overall_db`.`국제공개번호`, ''))) AS `internationalPublicationNumber`
, IF(TRIM(IFNULL(`patent_overall_db`.`국제공개일`, '')) = '', NULL, DATE_FORMAT(IFNULL(`patent_overall_db`.`국제공개일`, ''), '%Y-%m-%d')) AS `internationalPublicationDate`
, IF(TRIM(IFNULL(`patent_overall_db`.`요약`, '')) = '', NULL, TRIM(IFNULL(`patent_overall_db`.`요약`, ''))) AS `astrtCont`
, IF(TRIM(IFNULL(`patent_overall_db`.`대표청구항`, '')) = '', NULL, TRIM(IFNULL(`patent_overall_db`.`대표청구항`, ''))) AS `representativeClaim`
, IF(TRIM(IFNULL(`patent_overall_db`.`특허평가등급`, '')) = '', NULL, TRIM(IFNULL(`patent_overall_db`.`특허평가등급`, ''))) AS `gradeAppraisal`
, IF(TRIM(IFNULL(`patent_overall_db`.`권리등급`, '')) = '', NULL, TRIM(IFNULL(`patent_overall_db`.`권리등급`, ''))) AS `gradeRight`
, IF(TRIM(IFNULL(`patent_overall_db`.`기술등급`, '')) = '', NULL, TRIM(IFNULL(`patent_overall_db`.`기술등급`, ''))) AS `gradeTech`
, IF(TRIM(IFNULL(`patent_overall_db`.`활용등급`, '')) = '', NULL, TRIM(IFNULL(`patent_overall_db`.`활용등급`, ''))) AS `gradeUse`
FROM `patent_overall_db`;

SELECT COUNT(*) FROM `patent_overall_db`;
