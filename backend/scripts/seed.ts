import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dotenv from 'dotenv';
import {
  categories,
  products,
  optionGroups,
  options,
  users,
  addresses,
} from '../src/db/schema.js';
import { hashPassword } from '../src/utils/security.js';

dotenv.config();

const { Pool } = pg;

const directUrl: string = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL || '';

if (!directUrl) {
  console.error('Error: DATABASE_URL_DIRECT or DATABASE_URL is not set.');
  process.exit(1);
}

function maskUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    return `${u.protocol}//${u.username ? '***:***@' : ''}${u.hostname}${u.port ? `:${u.port}` : ''}${u.pathname}`;
  } catch {
    return '***';
  }
}

// TODO: Real catalogue prices are not decided yet. Replace placeholder base_price values (in integer paise) and Large delta values once finalised.
export const CATALOGUE_PRICES: Record<string, { basePrice: number; largeDelta: number }> = {
  'prod-classic-scrunchie': { basePrice: 24900, largeDelta: 5000 },
  'prod-bow-scrunchie': { basePrice: 29900, largeDelta: 5000 },
  'prod-everyday-makeup-pouch': { basePrice: 69900, largeDelta: 10000 },
  'prod-mini-pouch': { basePrice: 49900, largeDelta: 10000 },
  'prod-soft-eyewear-sleeve': { basePrice: 39900, largeDelta: 10000 },
  'prod-padded-laptop-sleeve': { basePrice: 129900, largeDelta: 20000 },
  'prod-classic-hair-bow': { basePrice: 34900, largeDelta: 0 },
  'prod-large-hair-bow': { basePrice: 39900, largeDelta: 0 },
};

// 4 Categories from section 7
export const SEED_CATEGORIES = [
  {
    id: 'cat-scrunchies',
    name: 'Scrunchies',
    slug: 'scrunchies',
    description: 'Generously gathered fabric hair ties in pure cotton, corduroy, and linen.',
    image: 'https://res.cloudinary.com/iip3povd/image/upload/v1792752531/Scrunchie_Category_tile.png',
    sortOrder: 1,
    published: true,
  },
  {
    id: 'cat-pouches',
    name: 'Pouches',
    slug: 'pouches',
    description: 'Everyday zippered makeup and utility pouches.',
    image: null,
    sortOrder: 2,
    published: true,
  },
  {
    id: 'cat-sleeves',
    name: 'Sleeves',
    slug: 'sleeves',
    description: 'Protective quilted sleeves for glasses, laptops, and essentials.',
    image: null,
    sortOrder: 3,
    published: true,
  },
  {
    id: 'cat-hair-accessories',
    name: 'Hair Accessories',
    slug: 'hair-accessories',
    description: 'Handcrafted fabric hair bows and handcrafted hair accessories.',
    image: null,
    sortOrder: 4,
    published: true,
  },
];

// 8 Products from section 7
// TODO: Replace short placeholder product descriptions with finalized marketing copy.
export const SEED_PRODUCTS = [
  {
    id: 'prod-classic-scrunchie',
    name: 'Classic Scrunchie',
    slug: 'classic-scrunchie',
    description: 'Handcrafted classic fabric scrunchie designed for everyday comfort.',
    categoryId: 'cat-scrunchies',
    basePrice: CATALOGUE_PRICES['prod-classic-scrunchie'].basePrice,
    currency: 'INR',
    images: [],
    published: true,
    hasSize: true,
  },
  {
    id: 'prod-bow-scrunchie',
    name: 'Bow Scrunchie',
    slug: 'bow-scrunchie',
    description: 'Delicately tied bow scrunchie handmade from premium fabric.',
    categoryId: 'cat-scrunchies',
    basePrice: CATALOGUE_PRICES['prod-bow-scrunchie'].basePrice,
    currency: 'INR',
    images: [],
    published: true,
    hasSize: true,
  },
  {
    id: 'prod-everyday-makeup-pouch',
    name: 'Everyday Makeup Pouch',
    slug: 'everyday-makeup-pouch',
    description: 'Spacious zippered cosmetic pouch for everyday essentials.',
    categoryId: 'cat-pouches',
    basePrice: CATALOGUE_PRICES['prod-everyday-makeup-pouch'].basePrice,
    currency: 'INR',
    images: [],
    published: true,
    hasSize: true,
  },
  {
    id: 'prod-mini-pouch',
    name: 'Mini Pouch',
    slug: 'mini-pouch',
    description: 'Compact fabric zipper pouch for coins, cards, and small accessories.',
    categoryId: 'cat-pouches',
    basePrice: CATALOGUE_PRICES['prod-mini-pouch'].basePrice,
    currency: 'INR',
    images: [],
    published: true,
    hasSize: true,
  },
  {
    id: 'prod-soft-eyewear-sleeve',
    name: 'Soft Eyewear Sleeve',
    slug: 'soft-eyewear-sleeve',
    description: 'Cushioned fabric sleeve designed to protect glasses and sunglasses.',
    categoryId: 'cat-sleeves',
    basePrice: CATALOGUE_PRICES['prod-soft-eyewear-sleeve'].basePrice,
    currency: 'INR',
    images: [],
    published: true,
    hasSize: true,
  },
  {
    id: 'prod-padded-laptop-sleeve',
    name: 'Padded Laptop Sleeve',
    slug: 'padded-laptop-sleeve',
    description: 'Padded quilted sleeve for laptops with secure closure.',
    categoryId: 'cat-sleeves',
    basePrice: CATALOGUE_PRICES['prod-padded-laptop-sleeve'].basePrice,
    currency: 'INR',
    images: [],
    published: true,
    hasSize: true,
  },
  {
    id: 'prod-classic-hair-bow',
    name: 'Classic Hair Bow',
    slug: 'classic-hair-bow',
    description: 'Timeless fabric hair bow with sturdy alligator clip attachment.',
    categoryId: 'cat-hair-accessories',
    basePrice: CATALOGUE_PRICES['prod-classic-hair-bow'].basePrice,
    currency: 'INR',
    images: [],
    published: true,
    hasSize: false,
  },
  {
    id: 'prod-large-hair-bow',
    name: 'Large Hair Bow',
    slug: 'large-hair-bow',
    description: 'Statement oversized fabric hair bow handcrafted with premium fabrics.',
    categoryId: 'cat-hair-accessories',
    basePrice: CATALOGUE_PRICES['prod-large-hair-bow'].basePrice,
    currency: 'INR',
    images: [],
    published: true,
    hasSize: false,
  },
];

// Standard option definitions per Section 7
const FABRIC_OPTIONS = [
  { id: 'opt-floral-cotton', label: 'Floral Cotton', colourValue: null, priceDelta: 0, sortOrder: 1 },
  { id: 'opt-corduroy', label: 'Corduroy', colourValue: null, priceDelta: 0, sortOrder: 2 },
  { id: 'opt-leopard-print', label: 'Leopard Print', colourValue: null, priceDelta: 0, sortOrder: 3 },
];

const COLOUR_OPTIONS = [
  { id: 'opt-blush-pink', label: 'Blush Pink', colourValue: '#E9C9CF', priceDelta: 0, sortOrder: 1 },
  { id: 'opt-dusty-blue', label: 'Dusty Blue', colourValue: '#7186A1', priceDelta: 0, sortOrder: 2 },
  { id: 'opt-sage-green', label: 'Sage Green', colourValue: '#A3AD8B', priceDelta: 0, sortOrder: 3 },
];

function getSizeOptions(productId: string) {
  const largeDelta = CATALOGUE_PRICES[productId]?.largeDelta ?? 0;
  return [
    { id: 'opt-regular', label: 'Regular', colourValue: null, priceDelta: 0, sortOrder: 1 },
    { id: 'opt-large', label: 'Large', colourValue: null, priceDelta: largeDelta, sortOrder: 2 },
  ];
}

