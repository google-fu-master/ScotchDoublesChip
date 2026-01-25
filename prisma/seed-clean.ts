import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create sample players
  const players = await Promise.all([
    prisma.player.create({
      data: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '(555) 123-4567',
        ageGroup: 'AGES_21_PLUS',
        birthdayMonth: 6,
        birthdayDay: 15,
        fargoRating: 650,
        apaEightBallRank: '6',
        apaNineBallRank: '7'
      }
    }),
    
    prisma.player.create({
      data: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '(555) 987-6543',
        ageGroup: 'AGES_18_20',
        birthdayMonth: 3,
        birthdayDay: 22,
        fargoRating: 580
      }
    }),
    
    prisma.player.create({
      data: {
        email: 'mike.wilson@example.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        ageGroup: 'UNDER_18',
        birthdayMonth: 11,
        birthdayDay: 8,
        fargoRating: 450
      }
    }),
    
    prisma.player.create({
      data: {
        email: 'sarah.champion@example.com',
        firstName: 'Sarah',
        lastName: 'Champion',
        phone: '(555) 456-7890',
        ageGroup: 'AGES_21_PLUS',
        birthdayMonth: 4,
        birthdayDay: 12,
        fargoRating: 750,
        apaEightBallRank: '7',
        apaNineBallRank: '8'
      }
    })
  ]);
  
  console.log(`✅ Created ${players.length} players`);
  
  // Create sample venues
  const venues = await Promise.all([
    prisma.venue.create({
      data: {
        name: 'Downtown Billiards',
        address: '123 Main St, Downtown',
        phone: '(555) 555-0123',
        email: 'info@downtownbilliards.com',
        ageRestriction: 'MINORS_ALLOWED_LIMITED_HOURS',
        minorStartTime: '12:00',
        minorEndTime: '20:00',
        ages18To20StartTime: '12:00',
        ages18To20EndTime: '23:00',
        useVenueAgeForAllTables: true,
        totalTables: 12,
        ownerId: players[0].id
      }
    }),
    
    prisma.venue.create({
      data: {
        name: 'Metro Sports Bar',
        address: '456 Oak Ave, Metro District',
        phone: '(555) 555-0456',
        ageRestriction: 'NO_MINORS_18_PLUS_ALL_DAY',
        useVenueAgeForAllTables: false,
        totalTables: 8
      }
    }),
    
    prisma.venue.create({
      data: {
        name: 'Championship Billiards',
        address: '789 Championship Dr, Tournament City',
        phone: '(555) POOL-123',
        email: 'info@championshipbilliards.com',
        ageRestriction: 'NO_MINORS_18_PLUS_ALL_DAY',
        totalTables: 16,
        useVenueAgeForAllTables: true,
        ownerId: players[3].id
      }
    }),
    
    prisma.venue.create({
      data: {
        name: 'Family Pool Center',
        address: '321 Family Ave, Hometown',
        ageRestriction: 'MINORS_ALLOWED_ALL_DAY',
        totalTables: 6,
        useVenueAgeForAllTables: true
      }
    })
  ]);
  
  console.log(`✅ Created ${venues.length} venues`);
  
  // Create some tables for venues
  const tablePromises = [];
  
  // Downtown Billiards tables
  for (let i = 0; i < 10; i++) {
    tablePromises.push(
      prisma.table.create({
        data: {
          venueId: venues[0].id,
          number: (i + 1).toString(),
          ageRestriction: 'UNDER_18'
        }
      })
    );
  }
  
  // Downtown Billiards special tables
  tablePromises.push(
    prisma.table.create({
      data: {
        venueId: venues[0].id,
        number: '11',
        ageRestriction: 'AGES_21_PLUS'
      }
    }),
    
    prisma.table.create({
      data: {
        venueId: venues[0].id,
        number: 'Bar Table',
        ageRestriction: 'AGES_21_PLUS'
      }
    })
  );
  
  const tables = await Promise.all(tablePromises);
  console.log(`✅ Created ${tables.length} tables`);
  
  // Create a sample tournament
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Winter Championship 2025',
      description: 'Annual winter tournament with comprehensive age restrictions',
      startDate: new Date('2025-02-15T18:00:00'),
      venueId: venues[0].id,
      playerType: 'SCOTCH_DOUBLES',
      gameType: 'EIGHT_BALL',
      tournamentType: 'CHIP',
      raceToWins: 1,
      estimatedEntrants: 32,
      playersPerTable: 4,
      defaultChipsPerPlayer: 200,
      bracketOrdering: 'RANDOM_DRAW',
      rules: 'BCA',
      ratingSystem: 'FARGO_RATE',
      showSkillLevels: true,
      entryFee: 50.00,
      adminFee: 10.00,
      payoutType: 'PLACES',
      payoutPlacesSetting: 'TOP_4',
      access: 'PUBLIC',
      autoAcceptScores: false,
      allowNotifications: true
    }
  });
  
  console.log(`✅ Created tournament: ${tournament.name}`);
  
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   • ${players.length} players with different age groups`);
  console.log(`   • ${venues.length} venues with various age restrictions`);
  console.log(`   • ${tables.length} tables with mixed age policies`);
  console.log(`   • 1 tournament with comprehensive settings`);
  console.log('\n🚀 Your age restriction system is now connected to a live database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });