-- CreateTable
CREATE TABLE "RichTextContent" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "recordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RichTextContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RichTextContent_modelName_fieldName_recordId_idx" ON "RichTextContent"("modelName", "fieldName", "recordId");
