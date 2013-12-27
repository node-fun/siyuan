SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `siyuan` ;
CREATE SCHEMA IF NOT EXISTS `siyuan` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `siyuan` ;

-- -----------------------------------------------------
-- Table `siyuan`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `siyuan`.`users` ;

CREATE TABLE IF NOT EXISTS `siyuan`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NULL,
  `password` VARCHAR(45) NULL,
  `regtime` DATETIME NULL,
  `isonline` TINYINT(1) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `siyuan`.`user_profiles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `siyuan`.`user_profiles` ;

CREATE TABLE IF NOT EXISTS `siyuan`.`user_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NULL,
  `email` VARCHAR(45) NULL,
  `nickname` VARCHAR(45) NULL,
  `name` VARCHAR(45) NULL,
  `gender` ENUM('male','female') NULL,
  `age` TINYINT NULL,
  `grade` YEAR NULL,
  `university` VARCHAR(45) NULL,
  `major` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `id_idx` (`userid` ASC),
  CONSTRAINT `id`
    FOREIGN KEY (`userid`)
    REFERENCES `siyuan`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `siyuan`.`admin`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `siyuan`.`admin` ;

CREATE TABLE IF NOT EXISTS `siyuan`.`admin` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NULL,
  `password` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `regdate` DATETIME NULL,
  `lastip` VARCHAR(45) NULL,
  `lastdate` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
