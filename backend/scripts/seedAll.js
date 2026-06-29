/**
 * Full Seed Script — Properties + Users
 * Run: node scripts/seedAll.js --force
 * Seeds 28 properties (Bengaluru-heavy) and 5 dummy users.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/buildestate';

// ── Schemas ───────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
    isEmailVerified: { type: Boolean, default: true },
    status:   { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  },
  { timestamps: true }
);

const propertySchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    location:     { type: String, required: true },
    price:        { type: Number, required: true },
    image:        { type: [String], required: true },
    beds:         { type: Number, required: true },
    baths:        { type: Number, required: true },
    sqft:         { type: Number, required: true },
    type:         { type: String, required: true },
    availability: { type: String, required: true },
    description:  { type: String, required: true },
    amenities:    { type: Array,  required: true },
    phone:        { type: String, required: true },
    googleMapLink:{ type: String, default: '' },
    status:       { type: String, enum: ['pending','active','rejected','expired'], default: 'active' },
    postedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '' },
    expiresAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

const User     = mongoose.model('User', userSchema);
const Property = mongoose.model('Property', propertySchema);

// ── Users ─────────────────────────────────────────────────────────────────────
const rawUsers = [
  { name: 'Rajesh Kumar',  email: 'rajesh.kumar@example.com',  password: 'Password@123', role: 'seller' },
  { name: 'Priya Sharma',  email: 'priya.sharma@example.com',  password: 'Password@123', role: 'seller' },
  { name: 'Arjun Mehta',   email: 'arjun.mehta@example.com',   password: 'Password@123', role: 'buyer'  },
  { name: 'Sneha Patel',   email: 'sneha.patel@example.com',   password: 'Password@123', role: 'buyer'  },
  { name: 'Vikram Singh',  email: 'vikram.singh@example.com',  password: 'Password@123', role: 'buyer'  },
];

// ── Properties ────────────────────────────────────────────────────────────────
const properties = [
  // ── Bengaluru (20) ──────────────────────────────────────────────────────────
  {
    title: 'Luxurious 3BHK in Koramangala 5th Block',
    location: 'Koramangala 5th Block, Bengaluru, Karnataka',
    price: 12500000,
    beds: 3, baths: 3, sqft: 1850,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Koramangala+5th+Block+Bangalore',
    description: 'A premium 3BHK apartment in the heart of Koramangala, one of Bengaluru\'s most vibrant neighbourhoods. Steps away from top restaurants, cafes, and tech offices. Features Italian marble flooring, modular kitchen, and a large balcony with garden views. Located in a gated society with 24/7 security.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup', 'Clubhouse', 'Kids Play Area', 'CCTV'],
    image: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
  },
  {
    title: 'Fully Furnished 2BHK for Rent in HSR Layout',
    location: 'HSR Layout Sector 2, Bengaluru, Karnataka',
    price: 30000,
    beds: 2, baths: 2, sqft: 1100,
    type: 'Apartment', availability: 'For Rent',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=HSR+Layout+Sector+2+Bangalore',
    description: 'A beautifully furnished 2BHK in HSR Layout, ideal for tech professionals on Outer Ring Road or Electronic City. Comes complete with sofa, beds, wardrobe, refrigerator, washing machine, and split ACs in both rooms. Pet-friendly society with excellent amenities.',
    amenities: ['Gym', 'Parking', 'Security', 'Power Backup', 'Lift', 'CCTV', 'Rainwater Harvesting'],
    image: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
  },
  {
    title: 'Spacious 4BHK Villa in Whitefield',
    location: 'Whitefield, Bengaluru, Karnataka',
    price: 38000000,
    beds: 4, baths: 5, sqft: 4500,
    type: 'Villa', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Whitefield+Bangalore',
    description: 'An exquisite independent villa in the prestigious Whitefield township, close to ITPL and major tech parks. Features a private garden, home theatre, modular kitchen, and servant quarters. Built with the highest quality materials with smart home integration throughout.',
    amenities: ['Private Garden', 'Home Theatre', 'Servant Quarters', 'Swimming Pool', 'Parking (3 cars)', 'Security', 'Power Backup', 'Smart Home', 'Solar Panels'],
    image: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
  },
  {
    title: 'Cozy Studio for Rent in Indiranagar',
    location: 'Indiranagar 100 Feet Road, Bengaluru, Karnataka',
    price: 18000,
    beds: 1, baths: 1, sqft: 450,
    type: 'Studio', availability: 'For Rent',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Indiranagar+100+Feet+Road+Bangalore',
    description: 'A smart and compact studio in the trendy Indiranagar locality. Walking distance from the metro station, top restaurants, and entertainment hubs. Furnished with a queen bed, wardrobe, kitchenette, and air conditioner. Ideal for young professionals.',
    amenities: ['Parking', 'Security', 'Lift', 'Power Backup', 'Wi-Fi Ready'],
    image: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&q=80',
    ],
  },
  {
    title: 'Premium 4BHK Apartment in Jayanagar',
    location: 'Jayanagar 4th Block, Bengaluru, Karnataka',
    price: 22000000,
    beds: 4, baths: 4, sqft: 3200,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Jayanagar+4th+Block+Bangalore',
    description: 'A spacious 4BHK in one of Bengaluru\'s most established residential areas. Jayanagar 4th Block offers tree-lined avenues, excellent schools, and superb connectivity. The apartment features teak wood flooring in all bedrooms, a large terrace, and a modern kitchen.',
    amenities: ['Terrace', 'Parking (2 cars)', 'Security', 'Power Backup', 'Lift', 'Children\'s Park', 'Community Hall'],
    image: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
  },
  {
    title: '2BHK Semi-Furnished Flat in BTM Layout',
    location: 'BTM Layout 2nd Stage, Bengaluru, Karnataka',
    price: 25000,
    beds: 2, baths: 2, sqft: 950,
    type: 'Apartment', availability: 'For Rent',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=BTM+Layout+2nd+Stage+Bangalore',
    description: 'A well-maintained 2BHK in the popular BTM Layout area. Equipped with wardrobes, modular kitchen with chimney, and an AC in the master bedroom. Close to Silk Board junction with easy access to Electronic City and Koramangala.',
    amenities: ['Parking', 'Security', 'Power Backup', 'Lift', 'CCTV'],
    image: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80',
      'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
    ],
  },
  {
    title: 'Elegant 3BHK in JP Nagar Phase 2',
    location: 'JP Nagar Phase 2, Bengaluru, Karnataka',
    price: 11000000,
    beds: 3, baths: 3, sqft: 1700,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=JP+Nagar+Phase+2+Bangalore',
    description: 'A thoughtfully designed 3BHK in the serene JP Nagar residential zone. Features a wide balcony overlooking a central garden, premium vitrified tile flooring, and a spacious modular kitchen. The society has beautifully landscaped grounds and a children\'s play area.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup', 'Clubhouse', 'Garden'],
    image: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
  },
  {
    title: 'Ultra-Luxury Penthouse near UB City',
    location: 'Vittal Mallya Road, Bengaluru, Karnataka',
    price: 75000000,
    beds: 5, baths: 6, sqft: 6200,
    type: 'Penthouse', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Vittal+Mallya+Road+Bangalore',
    description: 'A world-class duplex penthouse in the most prestigious address in Bengaluru, steps from UB City mall. Panoramic skyline views, a private rooftop terrace with a plunge pool, home automation, designer interiors by a renowned architect, and a private elevator. Unmatched luxury in the city.',
    amenities: ['Private Rooftop Pool', 'Home Automation', 'Concierge Service', 'Valet Parking', 'Private Lift', 'Wine Cellar', 'Gym', 'Spa'],
    image: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    ],
  },
  {
    title: 'Modern 2BHK with Lake View in Hebbal',
    location: 'Hebbal Lake View Road, Bengaluru, Karnataka',
    price: 9500000,
    beds: 2, baths: 2, sqft: 1250,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Hebbal+Lake+Bangalore',
    description: 'A stunning 2BHK apartment with direct views of Hebbal Lake from the living room and master bedroom. Thoughtfully designed with an open-plan kitchen, premium fittings, and floor-to-ceiling windows. Excellent connectivity to the airport and north Bengaluru tech corridors.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup', 'Jogging Track', 'Clubhouse'],
    image: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
    ],
  },
  {
    title: 'Ready-to-Move 1BHK in Marathahalli',
    location: 'Marathahalli Bridge, Bengaluru, Karnataka',
    price: 16000,
    beds: 1, baths: 1, sqft: 620,
    type: 'Apartment', availability: 'For Rent',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Marathahalli+Bangalore',
    description: 'A clean and well-ventilated 1BHK apartment near Marathahalli Bridge. Perfect for IT professionals working on Outer Ring Road. Semi-furnished with a wardrobe, AC, and geyser. Maintenance is only ₹800/month. Broker-free deal.',
    amenities: ['Parking', 'Security', 'Power Backup', 'Lift'],
    image: [
      'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
    ],
  },
  {
    title: '3BHK Apartment in Sarjapur Road',
    location: 'Sarjapur Road, Bengaluru, Karnataka',
    price: 10500000,
    beds: 3, baths: 3, sqft: 1600,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Sarjapur+Road+Bangalore',
    description: 'A value-for-money 3BHK in the rapidly growing Sarjapur Road corridor. Excellent investment opportunity with multiple upcoming metro stations and IT parks nearby. The apartment features a wide balcony, modular kitchen with breakfast counter, and vitrified tile flooring throughout.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup', 'Kids Play Area', 'Badminton Court'],
    image: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    ],
  },
  {
    title: 'Independent 4BHK Villa in Yelahanka',
    location: 'Yelahanka New Town, Bengaluru, Karnataka',
    price: 28000000,
    beds: 4, baths: 4, sqft: 3800,
    type: 'Villa', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Yelahanka+New+Town+Bangalore',
    description: 'A stunning independent villa in the quiet and well-planned Yelahanka New Town. Features a private garden, rooftop terrace, home office, and a double-height living room. Located just 15 minutes from Kempegowda International Airport on Bellary Road.',
    amenities: ['Private Garden', 'Rooftop Terrace', 'Home Office', 'Parking (2 cars)', 'Security', 'Power Backup', 'Borewell', 'Solar Panels'],
    image: [
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    ],
  },
  {
    title: 'Classic 2BHK in Malleshwaram',
    location: 'Malleshwaram 18th Cross, Bengaluru, Karnataka',
    price: 13500000,
    beds: 2, baths: 2, sqft: 1300,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Malleshwaram+18th+Cross+Bangalore',
    description: 'A charming 2BHK in the heritage neighbourhood of Malleshwaram. One of Bengaluru\'s oldest and most sought-after residential areas, known for its temples, park, and traditional market. Walking distance to Malleshwaram metro station and Sampige Road shopping district.',
    amenities: ['Parking', 'Security', 'Lift', 'Power Backup', 'Rainwater Harvesting'],
    image: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
  },
  {
    title: 'Spacious 3BHK Builder Floor in Rajajinagar',
    location: 'Rajajinagar 1st Block, Bengaluru, Karnataka',
    price: 16500000,
    beds: 3, baths: 3, sqft: 2200,
    type: 'Builder Floor', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Rajajinagar+1st+Block+Bangalore',
    description: 'A well-built 3BHK builder floor on the ground floor of a G+2 independent structure in prime Rajajinagar. Features a dedicated terrace, large rooms, covered parking for two cars, and a small garden in front. Walking distance to Rajajinagar metro station.',
    amenities: ['Terrace', 'Parking (2 cars)', 'Garden', 'Security', 'Power Backup', 'Intercom'],
    image: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&q=80',
    ],
  },
  {
    title: 'Row House for Sale in Bannerghatta Road',
    location: 'Bannerghatta Road, Bengaluru, Karnataka',
    price: 24000000,
    beds: 3, baths: 4, sqft: 2900,
    type: 'Row House', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Bannerghatta+Road+Bangalore',
    description: 'A premium row house in a gated township on Bannerghatta Road, known for its greenery and proximity to Bannerghatta National Park. Features a private front garden, utility room, and spacious living areas across two floors. Great schools and hospitals nearby.',
    amenities: ['Private Garden', 'Parking (2 cars)', 'Security', 'Clubhouse', 'Swimming Pool', 'Intercom', 'Power Backup'],
    image: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    ],
  },
  {
    title: 'Traditional 3BHK in Basavanagudi',
    location: 'Basavanagudi, Bengaluru, Karnataka',
    price: 18000000,
    beds: 3, baths: 3, sqft: 2400,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Basavanagudi+Bangalore',
    description: 'A generously proportioned 3BHK in the historic and leafy Basavanagudi neighbourhood. Tall ceilings, classic design, and a calm environment make this an ideal family home. Walking distance from the iconic Bull Temple, Gandhi Bazaar, and National College ground.',
    amenities: ['Parking', 'Security', 'Power Backup', 'Garden', 'Lift'],
    image: [
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    ],
  },
  {
    title: 'Modern 4BHK near Kempegowda Airport',
    location: 'Devanahalli, Bengaluru, Karnataka',
    price: 16000000,
    beds: 4, baths: 4, sqft: 2800,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Devanahalli+Bangalore',
    description: 'A brand-new 4BHK apartment in the booming Devanahalli township, just 5 minutes from Kempegowda International Airport. An excellent investment opportunity with the upcoming Aerospace SEZ and IT parks driving rapid appreciation. Comes with a large terrace and premium fittings.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup', 'Clubhouse', 'Jogging Track', 'Tennis Court'],
    image: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
    ],
  },
  {
    title: 'Farmhouse Retreat on Bengaluru Outskirts',
    location: 'Kanakapura Road, Bengaluru, Karnataka',
    price: 42000000,
    beds: 5, baths: 5, sqft: 4800,
    type: 'Farmhouse', availability: 'For Sale',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Kanakapura+Road+Bangalore',
    description: 'A gorgeous 1.5-acre weekend farmhouse on Kanakapura Road, 40 minutes from the city. Surrounded by mango orchards and lush greenery, this property features an infinity pool, outdoor barbecue, fire pit seating, and a fully equipped modern kitchen. An unmatched retreat or luxury investment.',
    amenities: ['Infinity Pool', 'Garden (1.5 acres)', 'BBQ Area', 'Fire Pit', 'Parking (4 cars)', 'Security', 'Borewell', 'Generator', 'Orchard'],
    image: [
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    ],
  },
  {
    title: '1BHK for Rent in Bellandur',
    location: 'Bellandur, Bengaluru, Karnataka',
    price: 17000,
    beds: 1, baths: 1, sqft: 650,
    type: 'Apartment', availability: 'For Rent',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Bellandur+Bangalore',
    description: 'A tidy and well-maintained 1BHK in Bellandur, ideal for professionals working on Outer Ring Road or in the Salarpuria and Prestige tech parks. Comes with a wardrobe, AC, and parking. Society has 24/7 security and power backup. Easy access to Marathahalli and Sarjapur Road.',
    amenities: ['Parking', 'Security', 'Power Backup', 'Lift', 'CCTV'],
    image: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&q=80',
    ],
  },
  {
    title: 'Office Space for Rent in Electronic City',
    location: 'Electronic City Phase 1, Bengaluru, Karnataka',
    price: 65000,
    beds: 0, baths: 2, sqft: 1600,
    type: 'Commercial', availability: 'For Rent',
    phone: '+91 80 4412 3456',
    googleMapLink: 'https://maps.google.com/?q=Electronic+City+Phase+1+Bangalore',
    description: 'A fully fitted plug-and-play office space in Electronic City Phase 1, the heart of Bengaluru\'s IT sector. Includes 18 workstations, a large conference room with AV equipment, pantry, and high-speed fibre internet. RERA registered building with dedicated parking. Ideal for startups and growing tech teams.',
    amenities: ['High-Speed Internet', 'Conference Room', 'Pantry', 'Parking', 'Security', 'Power Backup', 'Reception', 'CCTV'],
    image: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    ],
  },

  // ── Other Metro Cities (8) ───────────────────────────────────────────────────
  {
    title: 'Sea-View 3BHK in Bandra West',
    location: 'Bandra West, Mumbai, Maharashtra',
    price: 19500000,
    beds: 3, baths: 3, sqft: 1900,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 98200 11234',
    googleMapLink: 'https://maps.google.com/?q=Bandra+West+Mumbai',
    description: 'A stunning sea-facing apartment in Bandra West with partial Arabian Sea views from the living room balcony. Features floor-to-ceiling windows, a modular kitchen, and premium Italian marble flooring. Located in a prestigious gated society with world-class amenities and 24/7 concierge service.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup', 'Clubhouse', 'Concierge', 'Kids Play Area'],
    image: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    ],
  },
  {
    title: 'Lavish 5BHK Penthouse in Worli',
    location: 'Worli Sea Face, Mumbai, Maharashtra',
    price: 95000000,
    beds: 5, baths: 6, sqft: 6500,
    type: 'Penthouse', availability: 'For Sale',
    phone: '+91 98200 44567',
    googleMapLink: 'https://maps.google.com/?q=Worli+Sea+Face+Mumbai',
    description: 'An ultra-luxurious duplex penthouse with breathtaking views of the Arabian Sea and the Bandra-Worli Sea Link. Features a private rooftop terrace, home automation, designer interiors, and a private pool. The absolute pinnacle of Mumbai living.',
    amenities: ['Private Pool', 'Rooftop Terrace', 'Home Automation', 'Concierge', 'Valet Parking', 'Private Lift', 'Gym', 'Wine Cellar'],
    image: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    ],
  },
  {
    title: '4BHK Builder Floor in Vasant Vihar',
    location: 'Vasant Vihar, New Delhi',
    price: 38000000,
    beds: 4, baths: 4, sqft: 4000,
    type: 'Builder Floor', availability: 'For Sale',
    phone: '+91 98100 33456',
    googleMapLink: 'https://maps.google.com/?q=Vasant+Vihar+Delhi',
    description: 'A premium 4BHK builder floor in the highly coveted Vasant Vihar locality of South Delhi. Features wooden flooring in all bedrooms, a spacious terrace, modular kitchen, and covered parking for two cars. Walking distance to reputed schools, embassies, and South Delhi restaurants.',
    amenities: ['Terrace', 'Parking (2 cars)', 'Security', 'Servant Room', 'Power Backup', 'Garden'],
    image: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&q=80',
    ],
  },
  {
    title: 'Premium 3BHK in Jubilee Hills',
    location: 'Jubilee Hills, Hyderabad, Telangana',
    price: 13000000,
    beds: 3, baths: 3, sqft: 2200,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 98490 55678',
    googleMapLink: 'https://maps.google.com/?q=Jubilee+Hills+Hyderabad',
    description: 'A premium 3BHK in the upscale Jubilee Hills neighbourhood of Hyderabad. Panoramic city views, a spacious balcony, and high-end finishes throughout. Walking distance to leading restaurants, malls, Film Nagar, and hospitals.',
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Clubhouse', 'Security', 'Power Backup', 'Intercom'],
    image: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
  },
  {
    title: 'Elegant 3BHK Row House in Boat Club Road',
    location: 'Boat Club Road, Pune, Maharashtra',
    price: 29000000,
    beds: 3, baths: 4, sqft: 3200,
    type: 'Row House', availability: 'For Sale',
    phone: '+91 98220 11234',
    googleMapLink: 'https://maps.google.com/?q=Boat+Club+Road+Pune',
    description: 'A premium row house on one of Pune\'s most prestigious addresses. Features a private garden, double-height living room, chef\'s kitchen, and covered parking for two cars. Walking distance from top-tier schools and the Pune Golf Club.',
    amenities: ['Private Garden', 'Parking (2 cars)', 'Security', 'Intercom', 'Power Backup', 'Servant Room'],
    image: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    ],
  },
  {
    title: 'Independent House in Adyar',
    location: 'Adyar, Chennai, Tamil Nadu',
    price: 23000000,
    beds: 3, baths: 3, sqft: 2800,
    type: 'House', availability: 'For Sale',
    phone: '+91 98400 66789',
    googleMapLink: 'https://maps.google.com/?q=Adyar+Chennai',
    description: 'A well-built independent house on a 2400 sq.ft plot in the calm and green Adyar locality of Chennai. Ground + 1 floor structure with a front garden, utility area, and ample parking. Close to Adyar river, premium educational institutions, and reputed hospitals.',
    amenities: ['Garden', 'Parking (2 cars)', 'Security', 'Power Backup', 'Borewell', 'Solar Panels'],
    image: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
    ],
  },
  {
    title: '2BHK Apartment for Rent in Andheri East',
    location: 'Andheri East, Mumbai, Maharashtra',
    price: 34000,
    beds: 2, baths: 2, sqft: 780,
    type: 'Apartment', availability: 'For Rent',
    phone: '+91 98200 44567',
    googleMapLink: 'https://maps.google.com/?q=Andheri+East+Mumbai',
    description: 'A well-maintained 2BHK ideal for working professionals or small families. Conveniently located near Andheri metro station and the MIDC business hub. Comes semi-furnished with wardrobes, ACs, and a modular kitchen. Society has 24/7 security and backup power.',
    amenities: ['Parking', 'Security', 'Lift', 'Power Backup', 'CCTV'],
    image: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    ],
  },
  {
    title: '3BHK Apartment in Salt Lake Sector V',
    location: 'Salt Lake Sector V, Kolkata, West Bengal',
    price: 9800000,
    beds: 3, baths: 2, sqft: 1700,
    type: 'Apartment', availability: 'For Sale',
    phone: '+91 98310 55678',
    googleMapLink: 'https://maps.google.com/?q=Salt+Lake+Sector+V+Kolkata',
    description: 'A well-planned 3BHK in the IT hub of Salt Lake Sector V, Kolkata. Recently renovated with fresh paint, new tiles, and updated fixtures. Close to leading IT companies, hospitals, malls, and the Nicco Park recreational area. Excellent long-term investment.',
    amenities: ['Parking', 'Security', 'Lift', 'Power Backup', 'Kids Play Area', 'CCTV'],
    image: [
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    ],
  },
];

// ── Run ───────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log(`\n🔌 Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected\n');

    const force = process.argv.includes('--force');

    // ── Users ──────────────────────────────────────────────────────────────────
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !force) {
      console.log(`ℹ️  Found ${existingUsers} existing users — skipping users. Use --force to re-seed.\n`);
    } else {
      if (force) {
        await User.deleteMany({ role: { $in: ['buyer', 'seller'] } });
        console.log('🗑️  Cleared existing buyer/seller users.\n');
      }
      const usersToInsert = await Promise.all(
        rawUsers.map(async (u) => ({
          ...u,
          password: await bcrypt.hash(u.password, 10),
        }))
      );
      const insertedUsers = await User.insertMany(usersToInsert);
      console.log(`👥 Seeded ${insertedUsers.length} users:\n`);
      insertedUsers.forEach((u) =>
        console.log(`   • ${u.name} <${u.email}> [${u.role}] — password: Password@123`)
      );
      console.log();
    }

    // ── Properties ─────────────────────────────────────────────────────────────
    const existingProps = await Property.countDocuments();
    if (existingProps > 0 && !force) {
      console.log(`ℹ️  Found ${existingProps} existing properties — skipping. Use --force to re-seed.\n`);
    } else {
      if (force) {
        await Property.deleteMany({});
        console.log('🗑️  Cleared existing properties.\n');
      }
      const inserted = await Property.insertMany(properties);
      console.log(`🏠 Seeded ${inserted.length} properties:\n`);
      inserted.forEach((p, i) =>
        console.log(`   ${String(i + 1).padStart(2, '0')}. ${p.title} — ₹${p.price.toLocaleString('en-IN')} (${p.availability})`)
      );
    }

    console.log('\n✅ Done! Visit http://localhost:5173 to see your listings.\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