async function seed() {
  const devPassword = process.env.SEED_DEV_USER_PASSWORD;
  if (!devPassword || devPassword.trim() === '') {
    throw new Error(
      'SEED_DEV_USER_PASSWORD environment variable is required and cannot be empty. Please define it in backend/.env'
    );
  }

  console.log(`Connecting to database for seeding: ${maskUrl(directUrl)}`);

  const maxRetries = 3;
  let pool: pg.Pool | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      pool = new Pool({
        connectionString: directUrl,
        ssl: directUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 15000,
        max: 2,
      });

      const client = await pool.connect();
      client.release();
      break;
    } catch (err: any) {
      if (pool) {
        await pool.end().catch(() => {});
        pool = null;
      }
      console.warn(`Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        console.log('Retrying in 2 seconds...');
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        console.error('All connection attempts failed.');
        process.exit(1);
      }
    }
  }

  if (!pool) {
    console.error('Failed to initialize database connection pool.');
    process.exit(1);
  }

  const db = drizzle(pool);

  try {
    await db.transaction(async (tx) => {
      console.log('Starting seed transaction...');

      // 1. Seed Categories (idempotent upsert on id)
      console.log(`Upserting ${SEED_CATEGORIES.length} categories...`);
      for (const cat of SEED_CATEGORIES) {
        await tx
          .insert(categories)
          .values(cat)
          .onConflictDoUpdate({
            target: categories.id,
            set: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              image: cat.image,
              sortOrder: cat.sortOrder,
              published: cat.published,
              updatedAt: new Date(),
            },
          });
      }

      // 2. Seed Products (idempotent upsert on id)
      console.log(`Upserting ${SEED_PRODUCTS.length} products...`);
      for (const prod of SEED_PRODUCTS) {
        const { hasSize: _, ...prodValues } = prod;
        await tx
          .insert(products)
          .values(prodValues)
          .onConflictDoUpdate({
            target: products.id,
            set: {
              name: prodValues.name,
              slug: prodValues.slug,
              description: prodValues.description,
              categoryId: prodValues.categoryId,
              basePrice: prodValues.basePrice,
              currency: prodValues.currency,
              images: prodValues.images,
              published: prodValues.published,
              updatedAt: new Date(),
            },
          });
      }

      // 3. Seed Option Groups and Options per product
      let totalGroups = 0;
      let totalOptions = 0;

      for (const prod of SEED_PRODUCTS) {
        // Group 1: Fabric (all 8 products, affects_image = true, type = swatch, sort_order = 1)
        const fabricGroup = {
          productId: prod.id,
          id: 'fabric',
          name: 'Fabric',
          type: 'swatch',
          affectsImage: true,
          required: true,
          sortOrder: 1,
          defaultOptionId: 'opt-floral-cotton',
        };
        await tx
          .insert(optionGroups)
          .values(fabricGroup)
          .onConflictDoUpdate({
            target: [optionGroups.productId, optionGroups.id],
            set: {
              name: fabricGroup.name,
              type: fabricGroup.type,
              affectsImage: fabricGroup.affectsImage,
              required: fabricGroup.required,
              sortOrder: fabricGroup.sortOrder,
              defaultOptionId: fabricGroup.defaultOptionId,
            },
          });
        totalGroups++;

        for (const opt of FABRIC_OPTIONS) {
          await tx
            .insert(options)
            .values({
              productId: prod.id,
              groupId: 'fabric',
              id: opt.id,
              label: opt.label,
              colourValue: opt.colourValue,
              priceDelta: opt.priceDelta,
              sortOrder: opt.sortOrder,
              available: true,
            })
            .onConflictDoUpdate({
              target: [options.productId, options.groupId, options.id],
              set: {
                label: opt.label,
                colourValue: opt.colourValue,
                priceDelta: opt.priceDelta,
                sortOrder: opt.sortOrder,
                available: true,
              },
            });
          totalOptions++;
        }

        // Group 2: Colour (all 8 products, affects_image = true, type = colour, sort_order = 2)
        const colourGroup = {
          productId: prod.id,
          id: 'colour',
          name: 'Colour',
          type: 'colour',
          affectsImage: true,
          required: true,
          sortOrder: 2,
          defaultOptionId: 'opt-blush-pink',
        };
        await tx
          .insert(optionGroups)
          .values(colourGroup)
          .onConflictDoUpdate({
            target: [optionGroups.productId, optionGroups.id],
            set: {
              name: colourGroup.name,
              type: colourGroup.type,
              affectsImage: colourGroup.affectsImage,
              required: colourGroup.required,
              sortOrder: colourGroup.sortOrder,
              defaultOptionId: colourGroup.defaultOptionId,
            },
          });
        totalGroups++;

        for (const opt of COLOUR_OPTIONS) {
          await tx
            .insert(options)
            .values({
              productId: prod.id,
              groupId: 'colour',
              id: opt.id,
              label: opt.label,
              colourValue: opt.colourValue,
              priceDelta: opt.priceDelta,
              sortOrder: opt.sortOrder,
              available: true,
            })
            .onConflictDoUpdate({
              target: [options.productId, options.groupId, options.id],
              set: {
                label: opt.label,
                colourValue: opt.colourValue,
                priceDelta: opt.priceDelta,
                sortOrder: opt.sortOrder,
                available: true,
              },
            });
          totalOptions++;
        }

        // Group 3: Size (only for 6 non-hair-bow products, affects_image = false, type = chips, sort_order = 3)
        if (prod.hasSize) {
          const sizeGroup = {
            productId: prod.id,
            id: 'size',
            name: 'Size',
            type: 'chips',
            affectsImage: false,
            required: true,
            sortOrder: 3,
            defaultOptionId: 'opt-regular',
          };
          await tx
            .insert(optionGroups)
            .values(sizeGroup)
            .onConflictDoUpdate({
              target: [optionGroups.productId, optionGroups.id],
              set: {
                name: sizeGroup.name,
                type: sizeGroup.type,
                affectsImage: sizeGroup.affectsImage,
                required: sizeGroup.required,
                sortOrder: sizeGroup.sortOrder,
                defaultOptionId: sizeGroup.defaultOptionId,
              },
            });
          totalGroups++;

          const sizeOptions = getSizeOptions(prod.id);
          for (const opt of sizeOptions) {
            await tx
              .insert(options)
              .values({
                productId: prod.id,
                groupId: 'size',
                id: opt.id,
                label: opt.label,
                colourValue: opt.colourValue,
                priceDelta: opt.priceDelta,
                sortOrder: opt.sortOrder,
                available: true,
              })
              .onConflictDoUpdate({
                target: [options.productId, options.groupId, options.id],
                set: {
                  label: opt.label,
                  colourValue: opt.colourValue,
                  priceDelta: opt.priceDelta,
                  sortOrder: opt.sortOrder,
                  available: true,
                },
              });
            totalOptions++;
          }
        }
      }
      console.log(`Upserted ${totalGroups} option groups and ${totalOptions} options across all products.`);

      // 4. Dev test customer and address
      const devPasswordHash = await hashPassword(devPassword);

      const devUser = {
        id: 'usr-dev-customer-1',
        name: 'Anvi Sharma',
        email: 'anvi@example.com',
        passwordHash: devPasswordHash,
        role: 'customer',
      };

      await tx
        .insert(users)
        .values(devUser)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: devUser.name,
            email: devUser.email,
            passwordHash: devPasswordHash,
            role: devUser.role,
            updatedAt: new Date(),
          },
        });

      const devAddress = {
        id: 'addr-dev-default-1',
        userId: devUser.id,
        fullName: 'Anvi Sharma',
        phone: '9876543210',
        line1: 'Flat 302, Rosewood Apartments',
        line2: '14th Cross, Indiranagar',
        landmark: 'Near Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        isDefault: true,
      };

      await tx
        .insert(addresses)
        .values(devAddress)
        .onConflictDoUpdate({
          target: addresses.id,
          set: {
            fullName: devAddress.fullName,
            phone: devAddress.phone,
            line1: devAddress.line1,
            line2: devAddress.line2,
            landmark: devAddress.landmark,
            city: devAddress.city,
            state: devAddress.state,
            pincode: devAddress.pincode,
            isDefault: devAddress.isDefault,
            updatedAt: new Date(),
          },
        });

      console.log('Dev customer and address seeded successfully.');
      console.log('Transaction committed successfully.');
    });

    console.log('Seed completed successfully.');
  } catch (err: any) {
    console.error('Seed transaction failed, rolled back:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

seed().catch((err) => {
  console.error('Unexpected seed error:', err);
  process.exit(1);
});
