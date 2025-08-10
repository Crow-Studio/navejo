// #!/usr/bin/env node

// /**
//  * Database Keep-Alive Script
//  * 
//  * This script performs a simple database query to keep the Xata database
//  * connection active and prevent it from going to sleep due to inactivity.
//  */

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient({
//   log: ['info', 'warn', 'error'],
// });

// async function keepDatabaseAlive() {
//   try {
//     console.log('🔄 Starting database keep-alive ping...');
//     console.log('⏰ Timestamp:', new Date().toISOString());
    
//     // Perform a simple query to keep the connection active
//     // This queries the User table and counts records (lightweight operation)
//     const userCount = await prisma.user.count();
    
//     console.log('✅ Database ping successful!');
//     console.log('📊 Current user count:', userCount);
//     console.log('🌐 Database URL:', process.env.DATABASE_URL ? 'Connected to Xata' : 'No DATABASE_URL found');
    
//     // Optional: Perform additional lightweight queries to ensure full connectivity
//     const organizationCount = await prisma.organization.count();
//     const workspaceCount = await prisma.workspace.count();
    
//     console.log('📈 Database statistics:');
//     console.log('  - Users:', userCount);
//     console.log('  - Organizations:', organizationCount);
//     console.log('  - Workspaces:', workspaceCount);
    
//     console.log('🎉 Database keep-alive completed successfully!');
    
//   } catch (error) {
//     console.error('❌ Database keep-alive failed:');
//     console.error('Error details:', error.message);
//     console.error('Stack trace:', error.stack);
    
//     // Exit with error code to indicate failure
//     process.exit(1);
//   } finally {
//     // Always disconnect from the database
//     await prisma.$disconnect();
//     console.log('🔌 Database connection closed');
//   }
// }

// // Handle process termination gracefully
// process.on('SIGINT', async () => {
//   console.log('🛑 Received SIGINT, closing database connection...');
//   await prisma.$disconnect();
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   console.log('🛑 Received SIGTERM, closing database connection...');
//   await prisma.$disconnect();
//   process.exit(0);
// });

// // Run the keep-alive function
// keepDatabaseAlive();