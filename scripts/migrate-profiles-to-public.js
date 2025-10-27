#!/usr/bin/env node

/**
 * Migration script to set existing profiles to public by default
 * This ensures the Communities feature has content to display
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateProfilesToPublic() {
  try {
    console.log('🔄 Starting profile migration to public...');
    
    // Update all existing profiles to be public by default
    const result = await prisma.profile.updateMany({
      where: {
        isPublic: false
      },
      data: {
        isPublic: true
      }
    });
    
    console.log(`✅ Updated ${result.count} profiles to public`);
    
    // Create profiles for users who don't have one yet (public by default)
    const usersWithoutProfiles = await prisma.user.findMany({
      where: {
        profile: null
      },
      select: {
        id: true,
        email: true
      }
    });
    
    if (usersWithoutProfiles.length > 0) {
      console.log(`📝 Creating profiles for ${usersWithoutProfiles.length} users...`);
      
      for (const user of usersWithoutProfiles) {
        await prisma.profile.create({
          data: {
            userId: user.id,
            name: user.email.split('@')[0],
            isPublic: true
          }
        });
      }
      
      console.log(`✅ Created ${usersWithoutProfiles.length} new public profiles`);
    }
    
    // Show final stats
    const totalProfiles = await prisma.profile.count();
    const publicProfiles = await prisma.profile.count({
      where: { isPublic: true }
    });
    
    console.log(`\n📊 Final Stats:`);
    console.log(`   Total profiles: ${totalProfiles}`);
    console.log(`   Public profiles: ${publicProfiles}`);
    console.log(`   Private profiles: ${totalProfiles - publicProfiles}`);
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateProfilesToPublic();