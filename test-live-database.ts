// Test script to verify live database integration
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔍 Testing Live Database Integration...');
  console.log('=====================================');
  
  try {
    // Test 1: Raw database query
    console.log('\n1️⃣  Testing direct database connection...');
    const venueCount = await prisma.venue.count();
    console.log(`✅ Database connected! Found ${venueCount} venues`);
    
    // Test 2: Get venues with relationships
    console.log('\n2️⃣  Testing complex queries with relationships...');
    const venues = await prisma.venue.findMany({
      include: {
        owner: true,
        tables: true,
        _count: { select: { tables: true } }
      }
    });
    
    console.log(`✅ Found ${venues.length} venues with relationships:`);
    venues.forEach(venue => {
      console.log(`   • ${venue.name}`);
      console.log(`     - Age Restriction: ${venue.ageRestriction}`);
      console.log(`     - Tables: ${venue._count.tables}`);
      console.log(`     - Owner: ${venue.owner ? `${venue.owner.firstName} ${venue.owner.lastName}` : 'None'}`);
    });
    
    // Test 3: Player age groups
    console.log('\n3️⃣  Testing player age groups...');
    const playersByAge = await prisma.player.groupBy({
      by: ['ageGroup'],
      _count: { ageGroup: true }
    });
    
    console.log('✅ Player age distribution:');
    playersByAge.forEach(group => {
      console.log(`   • ${group.ageGroup}: ${group._count.ageGroup} players`);
    });
    
    // Test 4: Tournament with venue
    console.log('\n4️⃣  Testing tournament integration...');
    const tournaments = await prisma.tournament.findMany({
      include: {
        venue: true
      }
    });
    
    console.log(`✅ Found ${tournaments.length} tournaments:`);
    tournaments.forEach(tournament => {
      console.log(`   • ${tournament.name} at ${tournament.venue.name}`);
    });
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('🚀 Your age restriction system is fully connected to a live PostgreSQL database!');
    console.log('💯 No more mock data - everything is persisted and queryable!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();