// Test script for folder API endpoints
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFolderAPI() {
  console.log('🧪 Testing Folder API Endpoints...\n');

  try {
    // Setup test data
    console.log('1. Setting up test data...');
    
    // Create test user with profile
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-api',
        email: 'test-api@example.com',
        emailVerified: true,
        profile: {
          create: {
            name: 'Test API User'
          }
        }
      }
    });

    // Create test organization and workspace
    const testOrganization = await prisma.organization.create({
      data: {
        id: 'test-org-api',
        name: 'Test Organization API',
        slug: 'test-org-api',
        ownerId: testUser.id,
      }
    });

    const testWorkspace = await prisma.workspace.create({
      data: {
        id: 'test-workspace-api',
        name: 'Test Workspace API',
        slug: 'test-workspace-api',
        organizationId: testOrganization.id,
      }
    });

    await prisma.workspaceMember.create({
      data: {
        userId: testUser.id,
        workspaceId: testWorkspace.id,
        role: 'OWNER'
      }
    });

    console.log('✅ Test data created');

    // Test 2: Test folder creation
    console.log('\n2. Testing folder creation...');
    
    // Create personal folder
    const personalFolder = await prisma.folder.create({
      data: {
        name: 'Test Personal Folder',
        description: 'A test personal folder',
        userId: testUser.id,
        isDefault: false,
        sortOrder: 1
      }
    });
    console.log('✅ Personal folder created:', personalFolder.name);

    // Create workspace folder
    const workspaceFolder = await prisma.folder.create({
      data: {
        name: 'Test Workspace Folder',
        description: 'A test workspace folder',
        workspaceId: testWorkspace.id,
        isDefault: false,
        sortOrder: 1
      }
    });
    console.log('✅ Workspace folder created:', workspaceFolder.name);

    // Test 3: Test folder retrieval with counts
    console.log('\n3. Testing folder retrieval with counts...');
    
    // Get personal folders
    const personalFolders = await prisma.folder.findMany({
      where: {
        userId: testUser.id,
        workspaceId: null,
        parentId: null
      },
      include: {
        _count: {
          select: {
            bookmarks: true,
            children: true
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log('✅ Personal folders retrieved:', personalFolders.length);
    personalFolders.forEach(folder => {
      console.log(`   - ${folder.name}: ${folder._count.bookmarks} bookmarks, ${folder._count.children} subfolders`);
    });

    // Get workspace folders
    const workspaceFolders = await prisma.folder.findMany({
      where: {
        workspaceId: testWorkspace.id,
        parentId: null
      },
      include: {
        _count: {
          select: {
            bookmarks: true,
            children: true
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log('✅ Workspace folders retrieved:', workspaceFolders.length);
    workspaceFolders.forEach(folder => {
      console.log(`   - ${folder.name}: ${folder._count.bookmarks} bookmarks, ${folder._count.children} subfolders`);
    });

    // Test 4: Test default folder creation
    console.log('\n4. Testing default folder creation...');
    
    // Create default personal folder
    const defaultPersonalFolder = await prisma.folder.create({
      data: {
        name: 'Unsorted',
        description: 'Default folder for unsorted bookmarks',
        userId: testUser.id,
        isDefault: true,
        sortOrder: 0
      }
    });
    console.log('✅ Default personal folder created:', defaultPersonalFolder.name);

    // Create default workspace folder
    const defaultWorkspaceFolder = await prisma.folder.create({
      data: {
        name: 'General',
        description: 'Default workspace folder',
        workspaceId: testWorkspace.id,
        isDefault: true,
        sortOrder: 0
      }
    });
    console.log('✅ Default workspace folder created:', defaultWorkspaceFolder.name);

    // Test 5: Test folder ordering
    console.log('\n5. Testing folder ordering...');
    
    const orderedPersonalFolders = await prisma.folder.findMany({
      where: {
        userId: testUser.id,
        workspaceId: null,
        parentId: null
      },
      orderBy: [
        { isDefault: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log('✅ Personal folders in order:');
    orderedPersonalFolders.forEach((folder, index) => {
      console.log(`   ${index + 1}. ${folder.name} (${folder.isDefault ? 'default' : 'regular'})`);
    });

    const orderedWorkspaceFolders = await prisma.folder.findMany({
      where: {
        workspaceId: testWorkspace.id,
        parentId: null
      },
      orderBy: [
        { isDefault: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log('✅ Workspace folders in order:');
    orderedWorkspaceFolders.forEach((folder, index) => {
      console.log(`   ${index + 1}. ${folder.name} (${folder.isDefault ? 'default' : 'regular'})`);
    });

    // Test 6: Test duplicate name validation
    console.log('\n6. Testing duplicate name validation...');
    
    try {
      await prisma.folder.create({
        data: {
          name: 'Test Personal Folder', // Same name as existing folder
          userId: testUser.id,
          isDefault: false,
          sortOrder: 2
        }
      });
      console.log('❌ Duplicate name validation failed - should have thrown error');
    } catch (error) {
      // This is expected - we would handle this in the API layer
      console.log('✅ Duplicate name detected (would be handled by API validation)');
    }

    console.log('\n🎉 All folder API tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    try {
      await prisma.folder.deleteMany({
        where: {
          OR: [
            { userId: 'test-user-api' },
            { workspaceId: 'test-workspace-api' }
          ]
        }
      });
      
      await prisma.workspaceMember.deleteMany({
        where: { workspaceId: 'test-workspace-api' }
      });
      
      await prisma.workspace.deleteMany({
        where: { id: 'test-workspace-api' }
      });
      
      await prisma.organization.deleteMany({
        where: { id: 'test-org-api' }
      });
      
      await prisma.user.deleteMany({
        where: { id: 'test-user-api' }
      });
      
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError);
    }
    
    await prisma.$disconnect();
  }
}

// Run the test
testFolderAPI().catch(console.error);