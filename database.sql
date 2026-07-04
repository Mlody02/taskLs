SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `categoryId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(32) NOT NULL,
  PRIMARY KEY (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `reminders`;
CREATE TABLE `reminders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `remind_date` date NOT NULL,
  `remind_time` time NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `s_equal0` CHECK (second(`remind_time`) = 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `toDoReminders`;
CREATE TABLE `toDoReminders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `toDoID` int(10) unsigned DEFAULT NULL,
  `reminderID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `toDoID` (`toDoID`),
  KEY `reminderID` (`reminderID`),
  CONSTRAINT `toDoReminders_ibfk_1` FOREIGN KEY (`toDoID`) REFERENCES `toDos` (`id`),
  CONSTRAINT `toDoReminders_ibfk_2` FOREIGN KEY (`reminderID`) REFERENCES `reminders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `toDos`;
CREATE TABLE `toDos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `category_id` int(10) unsigned DEFAULT NULL,
  `description` text DEFAULT NULL,
  `done` tinyint(1) DEFAULT 0,
  `priority` int(11) DEFAULT 0,
  `deadline` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `toDos_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;