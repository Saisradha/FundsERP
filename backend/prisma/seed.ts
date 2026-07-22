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

  // 1. Create Users for all 4 required roles with exact requested names
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'SaiSradha (Admin)',
      email: 'admin@erpflow.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Anvesh (Sales)',
      email: 'sales@erpflow.com',
      password: hashedPassword,
      role: Role.SALES,
    },
  });

  const warehouse = await prisma.user.create({
    data: {
      name: 'Varshith (Warehouse)',
      email: 'warehouse@erpflow.com',
      password: hashedPassword,
      role: Role.WAREHOUSE,
    },
  });

  const accounts = await prisma.user.create({
    data: {
      name: 'Jo (Accounts)',
      email: 'accounts@erpflow.com',
      password: hashedPassword,
      role: Role.ACCOUNTS,
    },
  });

  console.log('✅ Created 4 User accounts with password: password123');

  // 2. Create Customers with exact requested names
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Savithri',
      mobile: '+91-98765-43210',
      email: 'savithri@apexrobotics.in',
      businessName: 'Apex Robotics Corp',
      gstNumber: '36ABCDE1234F1Z5',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Cyber Towers, HITEC City, Hyderabad, TS',
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
      name: 'Anish',
      mobile: '+91-98123-45678',
      email: 'anish@aethercargo.in',
      businessName: 'Reliance Tech Infra',
      gstNumber: '27AAACA9876K1Z9',
      customerType: CustomerType.WHOLESALE,
      address: 'BKC Bandra, Mumbai, MH',
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
      name: 'Akshaya',
      mobile: '+91-97654-32109',
      email: 'akshaya@neomatrix.in',
      businessName: 'Mahindra Logistics',
      gstNumber: '29ZZZZZ1111A1Z0',
      customerType: CustomerType.RETAIL,
      address: 'Electronic City, Bengaluru, KA',
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
      name: 'Latha',
      mobile: '+91-96543-21098',
      email: 'latha@tnsdigital.in',
      businessName: 'TNS Digital Solutions',
      gstNumber: '33ABCDE5678G1Z2',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'OMR Tech Corridor, Chennai, TN',
      status: CustomerStatus.INACTIVE,
      followUpDate: null,
    },
  });

  console.log('✅ Created 4 Customers with requested names (Savithri, Anish, Akshaya, Latha)');

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
      currentStock: 8,
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
      currentStock: 10,
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
  await prisma.salesChallan.create({
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

  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0002',
      customerId: customer2.id,
      totalQuantity: 5,
      totalAmount: 2100.00,
      status: ChallanStatus.CONFIRMED,
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
