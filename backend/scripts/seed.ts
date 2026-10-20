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

const directUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

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

// Catalogue mock data sourced from lib/api/mock/data.ts
// Prices converted from rupees to integer paise (* 100)
const SEED_CATEGORIES = [
  {
    id: 'cat-scrunchies',
    slug: 'scrunchies',
    name: 'Scrunchies',
    description: 'Generously gathered fabric hair ties in pure cotton, corduroy, and linen.',
    image: '/images/productimages/scrunchies-category.jpg',
    sortOrder: 1,
    published: true,
  },
  {
    id: 'cat-pouches',
    slug: 'pouches',
    name: 'Pouches',
    description: 'Everyday zippered makeup and utility pouches.',
    image: '/images/productimages/pouches-category.jpg',
    sortOrder: 2,
    published: true,
  },
  {
    id: 'cat-sleeves',
    slug: 'sleeves',
    name: 'Sleeves',
    description: 'Protective quilted sleeves for glasses, laptops, and essentials.',
    image: '/images/productimages/sleeves-category.jpg',
    sortOrder: 3,
    published: true,
  },
];

const SEED_PRODUCTS = [
  {
    id: 'prod-scrunchie',
    slug: 'classic-scrunchie',
    name: 'Classic Scrunchie',
    description:
      'A softly gathered fabric scrunchie designed to hold hair comfortably without pulling. Cut, sewn and finished by hand with durable elastic.',
    categoryId: 'cat-scrunchies',
    basePrice: 24900, // 249 INR -> 24900 paise
    currency: 'INR',
    published: true,
    images: [
      { url: '/images/productimages/classic-scrunchie-1.jpg', alt: 'Classic Scrunchie in floral print', order: 1 },
      { url: '/images/placeholders/scrunchie-2.svg', alt: 'Classic Scrunchie fabric texture detail (Placeholder)', order: 2 },
    ],
    optionGroups: [
      {
        id: 'group-fabric',
        name: 'Fabric Choice',
        type: 'swatch',
        required: true,
        sortOrder: 1,
        defaultOptionId: 'opt-floral',
        options: [
          {
            id: 'opt-floral',
            label: 'Floral',
            priceDelta: 0,
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-floral.svg',
            previewImageUrl: '/images/productimages/classic-scrunchie-1.jpg',
            detail: 'Soft printed cotton',
            sortOrder: 1,
          },
          {
            id: 'opt-corduroy',
            label: 'Corduroy',
            priceDelta: 5000, // 50 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-corduroy.svg',
            previewImageUrl: '/images/placeholders/scrunchie-2.svg',
            detail: 'Fine-wale washed corduroy',
            sortOrder: 2,
          },
          {
            id: 'opt-check',
            label: 'Check',
            priceDelta: 3000, // 30 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-check.svg',
            detail: 'Yarn-dyed check weave',
            sortOrder: 3,
          },
          {
            id: 'opt-linen',
            label: 'Linen',
            priceDelta: 4000, // 40 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-linen.svg',
            detail: 'Breathable pure linen',
            sortOrder: 4,
          },
        ],
      },
      {
        id: 'group-size',
        name: 'Size',
        type: 'chips',
        required: true,
        sortOrder: 2,
        defaultOptionId: 'opt-size-regular',
        options: [
          {
            id: 'opt-size-regular',
            label: 'Regular',
            priceDelta: 0,
            available: true,
            detail: 'Approx 9 cm diameter',
            sortOrder: 1,
          },
          {
            id: 'opt-size-large',
            label: 'Large',
            priceDelta: 5000, // 50 INR
            available: true,
            detail: 'Approx 11 cm diameter',
            sortOrder: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'prod-pouch',
    slug: 'makeup-pouch',
    name: 'Everyday Makeup Pouch',
    description:
      'Structured pouch with wide base and zip opening. Roomy enough for cosmetics, skincare, and travel essentials.',
    categoryId: 'cat-pouches',
    basePrice: 59900, // 599 INR -> 59900 paise
    currency: 'INR',
    published: true,
    images: [
      { url: '/images/productimages/makeup-pouch-1.jpg', alt: 'Everyday Makeup Pouch in floral print', order: 1 },
      { url: '/images/placeholders/pouch-2.svg', alt: 'Everyday Makeup Pouch open interior (Placeholder)', order: 2 },
    ],
    optionGroups: [
      {
        id: 'group-fabric',
        name: 'Fabric Choice',
        type: 'swatch',
        required: true,
        sortOrder: 1,
        defaultOptionId: 'opt-floral',
        options: [
          {
            id: 'opt-floral',
            label: 'Floral',
            priceDelta: 0,
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-floral.svg',
            previewImageUrl: '/images/productimages/makeup-pouch-1.jpg',
            detail: 'Soft printed cotton',
            sortOrder: 1,
          },
          {
            id: 'opt-corduroy',
            label: 'Corduroy',
            priceDelta: 7000, // 70 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-corduroy.svg',
            sortOrder: 2,
          },
          {
            id: 'opt-check',
            label: 'Check',
            priceDelta: 4000, // 40 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-check.svg',
            sortOrder: 3,
          },
          {
            id: 'opt-linen',
            label: 'Linen',
            priceDelta: 6000, // 60 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-linen.svg',
            sortOrder: 4,
          },
        ],
      },
      {
        id: 'group-size',
        name: 'Size',
        type: 'chips',
        required: true,
        sortOrder: 2,
        defaultOptionId: 'opt-size-regular',
        options: [
          {
            id: 'opt-size-regular',
            label: 'Regular',
            priceDelta: 0,
            available: true,
            detail: '18 x 12 x 7 cm',
            sortOrder: 1,
          },
          {
            id: 'opt-size-large',
            label: 'Large',
            priceDelta: 10000, // 100 INR
            available: true,
            detail: '24 x 16 x 9 cm',
            sortOrder: 2,
          },
        ],
      },
      {
        id: 'group-zipper',
        name: 'Zipper Finish',
        type: 'colour',
        required: true,
        sortOrder: 3,
        defaultOptionId: 'opt-zip-brass',
        options: [
          {
            id: 'opt-zip-brass',
            label: 'Antique Brass',
            priceDelta: 0,
            available: true,
            colourValue: '#B8860B',
            sortOrder: 1,
          },
          {
            id: 'opt-zip-rose',
            label: 'Rose Gold',
            priceDelta: 3000, // 30 INR
            available: true,
            colourValue: '#B76E79',
            sortOrder: 2,
          },
          {
            id: 'opt-zip-gunmetal',
            label: 'Gunmetal',
            priceDelta: 2000, // 20 INR
            available: true,
            colourValue: '#2A2A2A',
            sortOrder: 3,
          },
        ],
      },
    ],
  },
  {
    id: 'prod-eyewear',
    slug: 'eyewear-sleeve',
    name: 'Soft Eyewear Sleeve',
    description: 'Slim cushioned fabric case for glasses or sunglasses with a secure top closure.',
    categoryId: 'cat-sleeves',
    basePrice: 39900, // 399 INR -> 39900 paise
    currency: 'INR',
    published: true,
    images: [
      { url: '/images/productimages/eyewear-sleeve-1.jpg', alt: 'Soft Eyewear Sleeve in floral print', order: 1 },
    ],
    optionGroups: [
      {
        id: 'group-fabric',
        name: 'Fabric Choice',
        type: 'swatch',
        required: true,
        sortOrder: 1,
        defaultOptionId: 'opt-floral',
        options: [
          {
            id: 'opt-floral',
            label: 'Floral',
            priceDelta: 0,
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-floral.svg',
            previewImageUrl: '/images/productimages/eyewear-sleeve-1.jpg',
            detail: 'Soft printed cotton',
            sortOrder: 1,
          },
          {
            id: 'opt-corduroy',
            label: 'Corduroy',
            priceDelta: 6000, // 60 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-corduroy.svg',
            sortOrder: 2,
          },
          {
            id: 'opt-check',
            label: 'Check',
            priceDelta: 4000, // 40 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-check.svg',
            sortOrder: 3,
          },
          {
            id: 'opt-linen',
            label: 'Linen',
            priceDelta: 5000, // 50 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-linen.svg',
            sortOrder: 4,
          },
        ],
      },
      {
        id: 'group-closure',
        name: 'Closure Type',
        type: 'chips',
        required: true,
        sortOrder: 2,
        defaultOptionId: 'opt-closure-magnetic',
        options: [
          {
            id: 'opt-closure-magnetic',
            label: 'Magnetic Snap',
            priceDelta: 0,
            available: true,
            sortOrder: 1,
          },
          {
            id: 'opt-closure-button',
            label: 'Horn Button',
            priceDelta: 4000, // 40 INR
            available: true,
            sortOrder: 2,
          },
          {
            id: 'opt-closure-tie',
            label: 'Tie Ribbon',
            priceDelta: 2000, // 20 INR
            available: true,
            sortOrder: 3,
          },
        ],
      },
    ],
  },
  {
    id: 'prod-laptop',
    slug: 'laptop-sleeve',
    name: 'Padded Laptop Sleeve',
    description:
      'Padded tech sleeve with protective inner lining and clean edge stitching. Fits standard laptops.',
    categoryId: 'cat-sleeves',
    basePrice: 119900, // 1199 INR -> 119900 paise
    currency: 'INR',
    published: true,
    images: [
      { url: '/images/productimages/laptop-sleeve-1.jpg', alt: 'Padded Laptop Sleeve in floral print', order: 1 },
    ],
    optionGroups: [
      {
        id: 'group-fabric',
        name: 'Fabric Choice',
        type: 'swatch',
        required: true,
        sortOrder: 1,
        defaultOptionId: 'opt-floral',
        options: [
          {
            id: 'opt-floral',
            label: 'Floral',
            priceDelta: 0,
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-floral.svg',
            previewImageUrl: '/images/productimages/laptop-sleeve-1.jpg',
            detail: 'Soft printed cotton',
            sortOrder: 1,
          },
          {
            id: 'opt-corduroy',
            label: 'Corduroy',
            priceDelta: 0,
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-corduroy.svg',
            sortOrder: 2,
          },
          {
            id: 'opt-linen',
            label: 'Linen',
            priceDelta: 8000, // 80 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-linen.svg',
            sortOrder: 3,
          },
          {
            id: 'opt-check',
            label: 'Check',
            priceDelta: 5000, // 50 INR
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-check.svg',
            sortOrder: 4,
          },
        ],
      },
      {
        id: 'group-size',
        name: 'Size',
        type: 'chips',
        required: true,
        sortOrder: 2,
        defaultOptionId: 'opt-laptop-13',
        options: [
          {
            id: 'opt-laptop-13',
            label: '13-inch',
            priceDelta: 0,
            available: true,
            detail: 'Fits devices up to 31 x 22 cm',
            sortOrder: 1,
          },
          {
            id: 'opt-laptop-15',
            label: '15-inch',
            priceDelta: 15000, // 150 INR
            available: true,
            detail: 'Fits devices up to 35 x 25 cm',
            sortOrder: 2,
          },
        ],
      },
      {
        id: 'group-waterproof',
        name: 'Water-resistant Lining',
        type: 'toggle',
        required: false,
        sortOrder: 3,
        options: [
          {
            id: 'opt-waterproof-on',
            label: 'Include water-resistant lining',
            priceDelta: 12000, // 120 INR
            available: true,
            sortOrder: 1,
          },
        ],
      },
      {
        id: 'group-strap',
        name: 'Detachable Shoulder Strap',
        type: 'toggle',
        required: false,
        sortOrder: 4,
        options: [
          {
            id: 'opt-strap-on',
            label: 'Include matching shoulder strap',
            priceDelta: 20000, // 200 INR
            available: true,
            sortOrder: 1,
          },
        ],
      },
    ],
  },
];

async function seed() {
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

      // 1. Seed Categories (idempotent upsert on slug)
      console.log(`Upserting ${SEED_CATEGORIES.length} categories...`);
      for (const cat of SEED_CATEGORIES) {
        await tx
          .insert(categories)
          .values(cat)
          .onConflictDoUpdate({
            target: categories.slug,
            set: {
              name: cat.name,
              description: cat.description,
              image: cat.image,
              sortOrder: cat.sortOrder,
              published: cat.published,
              updatedAt: new Date(),
            },
          });
      }

      // 2. Seed Products, Option Groups, Options (idempotent upsert on slug & composite keys)
      console.log(`Upserting ${SEED_PRODUCTS.length} products...`);
      for (const prod of SEED_PRODUCTS) {
        await tx
          .insert(products)
          .values({
            id: prod.id,
            slug: prod.slug,
            name: prod.name,
            description: prod.description,
            categoryId: prod.categoryId,
            basePrice: prod.basePrice,
            currency: prod.currency,
            published: prod.published,
            images: prod.images,
          })
          .onConflictDoUpdate({
            target: products.slug,
            set: {
              name: prod.name,
              description: prod.description,
              categoryId: prod.categoryId,
              basePrice: prod.basePrice,
              currency: prod.currency,
              published: prod.published,
              images: prod.images,
              updatedAt: new Date(),
            },
          });

        for (const group of prod.optionGroups) {
          await tx
            .insert(optionGroups)
            .values({
              id: group.id,
              productId: prod.id,
              name: group.name,
              type: group.type,
              required: group.required,
              sortOrder: group.sortOrder,
              defaultOptionId: group.defaultOptionId || null,
            })
            .onConflictDoUpdate({
              target: [optionGroups.productId, optionGroups.id],
              set: {
                name: group.name,
                type: group.type,
                required: group.required,
                sortOrder: group.sortOrder,
                defaultOptionId: group.defaultOptionId || null,
              },
            });

          for (const opt of group.options) {
            await tx
              .insert(options)
              .values({
                id: opt.id,
                productId: prod.id,
                groupId: group.id,
                label: opt.label,
                priceDelta: opt.priceDelta,
                swatchImageUrl: opt.swatchImageUrl || null,
                colourValue: opt.colourValue || null,
                previewImageUrl: opt.previewImageUrl || null,
                detail: opt.detail || null,
                available: opt.available ?? true,
                sortOrder: opt.sortOrder,
              })
              .onConflictDoUpdate({
                target: [options.productId, options.groupId, options.id],
                set: {
                  label: opt.label,
                  priceDelta: opt.priceDelta,
                  swatchImageUrl: opt.swatchImageUrl || null,
                  colourValue: opt.colourValue || null,
                  previewImageUrl: opt.previewImageUrl || null,
                  detail: opt.detail || null,
                  available: opt.available ?? true,
                  sortOrder: opt.sortOrder,
                },
              });
          }
        }
      }

      // 3. Dev-only seed for one test customer and one test address
      if (process.env.NODE_ENV === 'production') {
        console.log('Production environment detected: skipping dev-only customer and address seed.');
      } else {
        const devPassword = process.env.SEED_DEV_USER_PASSWORD;
        if (!devPassword) {
          throw new Error(
            'SEED_DEV_USER_PASSWORD environment variable is required to seed dev user. Please define it in backend/.env'
          );
        }

        console.log('Seeding dev-only customer and address...');
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
            target: users.email,
            set: {
              name: devUser.name,
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
      }

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
