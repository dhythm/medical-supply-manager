ALTER TABLE "price_negotiations"
  ADD CONSTRAINT "price_negotiations_baseline_price_positive" CHECK ("baseline_unit_price_yen" IS NULL OR "baseline_unit_price_yen" > 0),
  ADD CONSTRAINT "price_negotiations_target_price_positive" CHECK ("target_unit_price_yen" IS NULL OR "target_unit_price_yen" > 0);

ALTER TABLE "negotiation_demands"
  ADD CONSTRAINT "negotiation_demands_quantity_positive" CHECK ("quantity" > 0);

ALTER TABLE "negotiation_quotes"
  ADD CONSTRAINT "negotiation_quotes_unit_price_positive" CHECK ("unit_price_yen" > 0),
  ADD CONSTRAINT "negotiation_quotes_minimum_quantity_positive" CHECK ("minimum_quantity" IS NULL OR "minimum_quantity" > 0),
  ADD CONSTRAINT "negotiation_quotes_round_positive" CHECK ("round_number" > 0);

ALTER TABLE "emr_sync_runs"
  ADD CONSTRAINT "emr_sync_runs_received_count_nonnegative" CHECK ("received_count" >= 0),
  ADD CONSTRAINT "emr_sync_runs_rejected_count_nonnegative" CHECK ("rejected_count" >= 0);

ALTER TABLE "data_assets"
  ADD CONSTRAINT "data_assets_retention_days_positive" CHECK ("retention_days" IS NULL OR "retention_days" > 0),
  ADD CONSTRAINT "data_assets_review_interval_positive" CHECK ("review_interval_days" > 0);
