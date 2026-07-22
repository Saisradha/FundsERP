import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ERPFlow Digital Warehouse Database...');

  // Clean existing tables
  await prisma.challanItem.deleteMany({});
  await prisma.salesChallan.deleteMany({});
  await prisma.stockLog.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customerNote.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users for all 4 required roles
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Alexander Vance (Admin)',
      email: 'admin@erpflow.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Elena Rostova (Sales)',
      email: 'sales@erpflow.com',
      password: hashedPassword,
      role: Role.SALES,
    },
  });

  const warehouse = await prisma.user.create({
    data: {
      name: 'Marcus Brody (Warehouse)',
      email: 'warehouse@erpflow.com',
      password: hashedPassword,
      role: Role.WAREHOUSE,
    },
  });

  const accounts = await prisma.user.create({
    data: {
      name: 'Sophia Chen (Accounts)',
      email: 'accounts@erpflow.com',
      password: hashedPassword,
      role: Role.ACCOUNTS,
    },
  });

  console.log('✅ Created 4 User accounts with password: password123');

  // 2. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Apex Industrial Dynamics',
      mobile: '+1-555-0192',
      email: 'contact@apexind.com',
      businessName: 'Apex Robotics Corp',
      gstNumber: '29ABCDE1234F1Z5',
      customerType: CustomerType.DISTRIBUTOR,
      address: '742 Cybernetics Way, Tech City, CA',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 86400000 * 3),
      notes: {
        create: [
          {
            note: 'Discussed Q3 bulk order of titanium servos.',
            createdBy: sales.name,
          },
          {
            note: 'Updated credit line terms to Net-30.',
            createdBy: admin.name,
          },
        ],
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Aether Logistics Ltd',
      mobile: '+1-555-0843',
      email: 'procurement@aetherlog.io',
      businessName: 'Aether Cargo Systems',
      gstNumber: '27AAACA9876K1Z9',
      customerType: CustomerType.WHOLESALE,
      address: '108 Orbital Freight Terminal, Seattle, WA',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 86400000 * 7),
      notes: {
        create: [
          {
            note: 'Requested quote for 500 units of Quantum Sensors.',
            createdBy: sales.name,
          },
        ],
      },
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'NeoMatrix Labs',
      mobile: '+1-555-0311',
      email: 'info@neomatrixlabs.org',
      businessName: 'NeoMatrix Innovations',
      gstNumber: null,
      customerType: CustomerType.RETAIL,
      address: '42 Silicon Alley, Austin, TX',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 86400000 * 2),
      notes: {
        create: [
          {
            note: 'Initial inquiry regarding micro-controller kits.',
            createdBy: sales.name,
          },
        ],
      },
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: 'Hyperion Supply Chain',
      mobile: '+1-555-0922',
      email: 'sales@hyperion.com',
      businessName: 'Hyperion Global',
      gstNumber: '19ZZZZZ1111A1Z0',
      customerType: CustomerType.DISTRIBUTOR,
      address: '900 Logistics Blvd, Chicago, IL',
      status: CustomerStatus.INACTIVE,
      followUpDate: null,
    },
  });

  console.log('✅ Created 4 Customers with notes');

  // 3. Create Products
  const p1 = await prisma.product.create({
    data: {
      name: 'Quantum Micro-Core Engine',
      sku: 'SKU-QM-8080',
      category: 'Power Units',
      unitPrice: 1250.00,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Zone Alpha - Shelf 01',
    },
  });

  const p2 = await prisma.product.create({
    data: {
      name: 'Titanium Servo Actuator X',
      sku: 'SKU-TS-4040',
      category: 'Robotics',
      unitPrice: 420.00,
      currentStock: 120,
      minStockAlert: 25,
      location: 'Zone Alpha - Shelf 02',
    },
  });

  const p3 = await prisma.product.create({
    data: {
      name: 'Sub-Zero Cooling Module',
      sku: 'SKU-SZ-1010',
      category: 'Thermal',
      unitPrice: 890.00,
      currentStock: 8, // Low stock!
      minStockAlert: 15,
      location: 'Zone Beta - Shelf 03',
    },
  });

  const p4 = await prisma.product.create({
    data: {
      name: 'Neural Matrix Controller',
      sku: 'SKU-NM-9000',
      category: 'Electronics',
      unitPrice: 2100.00,
      currentStock: 0, // Out of stock!
      minStockAlert: 5,
      location: 'Zone Beta - Shelf 04',
    },
  });

  const p5 = await prisma.product.create({
    data: {
      name: 'Optical LiDAR Transceiver',
      sku: 'SKU-OL-5050',
      category: 'Sensors',
      unitPrice: 650.00,
      currentStock: 65,
      minStockAlert: 20,
      location: 'Zone Gamma - Shelf 05',
    },
  });

  console.log('✅ Created 5 Products with stock states');

  // 4. Create Stock Logs
  await prisma.stockLog.createMany({
    data: [
      {
        productId: p1.id,
        quantity: 50,
        type: MovementType.IN,
        reason: 'Initial Factory Receiving Batch #881',
        createdBy: warehouse.name,
      },
      {
        productId: p1.id,
        quantity: 5,
        type: MovementType.OUT,
        reason: 'Quality Control Sample Dispatch',
        createdBy: warehouse.name,
      },
      {
        productId: p2.id,
        quantity: 120,
        type: MovementType.IN,
        reason: 'Supplier Shipment Arrival',
        createdBy: warehouse.name,
      },
      {
        productId: p3.id,
        quantity: 10,
        type: MovementType.IN,
        reason: 'Restock Shipment',
        createdBy: warehouse.name,
      },
      {
        productId: p3.id,
        quantity: 2,
        type: MovementType.OUT,
        reason: 'Dispatched for Sales Order #CH-1001',
        createdBy: warehouse.name,
      },
    ],
  });

  console.log('✅ Created Stock Movement Logs');

  // 5. Create Sales Challans with Product Snapshots
  const challan1 = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0001',
      customerId: customer1.id,
      totalQuantity: 10,
      totalAmount: 12500.00,
      status: ChallanStatus.CONFIRMED,
      createdBy: sales.id,
      createdByName: sales.name,
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            sku: p1.sku,
            unitPrice: p1.unitPrice,
            quantity: 10,
            subtotal: 12500.00,
          },
        ],
      },
    },
  });

  const challan2 = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0002',
      customerId: customer2.id,
      totalQuantity: 5,
      totalAmount: 2100.00,
      status: ChallanStatus.DRAFT,
      createdBy: sales.id,
      createdByName: sales.name,
      items: {
        create: [
          {
            productId: p2.id,
            productName: p2.name,
            sku: p2.sku,
            unitPrice: p2.unitPrice,
            quantity: 5,
            subtotal: 2100.00,
          },
        ],
      },
    },
  });

  console.log('✅ Created Sales Challans CH-2026-0001 & CH-2026-0002');
  console.log('🚀 ERPFlow Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
