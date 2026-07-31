-- Enable UUID extension for auth link if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: clientsDetails
CREATE TABLE "clientsDetails" (
  "clientId" VARCHAR PRIMARY KEY,
  "authUserId" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "ownerName" VARCHAR NOT NULL,
  "ownerMobile" VARCHAR,
  "ownerEmail" VARCHAR,
  "businessName" VARCHAR NOT NULL,
  "businessType" VARCHAR,
  "plan" VARCHAR,
  "price" NUMERIC,
  "subscriptionStatus" VARCHAR,
  "subscriptionStartDate" DATE,
  "subscriptionEndDate" DATE,
  "address" TEXT,
  "city" VARCHAR,
  "state" VARCHAR,
  "country" VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: branches
CREATE TABLE "branches" (
  "branchId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "branchName" VARCHAR NOT NULL,
  "branchType" VARCHAR,
  "address" TEXT,
  "city" VARCHAR,
  "state" VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: whatsAppGroups
CREATE TABLE "whatsAppGroups" (
  "whatsAppGroupId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "branchId" VARCHAR NOT NULL REFERENCES "branches"("branchId") ON DELETE CASCADE,
  "groupName" VARCHAR NOT NULL,
  "groupDescription" TEXT,
  "groupType" VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table: menuItems
CREATE TABLE "menuItems" (
  "menuItemId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "mealType" VARCHAR NOT NULL,
  "menuItemName" VARCHAR NOT NULL,
  "price" NUMERIC NOT NULL,
  "isAvailable" BOOLEAN DEFAULT true,
  "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table: users (Customers)
CREATE TABLE "users" (
  "userId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "branchId" VARCHAR NOT NULL REFERENCES "branches"("branchId") ON DELETE CASCADE,
  "whatsAppGroupId" VARCHAR REFERENCES "whatsAppGroups"("whatsAppGroupId") ON DELETE SET NULL,
  "name" VARCHAR NOT NULL,
  "mobile" VARCHAR,
  "gender" VARCHAR,
  "roomNumber" VARCHAR,
  "joinedDate" DATE,
  "leftDate" DATE,
  "status" VARCHAR DEFAULT 'Active',
  "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table: orders
CREATE TABLE "orders" (
  "orderId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "branchId" VARCHAR NOT NULL REFERENCES "branches"("branchId") ON DELETE CASCADE,
  "userId" VARCHAR NOT NULL REFERENCES "users"("userId") ON DELETE CASCADE,
  "menuItemId" VARCHAR NOT NULL REFERENCES "menuItems"("menuItemId") ON DELETE CASCADE,
  "orderDate" DATE NOT NULL,
  "mealType" VARCHAR,
  "quantity" INTEGER DEFAULT 1,
  "unitPrice" NUMERIC NOT NULL,
  "totalPrice" NUMERIC NOT NULL,
  "deliveryStatus" VARCHAR,
  "orderStatus" VARCHAR,
  "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table: payments
CREATE TABLE "payments" (
  "paymentId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "userId" VARCHAR NOT NULL REFERENCES "users"("userId") ON DELETE CASCADE,
  "paymentMonth" VARCHAR,
  "totalAmount" NUMERIC NOT NULL,
  "paidAmount" NUMERIC DEFAULT 0,
  "balanceAmount" NUMERIC NOT NULL,
  "paymentMethod" VARCHAR,
  "paymentStatus" VARCHAR,
  "remarks" TEXT,
  "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table: notifications
CREATE TABLE "notifications" (
  "notificationId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "userId" VARCHAR NOT NULL REFERENCES "users"("userId") ON DELETE CASCADE,
  "title" VARCHAR NOT NULL,
  "message" TEXT,
  "status" VARCHAR DEFAULT 'Unread',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Table: monthlyBills
CREATE TABLE "monthlyBills" (
  "billId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "userId" VARCHAR NOT NULL REFERENCES "users"("userId") ON DELETE CASCADE,
  "billMonth" VARCHAR NOT NULL,
  "totalBreakfast" INTEGER DEFAULT 0,
  "totalLunch" INTEGER DEFAULT 0,
  "totalDinner" INTEGER DEFAULT 0,
  "totalMeals" INTEGER DEFAULT 0,
  "subtotal" NUMERIC DEFAULT 0,
  "discount" NUMERIC DEFAULT 0,
  "extraCharges" NUMERIC DEFAULT 0,
  "grandTotal" NUMERIC DEFAULT 0,
  "paymentStatus" VARCHAR DEFAULT 'Pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Table: billPayments
CREATE TABLE "billPayments" (
  "paymentId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "billId" VARCHAR NOT NULL REFERENCES "monthlyBills"("billId") ON DELETE CASCADE,
  "userId" VARCHAR NOT NULL REFERENCES "users"("userId") ON DELETE CASCADE,
  "receivedAmount" NUMERIC NOT NULL,
  "paymentMethod" VARCHAR,
  "transactionReference" VARCHAR,
  "paymentStatus" VARCHAR,
  "paymentDate" DATE NOT NULL,
  "remarks" TEXT,
  "deletedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Table: adminUsers
CREATE TABLE "adminUsers" (
  "adminId" VARCHAR PRIMARY KEY,
  "clientId" VARCHAR NOT NULL REFERENCES "clientsDetails"("clientId") ON DELETE CASCADE,
  "authUserId" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" VARCHAR UNIQUE NOT NULL,
  "name" VARCHAR NOT NULL,
  "role" VARCHAR DEFAULT 'Staff',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance (Scalability)
CREATE INDEX "idx_branches_clientId" ON "branches"("clientId");
CREATE INDEX "idx_whatsAppGroups_branchId" ON "whatsAppGroups"("branchId");
CREATE INDEX "idx_menuItems_clientId" ON "menuItems"("clientId");
CREATE INDEX "idx_users_branchId" ON "users"("branchId");
CREATE INDEX "idx_users_whatsAppGroupId" ON "users"("whatsAppGroupId");
CREATE INDEX "idx_orders_userId" ON "orders"("userId");
CREATE INDEX "idx_orders_menuItemId" ON "orders"("menuItemId");
CREATE INDEX "idx_payments_userId" ON "payments"("userId");

-- RLS Scaffolding (Policies)
-- Note: Replace true with appropriate auth.uid() checks when wiring up auth in production.
ALTER TABLE "clientsDetails" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsAppGroups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "menuItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "monthlyBills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "billPayments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "adminUsers" ENABLE ROW LEVEL SECURITY;

-- Allow all for seeding purposes (Disable in production)
CREATE POLICY "Enable ALL for service role" ON "clientsDetails" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "branches" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "whatsAppGroups" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "menuItems" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "users" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "orders" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "payments" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "notifications" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "monthlyBills" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "billPayments" USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL for service role" ON "adminUsers" USING (true) WITH CHECK (true);
