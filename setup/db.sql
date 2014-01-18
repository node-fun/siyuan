SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';


-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
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
CREATE TABLE IF NOT EXISTS `groups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ownerid` INT NULL,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(280) NULL,
  `createtime` DATETIME NULL,
  `avatar` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `id_idx` (`ownerid` ASC),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC),
  CONSTRAINT `ownerid`
    FOREIGN KEY (`ownerid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `group_membership`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `group_membership` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `groupid` INT NULL,
  `userid` INT NULL,
  `isowner` TINYINT(1) NULL,
  `isadmin` TINYINT(1) NULL,
  `remark` VARCHAR(45) NULL COMMENT '备注名',
  `restrict` ENUM('public','private') NULL DEFAULT 'public' COMMENT 'public: 所有人都可以加入；\nprivate: 只有圈主可以拉人。',
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
CREATE TABLE IF NOT EXISTS `activity_status` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL COMMENT '活动状态',
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `activities`
-- -----------------------------------------------------
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
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_activities_activity_status1_idx` (`statusid` ASC),
  INDEX `fk_activities_users1_idx` (`ownerid` ASC),
  INDEX `fk_activities_groups1_idx` (`groupid` ASC),
  CONSTRAINT `fk_activities_activity_status1`
    FOREIGN KEY (`statusid`)
    REFERENCES `activity_status` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_activities_users1`
    FOREIGN KEY (`ownerid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_activities_groups1`
    FOREIGN KEY (`groupid`)
    REFERENCES `groups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_activity`
-- -----------------------------------------------------
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
CREATE TABLE IF NOT EXISTS `issues` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NULL,
  `title` VARCHAR(64) NULL,
  `body` VARCHAR(512) NULL,
  `posttime` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `_idx` (`userid` ASC),
  CONSTRAINT `fk_issues_1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `issue_comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `issue_comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NULL,
  `issueid` INT NULL,
  `body` VARCHAR(512) NULL,
  `posttime` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_issue_comments_issues1_idx` (`issueid` ASC),
  INDEX `fk_issue_comments_users1_idx` (`userid` ASC),
  CONSTRAINT `fk_issue_comments_issues1`
    FOREIGN KEY (`issueid`)
    REFERENCES `issues` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_issue_comments_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `co_comment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `co_comment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cooperationid` INT NULL,
  `co_commentcol` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `cooperation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cooperation` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `company` VARCHAR(45) NULL,
  `deadline` VARCHAR(45) NULL,
  `avatar` VARCHAR(45) NULL,
  `statusid` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_cooperation_co_comment1_idx` (`statusid` ASC),
  CONSTRAINT `fk_cooperation_co_comment1`
    FOREIGN KEY (`statusid`)
    REFERENCES `co_comment` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_cooperation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_cooperation` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NULL,
  `cooperationid` INT NULL,
  `isaccepted` TINYINT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_user_cooperation_users1_idx` (`userid` ASC),
  INDEX `fk_user_cooperation_cooperation1_idx` (`cooperationid` ASC),
  CONSTRAINT `fk_user_cooperation_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_cooperation_cooperation1`
    FOREIGN KEY (`cooperationid`)
    REFERENCES `cooperation` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `co_status`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `co_status` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `activity_status`
-- -----------------------------------------------------
START TRANSACTION;
INSERT INTO `activity_status` (`id`, `name`) VALUES (1, '接受报名');
INSERT INTO `activity_status` (`id`, `name`) VALUES (2, '截止报名');
INSERT INTO `activity_status` (`id`, `name`) VALUES (3, '活动结束');
INSERT INTO `activity_status` (`id`, `name`) VALUES (4, '活动取消');

COMMIT;


-- -----------------------------------------------------
-- Data for table `co_status`
-- -----------------------------------------------------
START TRANSACTION;
INSERT INTO `co_status` (`id`, `name`) VALUES (1, '发布');
INSERT INTO `co_status` (`id`, `name`) VALUES (2, '结束');

COMMIT;


