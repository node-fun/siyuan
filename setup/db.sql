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
  `id` INT NOT NULL AUTO_INCREMENT,
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


-- -----------------------------------------------------
-- Table `group_membership`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `group_membership` ;

CREATE TABLE IF NOT EXISTS `group_membership` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `groupid` INT NULL,
  `userid` INT NULL,
  `isowner` TINYINT(1) NULL,
  `isadmin` TINYINT(1) NULL,
  `remark` VARCHAR(45) NULL COMMENT '备注名',
  PRIMARY KEY (`id`),
  INDEX `groupid_idx` (`groupid` ASC),
  INDEX `userid_idx` (`userid` ASC),
  CONSTRAINT `groupid`
    FOREIGN KEY (`groupid`)
    REFERENCES `groups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `userid`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `activity_status`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `activity_status` ;

CREATE TABLE IF NOT EXISTS `activity_status` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL COMMENT '活动状态',
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `activities`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `activities` ;

CREATE TABLE IF NOT EXISTS `activities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ownerid` INT NULL,
  `groupid` INT NULL,
  `content` VARCHAR(45) NULL,
  `maxnum` INT NULL COMMENT '最大人数',
  `createtime` DATETIME NULL,
  `starttime` DATETIME NULL COMMENT '开始时间',
  `duration` INT NULL COMMENT '单位为分钟',
  `statusid` INT NULL COMMENT '状态：接受报名、截止报名、活动结束、活动取消等',
  `avatar` VARCHAR(45) NULL,
  `money` DECIMAL NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_activities_activity_status1_idx` (`statusid` ASC),
  CONSTRAINT `fk_activities_activity_status1`
    FOREIGN KEY (`statusid`)
    REFERENCES `activity_status` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_activity`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user_activity` ;

CREATE TABLE IF NOT EXISTS `user_activity` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NULL,
  `activityid` INT NULL,
  `isaccepted` TINYINT(1) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_user_activity_activities1_idx` (`activityid` ASC),
  INDEX `fk_user_activity_users1_idx` (`userid` ASC),
  CONSTRAINT `fk_user_activity_activities1`
    FOREIGN KEY (`activityid`)
    REFERENCES `activities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_activity_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `issues`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `issues` ;

CREATE TABLE IF NOT EXISTS `issues` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NULL,
  `title` VARCHAR(64) NULL,
  `body` VARCHAR(512) NULL,
  `posttime` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `_idx` (`userid` ASC),
  CONSTRAINT `userid`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `issue_comments`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `issue_comments` ;

CREATE TABLE IF NOT EXISTS `issue_comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `issueid` INT NULL,
  `body` VARCHAR(512) NULL,
  `posttime` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `issueid_idx` (`issueid` ASC),
  CONSTRAINT `issueid`
    FOREIGN KEY (`issueid`)
    REFERENCES `issues` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
