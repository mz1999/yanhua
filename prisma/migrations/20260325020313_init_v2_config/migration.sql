/*
  Warnings:

  - Added the required column `baseStyle` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `focus` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `textureOverlays` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "baseStyle" TEXT NOT NULL,
    "textureOverlays" TEXT NOT NULL,
    "scene" TEXT NOT NULL,
    "culture" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "lighting" TEXT NOT NULL,
    "description" TEXT,
    "style" TEXT,
    "composition" TEXT,
    "images" TEXT,
    "selectedImage" TEXT,
    "videoUrl" TEXT,
    "title" TEXT,
    "content" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Task" ("composition", "content", "createdAt", "culture", "description", "id", "images", "lighting", "scene", "selectedImage", "status", "style", "tags", "title", "updatedAt", "videoUrl") SELECT "composition", "content", "createdAt", "culture", "description", "id", "images", "lighting", "scene", "selectedImage", "status", "style", "tags", "title", "updatedAt", "videoUrl" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
