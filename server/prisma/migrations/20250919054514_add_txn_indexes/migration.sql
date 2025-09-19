-- CreateIndex
CREATE INDEX "txn_org_date_idx" ON "public"."Transaction"("orgId", "date");

-- CreateIndex
CREATE INDEX "txn_org_type_idx" ON "public"."Transaction"("orgId", "type");

-- CreateIndex
CREATE INDEX "txn_org_category_idx" ON "public"."Transaction"("orgId", "categoryId");

-- CreateIndex
CREATE INDEX "txn_org_user_idx" ON "public"."Transaction"("orgId", "userId");
