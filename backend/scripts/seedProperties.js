/**
 * Seed Script — Property Data
 * Run: node scripts/seedProperties.js
 * Inserts 15 sample properties into the local MongoDB database.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/estate-management';

// ── Property Schema (inline to avoid import chain) ───────────────────────────
const propertySchema = new mongoose.Schema(
  {
    title:         { type: String, required: true },
    location:      { type: String, required: true },
    price:         { type: Number, required: true },
    image:         { type: [String], required: true },
    beds:          { type: Number, required: true },
    baths:         { type: Number, required: true },
    sqft:          { type: Number, required: true },
    type:          { type: String, required: true },
    availability:  { type: String, required: true },
    description:   { type: String, required: true },
    amenities:     { type: Array,  required: true },
    phone:         { type: String, required: true },
    googleMapLink: { type: String, default: '' },
    status:        { type: String, enum: ['pending','active','rejected','expired'], default: 'active' },
    postedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '' },
    expiresAt:     { type: Date, default: null },
  },
  { timestamps: true }
);

const Property = mongoose.model('Property', propertySchema);

// ── Seed Data ─────────────────────────────────────────────────────────────────
const properties = [
  {
    title: 'Luxurious 3BHK Apartment in Bandra West',
    location: 'Bandra West, Mumbai, Maharashtra',
    price: 18500000,
    beds: 3, baths: 3, sqft: 1850,
    type: 'Apartment',
    availability: 'For Sale',
    phone: '+91 98200 11234',
    googleMapLink: 'https://maps.google.com/?q=Bandra+West+Mumbai',
    description: 'A stunning sea-facing apartment in the heart of Bandra West. Features a spacious living area with floor-to-ceiling windows, modular kitchen, and premium Italian marble flooring. Located in a gated society with 24/7 security and world-class amenities.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup', 'Clubhouse', 'Kids Play Area'],
    image: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    ],
  },
  {
    title: 'Modern 2BHK Flat in Koramangala',
    location: 'Koramangala 5th Block, Bengaluru, Karnataka',
    price: 8900000,
    beds: 2, baths: 2, sqft: 1100,
    type: 'Apartment',
    availability: 'For Sale',
    phone: '+91 98450 22345',
    googleMapLink: 'https://maps.google.com/?q=Koramangala+Bangalore',
    description: 'A beautifully designed 2BHK in one of Bengaluru\'s most sought-after localities. Walking distance to restaurants, cafes, and tech parks. The apartment features a semi-furnished interior with a premium modular kitchen and vitrified tile flooring.',
    amenities: ['Gym', 'Parking', 'Security', 'Power Backup', 'Lift', 'Rainwater Harvesting'],
    image: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
  },
  {
    title: 'Spacious 4BHK Villa in DLF Phase 5',
    location: 'DLF Phase 5, Gurugram, Haryana',
    price: 45000000,
    beds: 4, baths: 5, sqft: 4200,
    type: 'Villa',
    availability: 'For Sale',
    phone: '+91 98110 33456',
    googleMapLink: 'https://maps.google.com/?q=DLF+Phase+5+Gurgaon',
    description: 'An exquisite independent villa spread across three floors in the premium DLF Phase 5 township. Features a private garden, home theatre, modular kitchen, and servants\' quarters. Proximity to Golf Course Road and leading international schools.',
    amenities: ['Private Garden', 'Home Theatre', 'Servant Quarters', 'Swimming Pool', 'Parking (3 cars)', 'Security', 'Power Backup', 'Smart Home'],
    image: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
  },
  {
    title: 'Cozy 1BHK for Rent in Andheri East',
    location: 'Andheri East, Mumbai, Maharashtra',
    price: 32000,
    beds: 1, baths: 1, sqft: 620,
    type: 'Apartment',
    availability: 'For Rent',
    phone: '+91 98200 44567',
    googleMapLink: 'https://maps.google.com/?q=Andheri+East+Mumbai',
    description: 'A well-maintained 1BHK apartment ideal for working professionals. Conveniently located near Andheri metro station and MIDC business hub. The flat comes semi-furnished with a wardrobe, air conditioner, and geyser.',
    amenities: ['Parking', 'Security', 'Lift', 'Power Backup'],
    image: [
      'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
    ],
  },
  {
    title: 'Premium 3BHK in Jubilee Hills',
    location: 'Jubilee Hills, Hyderabad, Telangana',
    price: 12500000,
    beds: 3, baths: 3, sqft: 2100,
    type: 'Apartment',
    availability: 'For Sale',
    phone: '+91 98490 55678',
    googleMapLink: 'https://maps.google.com/?q=Jubilee+Hills+Hyderabad',
    description: 'A premium 3BHK apartment in the upscale Jubilee Hills neighbourhood. The property offers panoramic city views, a spacious balcony, and high-end finishes throughout. Walking distance to leading restaurants, malls, and hospitals.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Clubhouse', 'Security', 'Power Backup', 'Intercom'],
    image: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
  },
  {
    title: 'Independent House in Adyar',
    location: 'Adyar, Chennai, Tamil Nadu',
    price: 22000000,
    beds: 3, baths: 3, sqft: 2800,
    type: 'House',
    availability: 'For Sale',
    phone: '+91 98400 66789',
    googleMapLink: 'https://maps.google.com/?q=Adyar+Chennai',
    description: 'A well-built independent house on a 2400 sq.ft plot in the calm and green Adyar locality. Ground + 1 floor structure with a front garden, utility area, and ample parking. Close to Adyar river and premium educational institutions.',
    amenities: ['Garden', 'Parking (2 cars)', 'Security', 'Power Backup', 'Bore Well', 'Solar Panels'],
    image: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
    ],
  },
  {
    title: '2BHK Flat for Rent in HSR Layout',
    location: 'HSR Layout Sector 2, Bengaluru, Karnataka',
    price: 28000,
    beds: 2, baths: 2, sqft: 1050,
    type: 'Apartment',
    availability: 'For Rent',
    phone: '+91 98450 77890',
    googleMapLink: 'https://maps.google.com/?q=HSR+Layout+Bangalore',
    description: 'A fully furnished 2BHK in HSR Layout, perfect for tech professionals working in nearby Electronic City or Outer Ring Road. Comes with all appliances, wardrobe in both rooms, dining set, and sofa. Pet-friendly society.',
    amenities: ['Gym', 'Parking', 'Security', 'Power Backup', 'Lift', 'CCTV'],
    image: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
  },
  {
    title: 'Lavish Penthouse in Worli Sea Face',
    location: 'Worli Sea Face, Mumbai, Maharashtra',
    price: 95000000,
    beds: 5, baths: 6, sqft: 6500,
    type: 'Penthouse',
    availability: 'For Sale',
    phone: '+91 98200 88901',
    googleMapLink: 'https://maps.google.com/?q=Worli+Sea+Face+Mumbai',
    description: 'An ultra-luxurious duplex penthouse with breathtaking views of the Arabian Sea and Bandra-Worli Sea Link. Features a private rooftop terrace, home automation system, designer interiors, and a private pool. The pinnacle of Mumbai living.',
    amenities: ['Private Pool', 'Rooftop Terrace', 'Home Automation', 'Concierge', 'Valet Parking', 'Private Lift', 'Gym', 'Wine Cellar'],
    image: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    ],
  },
  {
    title: 'Affordable 2BHK in Wakad',
    location: 'Wakad, Pune, Maharashtra',
    price: 6800000,
    beds: 2, baths: 2, sqft: 950,
    type: 'Apartment',
    availability: 'For Sale',
    phone: '+91 98220 99012',
    googleMapLink: 'https://maps.google.com/?q=Wakad+Pune',
    description: 'A value-for-money 2BHK apartment in the rapidly developing Wakad area. Excellent connectivity to Hinjewadi IT Park via the expressway. The society has recently renovated amenities and is in a well-maintained condition.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup', 'Garden'],
    image: [
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80',
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
    ],
  },
  {
    title: 'Studio Apartment for Rent in Sector 62',
    location: 'Sector 62, Noida, Uttar Pradesh',
    price: 14000,
    beds: 1, baths: 1, sqft: 450,
    type: 'Studio',
    availability: 'For Rent',
    phone: '+91 98100 00123',
    googleMapLink: 'https://maps.google.com/?q=Sector+62+Noida',
    description: 'A compact and smart studio apartment perfect for students or single professionals. Located 5 minutes from Sector 62 Metro Station. Furnished with a bed, study table, wardrobe, microwave, and refrigerator. Maintenance included in rent.',
    amenities: ['Parking', 'Security', 'Lift', 'Wi-Fi Ready'],
    image: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&q=80',
    ],
  },
  {
    title: 'Elegant 3BHK Row House in Boat Club Road',
    location: 'Boat Club Road, Pune, Maharashtra',
    price: 28000000,
    beds: 3, baths: 4, sqft: 3200,
    type: 'Row House',
    availability: 'For Sale',
    phone: '+91 98220 11234',
    googleMapLink: 'https://maps.google.com/?q=Boat+Club+Road+Pune',
    description: 'A premium row house in one of Pune\'s most prestigious addresses. Features a private garden, double-height living room, chef\'s kitchen, and covered parking for two cars. Located within walking distance of top-tier schools and the Pune Golf Club.',
    amenities: ['Private Garden', 'Parking (2 cars)', 'Security', 'Intercom', 'Power Backup', 'Servant Room'],
    image: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    ],
  },
  {
    title: 'Commercial Office Space in Cyber City',
    location: 'Cyber City, Gurugram, Haryana',
    price: 75000,
    beds: 0, baths: 2, sqft: 1800,
    type: 'Commercial',
    availability: 'For Rent',
    phone: '+91 98110 22345',
    googleMapLink: 'https://maps.google.com/?q=Cyber+City+Gurgaon',
    description: 'A fully furnished plug-and-play office space in the heart of Cyber City, Gurugram. Includes 20 workstations, a conference room, a pantry, and high-speed internet. Ideal for startups and growing companies. RERA registered building.',
    amenities: ['High-Speed Internet', 'Conference Room', 'Pantry', 'Parking', 'Security', 'Power Backup', 'Reception'],
    image: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    ],
  },
  {
    title: '4BHK Builder Floor in Vasant Kunj',
    location: 'Vasant Kunj, New Delhi',
    price: 35000000,
    beds: 4, baths: 4, sqft: 3800,
    type: 'Builder Floor',
    availability: 'For Sale',
    phone: '+91 98100 33456',
    googleMapLink: 'https://maps.google.com/?q=Vasant+Kunj+Delhi',
    description: 'A spacious 4BHK builder floor on the ground + 1st floor of an independent structure in the leafy Vasant Kunj neighbourhood. Features a large terrace on the top floor, modular kitchen, wooden flooring in bedrooms, and separate servant quarters.',
    amenities: ['Terrace', 'Parking (2 cars)', 'Security', 'Servant Room', 'Power Backup', 'Garden'],
    image: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&q=80',
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
    ],
  },
  {
    title: 'Riverside Farmhouse in Alibaug',
    location: 'Alibaug, Raigad, Maharashtra',
    price: 55000000,
    beds: 5, baths: 5, sqft: 5000,
    type: 'Farmhouse',
    availability: 'For Sale',
    phone: '+91 98200 44567',
    googleMapLink: 'https://maps.google.com/?q=Alibaug+Maharashtra',
    description: 'A stunning weekend farmhouse just 2 hours from Mumbai, set amidst lush green surroundings. Features a 2-acre landscaped plot, private swimming pool, outdoor barbecue area, and a fully-equipped kitchen. Perfect for getaways or investment.',
    amenities: ['Private Pool', 'Garden (2 acres)', 'BBQ Area', 'Parking', 'Security', 'Borewell', 'Generator', 'Outdoor Dining'],
    image: [
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    ],
  },
  {
    title: '3BHK Apartment in Salt Lake City',
    location: 'Salt Lake City Sector V, Kolkata, West Bengal',
    price: 9500000,
    beds: 3, baths: 2, sqft: 1650,
    type: 'Apartment',
    availability: 'For Sale',
    phone: '+91 98310 55678',
    googleMapLink: 'https://maps.google.com/?q=Salt+Lake+Sector+V+Kolkata',
    description: 'A well-planned 3BHK apartment in the IT hub of Salt Lake Sector V. Recently renovated with fresh paint, new tiles, and updated fixtures. Close to leading IT companies, hospitals, malls, and the Nicco Park recreational area.',
    amenities: ['Parking', 'Security', 'Lift', 'Power Backup', 'Kids Play Area', 'CCTV'],
    image: [
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
  },
];

// ── Run ───────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log(`\n🔌 Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected\n');

    const existing = await Property.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️  Found ${existing} existing properties.`);
      console.log('   Pass --force to wipe and re-seed.\n');
      if (!process.argv.includes('--force')) {
        await mongoose.disconnect();
        return;
      }
      await Property.deleteMany({});
      console.log('🗑️  Cleared existing properties.\n');
    }

    const inserted = await Property.insertMany(properties);
    console.log(`🌱 Seeded ${inserted.length} properties successfully!\n`);
    inserted.forEach((p, i) => console.log(`   ${i + 1}. ${p.title} — ₹${p.price.toLocaleString('en-IN')}`));
    console.log('\n✅ Done! Visit http://localhost:5173 to see them.\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
