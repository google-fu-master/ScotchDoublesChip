// Venue management system
export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  amenities: string[];
  tableCount?: number;
  maxCapacity?: number;
  hourlyRate?: number;
  contactName?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  amenities?: string[];
  tableCount?: number;
  maxCapacity?: number;
  hourlyRate?: number;
  contactName?: string;
}

class VenueManager {
  private venues: Map<string, Venue> = new Map();

  constructor() {
    // Initialize with some sample venues
    this.initializeSampleVenues();
  }

  private initializeSampleVenues() {
    const sampleVenues: Venue[] = [
      {
        id: 'venue-1',
        name: 'Downtown Billiards',
        address: '123 Main Street',
        city: 'Austin',
        state: 'Texas',
        zipCode: '78701',
        country: 'USA',
        phone: '(512) 555-0123',
        email: 'info@downtownbilliards.com',
        website: 'https://downtownbilliards.com',
        description: 'Premier billiards hall in downtown Austin with 12 championship tables.',
        amenities: ['Bar', 'Restaurant', 'Parking', 'Live Music'],
        tableCount: 12,
        maxCapacity: 150,
        hourlyRate: 15,
        contactName: 'Mike Johnson',
        isVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'venue-2',
        name: 'Metro Sports Bar',
        address: '456 Oak Avenue',
        city: 'Dallas',
        state: 'Texas',
        zipCode: '75201',
        country: 'USA',
        phone: '(214) 555-0456',
        email: 'events@metrosports.com',
        amenities: ['Bar', 'Food Service', 'TV Screens', 'Parking'],
        tableCount: 8,
        maxCapacity: 100,
        contactName: 'Sarah Wilson',
        isVerified: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      },
      {
        id: 'venue-3',
        name: 'Riverside Recreation Center',
        address: '789 River Road',
        city: 'Houston',
        state: 'Texas',
        zipCode: '77001',
        country: 'USA',
        phone: '(713) 555-0789',
        description: 'Community center with recreational facilities.',
        amenities: ['Parking', 'Restrooms', 'Snack Bar'],
        tableCount: 6,
        maxCapacity: 80,
        isVerified: false,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
      }
    ];

    sampleVenues.forEach(venue => {
      this.venues.set(venue.id, venue);
    });
  }

  searchVenues(query: string, location?: string): Venue[] {
    const searchTerm = query.toLowerCase();
    const locationTerm = location?.toLowerCase();

    return Array.from(this.venues.values()).filter(venue => {
      const matchesName = venue.name.toLowerCase().includes(searchTerm);
      const matchesCity = venue.city.toLowerCase().includes(searchTerm);
      const matchesAddress = venue.address.toLowerCase().includes(searchTerm);
      
      const matchesQuery = matchesName || matchesCity || matchesAddress;
      
      if (locationTerm) {
        const matchesLocation = 
          venue.city.toLowerCase().includes(locationTerm) ||
          venue.state.toLowerCase().includes(locationTerm) ||
          venue.zipCode.includes(locationTerm);
        
        return matchesQuery && matchesLocation;
      }
      
      return matchesQuery;
    }).sort((a, b) => {
      // Prioritize verified venues
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      // Then sort by name
      return a.name.localeCompare(b.name);
    });
  }

  getVenueById(id: string): Venue | null {
    return this.venues.get(id) || null;
  }

  createVenue(data: CreateVenueData): Venue {
    const venue: Venue = {
      id: 'venue-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      phone: data.phone,
      email: data.email,
      website: data.website,
      description: data.description,
      amenities: data.amenities || [],
      tableCount: data.tableCount,
      maxCapacity: data.maxCapacity,
      hourlyRate: data.hourlyRate,
      contactName: data.contactName,
      isVerified: false, // New venues need verification
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.venues.set(venue.id, venue);
    console.log('🏢 New venue created:', venue.name, 'at', venue.city + ', ' + venue.state);
    
    return venue;
  }

  getAllVenues(): Venue[] {
    return Array.from(this.venues.values()).sort((a, b) => {
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  updateVenue(id: string, updates: Partial<CreateVenueData>): Venue | null {
    const venue = this.venues.get(id);
    if (!venue) return null;

    const updatedVenue: Venue = {
      ...venue,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.venues.set(id, updatedVenue);
    return updatedVenue;
  }

  deleteVenue(id: string): boolean {
    return this.venues.delete(id);
  }

  // Get venues by location for quick filtering
  getVenuesByLocation(city: string, state?: string): Venue[] {
    return Array.from(this.venues.values()).filter(venue => {
      const matchesCity = venue.city.toLowerCase() === city.toLowerCase();
      const matchesState = state ? venue.state.toLowerCase() === state.toLowerCase() : true;
      return matchesCity && matchesState;
    });
  }
}

// Singleton instance
export const venueManager = new VenueManager();