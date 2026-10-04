require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding curated vocabulary decks...');

  const existing = await prisma.deck.findFirst({ where: { isCurated: true } });
  if (existing) {
    console.log('Curated decks already exist in database.');
    return;
  }

  await prisma.deck.create({
    data: {
      title: 'IELTS 7.0+ Academic Core Vocabulary',
      description: '800 từ vựng ăn điểm chuyên sâu cho IELTS Academic Reading & Writing.',
      category: 'IELTS',
      level: 'Advanced',
      isCurated: true,
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60',
      words: {
        create: [
          {
            word: 'Resilience',
            meaningVi: 'Khả năng phục hồi, sự kiên cường',
            type: 'noun',
            phonetic: '/rɪˈzɪl.jəns/',
            example: 'Resilience is essential for overcoming academic setbacks.'
          },
          {
            word: 'Mitigate',
            meaningVi: 'Giảm nhẹ, làm bớt nghiêm trọng',
            type: 'verb',
            phonetic: '/ˈmɪt.ə.ɡeɪt/',
            example: 'Measures were taken to mitigate environmental damage.'
          },
          {
            word: 'Unprecedented',
            meaningVi: 'Chưa từng có tiền lệ',
            type: 'adjective',
            phonetic: '/ʌnˈpres.ə.den.tɪd/',
            example: 'The city is facing an unprecedented economic crisis.'
          }
        ]
      }
    }
  });

  await prisma.deck.create({
    data: {
      title: 'TOEIC 800+ Business & Office',
      description: 'Bộ từ vựng giao tiếp thương mại, hợp đồng và văn phòng chuẩn TOEIC.',
      category: 'TOEIC',
      level: 'Intermediate',
      isCurated: true,
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60',
      words: {
        create: [
          {
            word: 'Negotiate',
            meaningVi: 'Đàm phán, thương lượng',
            type: 'verb',
            phonetic: '/nəˈɡoʊ.ʃi.eɪt/',
            example: 'We are preparing to negotiate a new vendor contract.'
          },
          {
            word: 'Implement',
            meaningVi: 'Thực thi, triển khai kế hoạch',
            type: 'verb',
            phonetic: '/ˈɪm.plə.ment/',
            example: 'The company plans to implement new security policies next week.'
          }
        ]
      }
    }
  });

  await prisma.deck.create({
    data: {
      title: 'IT Tech & Software Engineering',
      description: 'Thuật ngữ & cụm từ chuyên ngành Công nghệ thông tin, Lập trình và hệ thống.',
      category: 'IT_TECH',
      level: 'Intermediate',
      isCurated: true,
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
      words: {
        create: [
          {
            word: 'Idempotent',
            meaningVi: 'Tính chất giao dịch lặp lại không làm thay đổi kết quả',
            type: 'adjective',
            phonetic: '/ˌaɪ.dæmˈpoʊ.tənt/',
            example: 'HTTP PUT requests must be idempotent.'
          },
          {
            word: 'Asynchronous',
            meaningVi: 'Bất đồng bộ',
            type: 'adjective',
            phonetic: '/eɪˈsɪŋ.krə.nəs/',
            example: 'Node.js utilizes an asynchronous event loop architecture.'
          }
        ]
      }
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
