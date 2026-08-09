-- CreateEnum
CREATE TYPE "PriceNegotiationStatus" AS ENUM ('DRAFT', 'COLLECTING_QUOTES', 'NEGOTIATING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmrDeploymentType" AS ENUM ('CLOUD', 'ON_PREMISES');

-- CreateEnum
CREATE TYPE "EmrTransport" AS ENUM ('REST_API', 'SS_MIX2', 'SFTP', 'CSV_BATCH');

-- CreateEnum
CREATE TYPE "EmrDirection" AS ENUM ('INBOUND_ONLY', 'BIDIRECTIONAL');

-- CreateEnum
CREATE TYPE "EmrConnectionStatus" AS ENUM ('DRAFT', 'READY', 'PAUSED');

-- CreateEnum
CREATE TYPE "EmrSyncStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DataAssetCategory" AS ENUM ('MASTER', 'PROCUREMENT', 'CUSTOMER_FEEDBACK', 'EMR_AGGREGATE');

-- CreateEnum
CREATE TYPE "DataClassification" AS ENUM ('INTERNAL', 'CONFIDENTIAL');

-- CreateEnum
CREATE TYPE "DataAssetReviewOutcome" AS ENUM ('APPROVED', 'ACTION_REQUIRED');

-- CreateEnum
CREATE TYPE "AuditActorKind" AS ENUM ('OPERATOR', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FeedbackSource" AS ENUM ('EXHIBITION', 'CUSTOMER_VISIT', 'INTERVIEW', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackDepartment" AS ENUM ('PROCUREMENT', 'PHARMACY', 'CLINICAL', 'MANAGEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'REVIEWING', 'PLANNED', 'COMPLETED', 'DECLINED');

-- CreateTable
CREATE TABLE "price_negotiations" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "organization_product_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "baseline_unit_price_yen" INTEGER,
    "target_unit_price_yen" INTEGER,
    "status" "PriceNegotiationStatus" NOT NULL DEFAULT 'DRAFT',
    "quote_due_date" DATE,
    "contract_valid_from" DATE,
    "completed_at" TIMESTAMP(3),
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_negotiations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negotiation_demands" (
    "id" UUID NOT NULL,
    "negotiation_id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "negotiation_demands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negotiation_quotes" (
    "id" UUID NOT NULL,
    "negotiation_id" UUID NOT NULL,
    "distributor_id" UUID NOT NULL,
    "round_number" INTEGER NOT NULL DEFAULT 1,
    "unit_price_yen" INTEGER NOT NULL,
    "minimum_quantity" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" DATE,
    "note" TEXT,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "negotiation_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emr_connections" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "system_name" TEXT NOT NULL,
    "deployment_type" "EmrDeploymentType" NOT NULL,
    "transport" "EmrTransport" NOT NULL,
    "direction" "EmrDirection" NOT NULL DEFAULT 'INBOUND_ONLY',
    "endpoint_url" TEXT,
    "schedule" TEXT,
    "status" "EmrConnectionStatus" NOT NULL DEFAULT 'DRAFT',
    "archived_at" TIMESTAMP(3),
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emr_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emr_sync_runs" (
    "id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "external_run_id" TEXT,
    "status" "EmrSyncStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "received_count" INTEGER NOT NULL DEFAULT 0,
    "rejected_count" INTEGER NOT NULL DEFAULT 0,
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emr_sync_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_assets" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DataAssetCategory" NOT NULL,
    "classification" "DataClassification" NOT NULL,
    "purpose" TEXT NOT NULL,
    "retention_days" INTEGER,
    "review_interval_days" INTEGER NOT NULL DEFAULT 365,
    "last_reviewed_at" TIMESTAMP(3),
    "next_review_at" DATE NOT NULL,
    "archived_at" TIMESTAMP(3),
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_asset_reviews" (
    "id" UUID NOT NULL,
    "data_asset_id" UUID NOT NULL,
    "outcome" "DataAssetReviewOutcome" NOT NULL,
    "note" TEXT,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "next_review_at" DATE NOT NULL,

    CONSTRAINT "data_asset_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "changed_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "actor_kind" "AuditActorKind" NOT NULL DEFAULT 'OPERATOR',
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_feedbacks" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "summary" VARCHAR(1000) NOT NULL,
    "source" "FeedbackSource" NOT NULL,
    "department" "FeedbackDepartment" NOT NULL,
    "impact" "FeedbackImpact" NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "captured_at" DATE NOT NULL,
    "archived_at" TIMESTAMP(3),
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_feedback_status_changes" (
    "id" UUID NOT NULL,
    "customer_feedback_id" UUID NOT NULL,
    "from_status" "FeedbackStatus",
    "to_status" "FeedbackStatus" NOT NULL,
    "reason" VARCHAR(240),
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_feedback_status_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_negotiations_organization_id_status_idx" ON "price_negotiations"("organization_id", "status");

-- CreateIndex
CREATE INDEX "price_negotiations_organization_product_id_idx" ON "price_negotiations"("organization_product_id");

-- CreateIndex
CREATE INDEX "negotiation_demands_facility_id_idx" ON "negotiation_demands"("facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "negotiation_demands_negotiation_id_facility_id_key" ON "negotiation_demands"("negotiation_id", "facility_id");

-- CreateIndex
CREATE INDEX "negotiation_quotes_negotiation_id_unit_price_yen_idx" ON "negotiation_quotes"("negotiation_id", "unit_price_yen");

-- CreateIndex
CREATE UNIQUE INDEX "negotiation_quotes_negotiation_id_distributor_id_round_numb_key" ON "negotiation_quotes"("negotiation_id", "distributor_id", "round_number");

-- CreateIndex
CREATE UNIQUE INDEX "emr_connections_facility_id_key" ON "emr_connections"("facility_id");

-- CreateIndex
CREATE INDEX "emr_connections_organization_id_archived_at_status_idx" ON "emr_connections"("organization_id", "archived_at", "status");

-- CreateIndex
CREATE INDEX "emr_sync_runs_connection_id_started_at_idx" ON "emr_sync_runs"("connection_id", "started_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "emr_sync_runs_connection_id_external_run_id_key" ON "emr_sync_runs"("connection_id", "external_run_id");

-- CreateIndex
CREATE INDEX "data_assets_organization_id_archived_at_next_review_at_idx" ON "data_assets"("organization_id", "archived_at", "next_review_at");

-- CreateIndex
CREATE UNIQUE INDEX "data_assets_organization_id_code_key" ON "data_assets"("organization_id", "code");

-- CreateIndex
CREATE INDEX "data_asset_reviews_data_asset_id_reviewed_at_idx" ON "data_asset_reviews"("data_asset_id", "reviewed_at" DESC);

-- CreateIndex
CREATE INDEX "audit_events_organization_id_occurred_at_idx" ON "audit_events"("organization_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_events_organization_id_entity_type_entity_id_idx" ON "audit_events"("organization_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "customer_feedbacks_organization_id_archived_at_status_captu_idx" ON "customer_feedbacks"("organization_id", "archived_at", "status", "captured_at");

-- CreateIndex
CREATE INDEX "customer_feedbacks_organization_id_impact_idx" ON "customer_feedbacks"("organization_id", "impact");

-- CreateIndex
CREATE INDEX "customer_feedback_status_changes_customer_feedback_id_chang_idx" ON "customer_feedback_status_changes"("customer_feedback_id", "changed_at" DESC);

-- AddForeignKey
ALTER TABLE "price_negotiations" ADD CONSTRAINT "price_negotiations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_negotiations" ADD CONSTRAINT "price_negotiations_organization_product_id_fkey" FOREIGN KEY ("organization_product_id") REFERENCES "organization_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation_demands" ADD CONSTRAINT "negotiation_demands_negotiation_id_fkey" FOREIGN KEY ("negotiation_id") REFERENCES "price_negotiations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation_demands" ADD CONSTRAINT "negotiation_demands_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation_quotes" ADD CONSTRAINT "negotiation_quotes_negotiation_id_fkey" FOREIGN KEY ("negotiation_id") REFERENCES "price_negotiations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation_quotes" ADD CONSTRAINT "negotiation_quotes_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emr_connections" ADD CONSTRAINT "emr_connections_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emr_connections" ADD CONSTRAINT "emr_connections_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emr_sync_runs" ADD CONSTRAINT "emr_sync_runs_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "emr_connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_assets" ADD CONSTRAINT "data_assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_asset_reviews" ADD CONSTRAINT "data_asset_reviews_data_asset_id_fkey" FOREIGN KEY ("data_asset_id") REFERENCES "data_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_feedbacks" ADD CONSTRAINT "customer_feedbacks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_feedback_status_changes" ADD CONSTRAINT "customer_feedback_status_changes_customer_feedback_id_fkey" FOREIGN KEY ("customer_feedback_id") REFERENCES "customer_feedbacks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
