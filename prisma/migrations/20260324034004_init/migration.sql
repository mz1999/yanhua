-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "scene" TEXT NOT NULL,
    "composition" TEXT NOT NULL,
    "lighting" TEXT NOT NULL,
    "culture" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT,
    "selectedImage" TEXT,
    "videoUrl" TEXT,
    "title" TEXT,
    "content" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
