SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';


-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `users` ;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NULL,
  `password` VARCHAR(45) NULL,
  `regtime` DATETIME NULL,
  `isonline` TINYINT(1) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_profiles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user_profiles` ;

CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NULL,
  `email` VARCHAR(45) NULL,
  `nickname` VARCHAR(45) NULL,
  `name` VARCHAR(45) NULL,
  `gender` ENUM('m','f') NULL,
  `age` TINYINT NULL,
  `grade` YEAR NULL,
  `university` VARCHAR(45) NULL,
  `major` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `id_idx` (`userid` ASC),
  CONSTRAINT `fk_user_profiles_1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `admin`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `admin` ;

CREATE TABLE IF NOT EXISTS `admin` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NULL,
  `password` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `regtime` DATETIME NULL,
  `lastip` VARCHAR(45) NULL,
  `lasttime` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_friendship`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user_friendship` ;

CREATE TABLE IF NOT EXISTS `user_friendship` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NULL,
  `friendid` INT NULL,
  `remark` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_user_friendship_1_idx` (`userid` ASC),
  INDEX `fk_user_friendship_2_idx` (`friendid` ASC),
  CONSTRAINT `fk_user_friendship_1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_friendship_2`
    FOREIGN KEY (`friendid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `groups`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `groups` ;

CREATE TABLE IF NOT EXISTS `groups` (
  `id` INT NOT NULL,
  `ownerid` INT NULL,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(280) NULL,
  `createtime` DATETIME NULL,
  `avatar` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `id_idx` (`ownerid` ASC),
  CONSTRAINT `ownerid`
    FOREIGN KEY (`ownerid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
