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

-- -----------------------------------------------------
-- Table `activity_status`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_status` (
  `id` TINYINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL COMMENT '活动状态。',
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `activities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `activities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ownerid` INT ,
  `groupid` INT NULL,
  `content` VARCHAR(45) NOT NULL,
  `maxnum` SMALLINT NOT NULL COMMENT '最大人数',
  `createtime` DATETIME NOT NULL,
  `starttime` DATETIME NOT NULL COMMENT '开始时间',
  `duration` INT NULL COMMENT '单位为分钟',
  `statusid` TINYINT NULL COMMENT '状态：接受报名、截止报名、活动结束、活动取消等',
  PRIMARY KEY (`id`),
  INDEX `fk_activities_users1_idx` (`ownerid` ASC),
  INDEX `fk_activities_groups1_idx` (`groupid` ASC),
  INDEX `statusid_idx` (`statusid` ASC),
  CONSTRAINT `fk_activities_users1`
    FOREIGN KEY (`ownerid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_activities_groups1`
    FOREIGN KEY (`groupid`)
    REFERENCES `groups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `statusid`
    FOREIGN KEY (`statusid`)
    REFERENCES `activity_status` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `user_activities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_activities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `activityid` INT NOT NULL,
  `iscanceled` TINYINT(1) NULL COMMENT '取消报名',
  `isaccepted` TINYINT(1) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_activity_reg_users1_idx` (`userid` ASC),
  INDEX `fk_activity_reg_activities1_idx` (`activityid` ASC),
  CONSTRAINT `fk_activity_reg_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_activity_reg_activities1`
    FOREIGN KEY (`activityid`)
    REFERENCES `activities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `group_members`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `group_members` ;

CREATE TABLE IF NOT EXISTS `group_members` (
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


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
