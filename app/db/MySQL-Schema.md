```SQL
CREATE TABLE `lobbies` (
    `id` CHAR(36) BINARY , 
    `name` VARCHAR(255), 
    `type` ENUM('public', 'private') NOT NULL DEFAULT 'public', 
    `game` ENUM('UNO', 'GoFish') NOT NULL DEFAULT 'UNO', 
    `maxPlayers` INTEGER, 
    `maxSpectators` INTEGER, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL,
    `hostId` CHAR(36) BINARY,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```
```SQL
CREATE TABLE `users` (
    `id` CHAR(36) BINARY , 
    `displayName` VARCHAR(255), 
    `status` ENUM('online', 'offline') NOT NULL DEFAULT 'online', 
    `role` ENUM('host', 'player', 'spectator'), 
    `accountStatus` ENUM('active', 'pending', 'limited', 'deleted') NOT NULL DEFAULT 'limited', 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL, 
    `lobbyId` CHAR(36) BINARY, 
    PRIMARY KEY (`id`), 
    FOREIGN KEY (`lobbyId`) REFERENCES `lobbies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
```
```SQL
CREATE TABLE `authorization` (
    `id` INTEGER NOT NULL auto_increment , 
    `username` VARCHAR(255) UNIQUE, 
    `password` VARCHAR(255), 
    `email` VARCHAR(255) UNIQUE, 
    `facebookId` VARCHAR(255) UNIQUE, 
    `facebookToken` VARCHAR(255), 
    `facebookName` VARCHAR(255), 
    `googleId` VARCHAR(255) UNIQUE, 
    `googleToken` VARCHAR(255), 
    `googleName` VARCHAR(255), 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL, 
    `userId` CHAR(36) BINARY, 
     PRIMARY KEY (`id`), 
     FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
```
```SQL
CREATE TABLE `tokens` (
    `id` INTEGER NOT NULL auto_increment , 
    `token` VARCHAR(255) NOT NULL UNIQUE, 
    `type` ENUM('verify', 'pwdreset', 'rememberme') NOT NULL DEFAULT 'verify', 
    `expires` DATETIME, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL, 
    `userId` CHAR(36) BINARY, 
    PRIMARY KEY (`id`), 
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
```
```SQL
CREATE TABLE `messages` (
    `id` CHAR(36) BINARY , 
    `transport` ENUM('global', 'lobby', 'private') NOT NULL DEFAULT 'global', 
    `senderRole` ENUM('host', 'player', 'spectator'), 
    `message` VARCHAR(255), 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL, 
    `senderId` CHAR(36) BINARY, 
    `lobbyId` CHAR(36) BINARY, 
    `recipientId` CHAR(36) BINARY, 
    PRIMARY KEY (`id`), 
    FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, 
    FOREIGN KEY (`lobbyId`) REFERENCES `lobbies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, 
    FOREIGN KEY (`recipientId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
```
