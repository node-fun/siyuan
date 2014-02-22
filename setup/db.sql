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
  `avatar` VARCHAR(45) NULL,
  `cover` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `email` VARCHAR(45) NULL,
  `name` VARCHAR(45) NULL,
  `gender` ENUM('m','f') NULL,
  `age` TINYINT NULL,
  `grade` YEAR NULL,
  `university` VARCHAR(45) NULL,
  `major` VARCHAR(45) NULL,
  `summary` VARCHAR(280) NULL,
  `tag` VARCHAR(280) NULL,
  PRIMARY KEY (`id`),
  INDEX `id_idx` (`userid` ASC),
  CONSTRAINT `fk_user_profiles_1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
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
-- Table `followship`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `followship` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `followid` INT NOT NULL,
  `remark` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_user_followship_1_idx` (`userid` ASC),
  INDEX `fk_user_followship_2_idx` (`followid` ASC),
  UNIQUE INDEX `uq_user_followship_1_idx` (`userid` ASC, `followid` ASC),
  CONSTRAINT `fk_user_followship_1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_followship_2`
    FOREIGN KEY (`followid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `groups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `groups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ownerid` INT NOT NULL,
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
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `group_membership`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `group_membership` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `groupid` INT NOT NULL,
  `userid` INT NOT NULL,
  `isowner` TINYINT(1) NULL,
  `isadmin` TINYINT(1) NULL,
  `remark` VARCHAR(45) NULL COMMENT '备注名',
  `restrict` ENUM('public','private') NULL DEFAULT 'public' COMMENT 'public: 所有人都可以加入；\nprivate: 只有圈主可以拉人。',
  PRIMARY KEY (`id`),
  INDEX `groupid_idx` (`groupid` ASC),
  INDEX `userid_idx` (`userid` ASC),
  UNIQUE INDEX `group_member_unique` (`groupid` ASC, `userid` ASC),
  CONSTRAINT `groupid`
    FOREIGN KEY (`groupid`)
    REFERENCES `groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `userid`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
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
  `ownerid` INT NOT NULL,
  `groupid` INT NOT NULL,
  `content` VARCHAR(45) NULL,
  `maxnum` INT NULL COMMENT '最大人数',
  `createtime` DATETIME NULL,
  `starttime` DATETIME NULL COMMENT '开始时间',
  `duration` INT NULL COMMENT '单位为分钟',
  `statusid` INT NOT NULL COMMENT '状态：接受报名、截止报名、活动结束、活动取消等',
  `avatar` VARCHAR(45) NULL,
  `money` DECIMAL NULL,
  `name` VARCHAR(45) NULL,
  `site` VARCHAR(45) NULL,
  `regdeadline` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_activities_activity_status1_idx` (`statusid` ASC),
  INDEX `fk_activities_users1_idx` (`ownerid` ASC),
  INDEX `fk_activities_groups1_idx` (`groupid` ASC),
  CONSTRAINT `fk_activities_activity_status1`
    FOREIGN KEY (`statusid`)
    REFERENCES `activity_status` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_activities_users1`
    FOREIGN KEY (`ownerid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_activities_groups1`
    FOREIGN KEY (`groupid`)
    REFERENCES `groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_activity`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_activity` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `activityid` INT NOT NULL,
  `isaccepted` TINYINT(1) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_user_activity_activities1_idx` (`activityid` ASC),
  INDEX `fk_user_activity_users1_idx` (`userid` ASC),
  UNIQUE INDEX `userid_activityid_UNIQUE` (`userid` ASC, `activityid` ASC),
  CONSTRAINT `fk_user_activity_activities1`
    FOREIGN KEY (`activityid`)
    REFERENCES `activities` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_activity_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `issues`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `issues` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `groupid` INT NULL,
  `activityid` INT NULL,
  `title` VARCHAR(64) NULL,
  `body` VARCHAR(512) NULL,
  `posttime` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `_idx` (`userid` ASC),
  INDEX `fk_groupid_idx` (`groupid` ASC),
  INDEX `fk_activityid_idx` (`activityid` ASC),
  CONSTRAINT `fk_issues_1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_groupid`
    FOREIGN KEY (`groupid`)
    REFERENCES `groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT,
  CONSTRAINT `fk_activityid`
    FOREIGN KEY (`activityid`)
    REFERENCES `activities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `issue_comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `issue_comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `issueid` INT NOT NULL,
  `body` VARCHAR(512) NULL,
  `posttime` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_issue_comments_issues1_idx` (`issueid` ASC),
  INDEX `fk_issue_comments_users1_idx` (`userid` ASC),
  CONSTRAINT `fk_issue_comments_issues1`
    FOREIGN KEY (`issueid`)
    REFERENCES `issues` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_issue_comments_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `co_status`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `co_status` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `cooperations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cooperations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `ownerid` INT NOT NULL,
  `description` VARCHAR(45) NULL,
  `company` VARCHAR(45) NULL,
  `avatar` VARCHAR(45) NULL,
  `statusid` INT NOT NULL,
  `isprivate` TINYINT NULL,
  `regdeadline` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_cooperations_co_status1_idx` (`statusid` ASC),
  INDEX `fk_cooperations_users1_idx` (`ownerid` ASC),
  CONSTRAINT `fk_cooperations_co_status1`
    FOREIGN KEY (`statusid`)
    REFERENCES `co_status` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_cooperations_users1`
    FOREIGN KEY (`ownerid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `co_comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `co_comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cooperationid` INT NULL,
  `userid` INT NULL,
  `body` VARCHAR(512) NULL,
  `posttime` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_co_comment_cooperations1_idx` (`cooperationid` ASC),
  INDEX `fk_co_comments_users1_idx` (`userid` ASC),
  CONSTRAINT `fk_co_comment_cooperations1`
    FOREIGN KEY (`cooperationid`)
    REFERENCES `cooperations` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_co_comments_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `user_cooperation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_cooperation` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `cooperationid` INT NOT NULL,
  `isaccepted` TINYINT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_user_cooperation_users1_idx` (`userid` ASC),
  INDEX `fk_user_cooperation_cooperation1_idx` (`cooperationid` ASC),
  CONSTRAINT `fk_user_cooperation_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_cooperation_cooperation1`
    FOREIGN KEY (`cooperationid`)
    REFERENCES `cooperations` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `photos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `photos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `description` VARCHAR(280) NULL,
  `posttime` DATETIME NULL,
  PRIMARY KEY (`id`, `userid`),
  INDEX `fk_photos_users1_idx` (`userid` ASC),
  CONSTRAINT `fk_photos_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `starship`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `starship` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `itemtype` INT NOT NULL,
  `itemid` INT NOT NULL,
  `remark` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_starship_users1_idx` (`userid` ASC),
  UNIQUE INDEX `uq_starship_1_idx` (`userid` ASC, `itemtype` ASC, `itemid` ASC),
  CONSTRAINT `fk_starship_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `events`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `groupid` INT NULL,
  `itemtype` INT NULL,
  `itemid` INT NULL,
  `message` VARCHAR(280) NULL,
  `createtime` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_events_users1_idx` (`userid` ASC),
  INDEX `fk_events_groups1_idx` (`groupid` ASC),
  CONSTRAINT `fk_events_users1`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_events_groups1`
    FOREIGN KEY (`groupid`)
    REFERENCES `groups` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ad`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ad` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NULL,
  `content` VARCHAR(1000) NULL,
  `picture` VARCHAR(200) NULL,
  `posttime` DATETIME NULL,
  `adminid` INT NULL,
  `isoutofdate` TINYINT(1) NULL,
  PRIMARY KEY (`id`),
  INDEX `adminid_idx` (`adminid` ASC),
  CONSTRAINT `adminid`
    FOREIGN KEY (`adminid`)
    REFERENCES `admin` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `client_versions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `client_versions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `versioncode` VARCHAR(45) NULL,
  `versionname` VARCHAR(45) NULL,
  `description` VARCHAR(500) NULL,
  `comment` VARCHAR(45) NULL,
  `posttime` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `feedback`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NOT NULL,
  `type` VARCHAR(45) NULL,
  `title` VARCHAR(45) NULL,
  `body` VARCHAR(500) NULL,
  `versioncode` VARCHAR(45) NULL,
  `device` VARCHAR(45) NULL,
  `posttime` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `userid_idx` (`userid` ASC),
  CONSTRAINT `userid_idx`
    FOREIGN KEY (`userid`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `message`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `message` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sender` INT NULL COMMENT 'Sender can be null, that means system message.',
  `receiver` INT NOT NULL,
  `title` VARCHAR(45) NULL,
  `body` VARCHAR(500) NULL,
  `isread` TINYINT(1) NULL DEFAULT 0,
  `isreplied` TINYINT(1) NULL DEFAULT 0,
  `sourceid` INT NULL COMMENT 'The id of the source message.\nThat means this message is the reply of the source message.',
  `sendtime` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_sender_idx` (`sender` ASC),
  INDEX `fk_receiver_idx` (`receiver` ASC),
  CONSTRAINT `fk_sender`
    FOREIGN KEY (`sender`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_receiver`
    FOREIGN KEY (`receiver`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
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

