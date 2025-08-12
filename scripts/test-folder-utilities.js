// scripts/test-folder-utilities.js
// Simple test script to verify folder utilities are working

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFolderUtilities() {
  try {
    console.log('Testing folder utilities...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected');
    
    // Test basic folder query
    const folders = await prisma.folder.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            bookmarks: true,
            children: true
          }
        }
      }
    });
    
    console.log(`✓ Found ${folders.length} folders in database`);
    
    if (folders.length > 0) {
      console.log('Sample folder:', {
        id: folders[0].id,
        name: folders[0].name,
        isDefault: folders[0].isDefault,
        bookmarkCount: folders[0]._count.bookmarks
      });
    }
    
    console.log('✓ Folder utilities test completed successfully');
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testFolderUtilities();