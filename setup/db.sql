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
-- Table `siyuan`.`user_profile`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `siyuan`.`user_profile` ;

CREATE TABLE IF NOT EXISTS `siyuan`.`user_profile` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `sex` TINYINT(1) NULL,
  `age` TINYINT NULL,
  `university` VARCHAR(45) NULL,
  `major` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_user_profile_1`
    FOREIGN KEY (`id`)
    REFERENCES `siyuan`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
