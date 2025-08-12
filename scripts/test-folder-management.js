// scripts/test-folder-management.js
// Comprehensive test for folder management utilities

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFolderManagement() {
  try {
    console.log('Testing folder management utilities...');
    
    await prisma.$connect();
    console.log('✓ Database connected');
    
    // Test 1: Check if we can query folders with counts
    console.log('\n1. Testing folder queries with counts...');
    const foldersWithCounts = await prisma.folder.findMany({
      include: {
        _count: {
          select: {
            bookmarks: true,
            children: true
          }
        }
      },
      take: 3
    });
    console.log(`✓ Successfully queried ${foldersWithCounts.length} folders with counts`);
    
    // Test 2: Check workspace member queries (for permission validation)
    console.log('\n2. Testing workspace member queries...');
    const workspaceMembers = await prisma.workspaceMember.findMany({
      take: 3,
      include: {
        workspace: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    console.log(`✓ Successfully queried ${workspaceMembers.length} workspace members`);
    
    // Test 3: Check folder hierarchy queries
    console.log('\n3. Testing folder hierarchy queries...');
    const topLevelFolders = await prisma.folder.findMany({
      where: {
        parentId: null
      },
      include: {
        children: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 3
    });
    console.log(`✓ Successfully queried ${topLevelFolders.length} top-level folders`);
    
    // Test 4: Check default folder queries
    console.log('\n4. Testing default folder queries...');
    const defaultFolders = await prisma.folder.findMany({
      where: {
        isDefault: true
      },
      take: 3
    });
    console.log(`✓ Successfully queried ${defaultFolders.length} default folders`);
    
    // Test 5: Test folder ordering
    console.log('\n5. Testing folder ordering...');
    const orderedFolders = await prisma.folder.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      take: 5
    });
    console.log(`✓ Successfully ordered ${orderedFolders.length} folders`);
    
    console.log('\n✓ All folder management utility tests passed!');
    
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testFolderManagement();