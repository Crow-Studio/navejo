// #!/usr/bin/env node

// /**
//  * Database Monitoring Script
//  * 
//  * This script provides comprehensive database monitoring and keep-alive functionality
//  * for Xata database to prevent connection timeouts and sleeping.
//  */

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient({
//   log: ['info', 'warn', 'error'],
// });

// class DatabaseMonitor {
//   constructor() {
//     this.startTime = Date.now();
//     this.isRunning = false;
//   }

//   async performHealthCheck() {
//     const checkStart = Date.now();
    
//     try {
//       // Test basic connectivity
//       await prisma.$queryRaw`SELECT 1 as health_check`;
      
//       // Get database statistics
//       const stats = await this.getDatabaseStats();
      
//       const checkEnd = Date.now();
//       const responseTime = checkEnd - checkStart;
      
//       return {
//         success: true,
//         responseTime,
//         stats,
//         timestamp: new Date().toISOString()
//       };
//     } catch (error) {
//       const checkEnd = Date.now();
//       const responseTime = checkEnd - checkStart;
      
//       return {
//         success: false,
//         responseTime,
//         error: error.message,
//         timestamp: new Date().toISOString()
//       };
//     }
//   }

//   async getDatabaseStats() {
//     try {
//       const [
//         userCount,
//         organizationCount,
//         workspaceCount,
//         bookmarkCount,
//         inviteCount
//       ] = await Promise.all([
//         prisma.user.count(),
//         prisma.organization.count(),
//         prisma.workspace.count(),
//         prisma.bookmark.count(),
//         prisma.invite.count()
//       ]);

//       return {
//         users: userCount,
//         organizations: organizationCount,
//         workspaces: workspaceCount,
//         bookmarks: bookmarkCount,
//         invites: inviteCount,
//         total: userCount + organizationCount + workspaceCount + bookmarkCount + inviteCount
//       };
//     } catch (error) {
//       console.warn('⚠️ Could not fetch detailed stats:', error.message);
//       return { error: 'Stats unavailable' };
//     }
//   }

//   async runKeepAlive() {
//     this.isRunning = true;
    
//     console.log('🚀 Starting Xata Database Keep-Alive Monitor');
//     console.log('⏰ Started at:', new Date().toISOString());
//     console.log('🌐 Database URL:', process.env.DATABASE_URL ? 'Connected to Xata' : 'No DATABASE_URL found');
//     console.log('📍 Region: eu-west-1');
//     console.log('─'.repeat(60));

//     try {
//       const healthCheck = await this.performHealthCheck();
      
//       if (healthCheck.success) {
//         console.log('✅ Database Health Check: PASSED');
//         console.log('⚡ Response Time:', `${healthCheck.responseTime}ms`);
//         console.log('📊 Database Statistics:');
        
//         if (healthCheck.stats.error) {
//           console.log('   ⚠️', healthCheck.stats.error);
//         } else {
//           console.log('   👥 Users:', healthCheck.stats.users);
//           console.log('   🏢 Organizations:', healthCheck.stats.organizations);
//           console.log('   💼 Workspaces:', healthCheck.stats.workspaces);
//           console.log('   🔖 Bookmarks:', healthCheck.stats.bookmarks);
//           console.log('   📧 Invites:', healthCheck.stats.invites);
//           console.log('   📈 Total Records:', healthCheck.stats.total);
//         }
        
//         console.log('🎉 Keep-alive successful! Database is active and responsive.');
        
//       } else {
//         console.log('❌ Database Health Check: FAILED');
//         console.log('⚡ Response Time:', `${healthCheck.responseTime}ms`);
//         console.log('🔍 Error:', healthCheck.error);
//         throw new Error(`Health check failed: ${healthCheck.error}`);
//       }
      
//     } catch (error) {
//       console.error('💥 Keep-alive operation failed:');
//       console.error('📝 Error Message:', error.message);
//       console.error('🔍 Stack Trace:', error.stack);
//       throw error;
      
//     } finally {
//       const endTime = Date.now();
//       const totalTime = endTime - this.startTime;
      
//       console.log('─'.repeat(60));
//       console.log('⏱️ Total Execution Time:', `${totalTime}ms`);
//       console.log('🏁 Completed at:', new Date().toISOString());
      
//       this.isRunning = false;
//     }
//   }

//   async cleanup() {
//     if (this.isRunning) {
//       console.log('🧹 Cleaning up database connections...');
//     }
    
//     try {
//       await prisma.$disconnect();
//       console.log('🔌 Database connection closed successfully');
//     } catch (error) {
//       console.error('⚠️ Error during cleanup:', error.message);
//     }
//   }
// }

// // Create monitor instance
// const monitor = new DatabaseMonitor();

// // Handle graceful shutdown
// const gracefulShutdown = async (signal) => {
//   console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);
//   await monitor.cleanup();
//   process.exit(0);
// };

// process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// // Handle uncaught exceptions
// process.on('uncaughtException', async (error) => {
//   console.error('💥 Uncaught Exception:', error);
//   await monitor.cleanup();
//   process.exit(1);
// });

// process.on('unhandledRejection', async (reason, promise) => {
//   console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
//   await monitor.cleanup();
//   process.exit(1);
// });

// // Run the keep-alive monitor
// monitor.runKeepAlive()
//   .then(() => {
//     console.log('✨ Keep-alive monitor completed successfully');
//     process.exit(0);
//   })
//   .catch(async (error) => {
//     console.error('💥 Keep-alive monitor failed:', error.message);
//     await monitor.cleanup();
//     process.exit(1);
//   });