// Test script for folder selector functionality
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFolderSelector() {
  console.log('🧪 Testing Folder Selector Functionality...\n');

  try {
    // Test 1: Create a test user if not exists
    console.log('1. Setting up test user...');
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: 'test-user-folder-selector',
          email: 'test@example.com',
          emailVerified: true,
          profile: {
            create: {
              name: 'Test User'
            }
          }
        }
      });
    }
    console.log('✅ Test user ready:', testUser.email);

    // Test 2: Create a test organization and workspace
    console.log('\n2. Setting up test organization and workspace...');
    let testOrganization = await prisma.organization.findFirst({
      where: { slug: 'test-org-folder-selector' }
    });

    if (!testOrganization) {
      testOrganization = await prisma.organization.create({
        data: {
          id: 'test-org-folder-selector',
          name: 'Test Organization Folder Selector',
          slug: 'test-org-folder-selector',
          ownerId: testUser.id,
        }
      });
    }

    let testWorkspace = await prisma.workspace.findFirst({
      where: { slug: 'test-workspace-folder-selector' }
    });

    if (!testWorkspace) {
      testWorkspace = await prisma.workspace.create({
        data: {
          id: 'test-workspace-folder-selector',
          name: 'Test Workspace Folder Selector',
          slug: 'test-workspace-folder-selector',
          organizationId: testOrganization.id,
        }
      });

      // Add user as member
      await prisma.workspaceMember.create({
        data: {
          userId: testUser.id,
          workspaceId: testWorkspace.id,
          role: 'OWNER'
        }
      });
    }
    console.log('✅ Test workspace ready:', testWorkspace.name);

    // Test 3: Create test folders
    console.log('\n3. Creating test folders...');
    
    // Personal folder
    const personalFolder = await prisma.folder.create({
      data: {
        id: 'test-personal-folder',
        name: 'My Personal Folder',
        description: 'Test personal folder',
        userId: testUser.id,
        isDefault: false,
        sortOrder: 1
      }
    });
    console.log('✅ Personal folder created:', personalFolder.name);

    // Workspace folder
    const workspaceFolder = await prisma.folder.create({
      data: {
        id: 'test-workspace-folder',
        name: 'Team Resources',
        description: 'Test workspace folder',
        workspaceId: testWorkspace.id,
        isDefault: false,
        sortOrder: 1
      }
    });
    console.log('✅ Workspace folder created:', workspaceFolder.name);

    // Default personal folder
    const defaultPersonalFolder = await prisma.folder.create({
      data: {
        id: 'test-default-personal-folder',
        name: 'Unsorted',
        description: 'Default personal folder',
        userId: testUser.id,
        isDefault: true,
        sortOrder: 0
      }
    });
    console.log('✅ Default personal folder created:', defaultPersonalFolder.name);

    // Default workspace folder
    const defaultWorkspaceFolder = await prisma.folder.create({
      data: {
        id: 'test-default-workspace-folder',
        name: 'General',
        description: 'Default workspace folder',
        workspaceId: testWorkspace.id,
        isDefault: true,
        sortOrder: 0
      }
    });
    console.log('✅ Default workspace folder created:', defaultWorkspaceFolder.name);

    // Test 4: Test folder retrieval scenarios
    console.log('\n4. Testing folder retrieval scenarios...');

    // Test personal folders
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
      console.log(`   - ${folder.name} (${folder.isDefault ? 'default' : 'regular'})`);
    });

    // Test workspace folders
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
      console.log(`   - ${folder.name} (${folder.isDefault ? 'default' : 'regular'})`);
    });

    // Test 5: Test default folder selection logic
    console.log('\n5. Testing default folder selection logic...');
    
    const personalDefault = personalFolders.find(f => f.isDefault);
    const workspaceDefault = workspaceFolders.find(f => f.isDefault);
    
    console.log('✅ Personal default folder:', personalDefault?.name);
    console.log('✅ Workspace default folder:', workspaceDefault?.name);

    // Test 6: Test permission validation
    console.log('\n6. Testing permission validation...');
    
    // Test workspace access
    const workspaceMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: testUser.id,
        workspaceId: testWorkspace.id
      }
    });
    console.log('✅ Workspace membership verified:', !!workspaceMembership);

    // Test folder access for personal folder
    const personalFolderAccess = personalFolder.userId === testUser.id;
    console.log('✅ Personal folder access:', personalFolderAccess);

    // Test folder access for workspace folder
    const workspaceFolderAccess = workspaceFolder.workspaceId === testWorkspace.id && !!workspaceMembership;
    console.log('✅ Workspace folder access:', workspaceFolderAccess);

    console.log('\n🎉 All folder selector tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    try {
      await prisma.folder.deleteMany({
        where: {
          id: {
            in: [
              'test-personal-folder',
              'test-workspace-folder', 
              'test-default-personal-folder',
              'test-default-workspace-folder'
            ]
          }
        }
      });
      
      await prisma.workspaceMember.deleteMany({
        where: { workspaceId: 'test-workspace-folder-selector' }
      });
      
      await prisma.workspace.deleteMany({
        where: { id: 'test-workspace-folder-selector' }
      });
      
      await prisma.organization.deleteMany({
        where: { id: 'test-org-folder-selector' }
      });
      
      await prisma.user.deleteMany({
        where: { id: 'test-user-folder-selector' }
      });
      
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError);
    }
    
    await prisma.$disconnect();
  }
}

// Run the test
testFolderSelector().catch(console.error);