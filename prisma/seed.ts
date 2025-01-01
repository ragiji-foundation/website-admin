import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.$transaction([
    prisma.electronicMedia.deleteMany(),
    prisma.newsArticle.deleteMany(),
    prisma.initiative.deleteMany(),
    prisma.center.deleteMany(),
    prisma.career.deleteMany(),
    prisma.gallery.deleteMany(),
  ]);

  // Seed Electronic Media
  await prisma.electronicMedia.createMany({
    data: [
      {
        title: "UPAY Featured on NDTV",
        description: "NDTV coverage on UPAY's impact in transforming lives through education",
        videoUrl: "https://www.youtube.com/watch?v=ndtv-upay",
        thumbnail: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/media/ndtv-coverage.jpg",
        order: 1
      },
      {
        title: "Footpath Shala Initiative",
        description: "BBC News coverage of UPAY's innovative footpath schools",
        videoUrl: "https://www.youtube.com/watch?v=bbc-footpath",
        thumbnail: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/media/footpath-shala.jpg",
        order: 2
      },
      {
        title: "Digital Learning Revolution",
        description: "How UPAY is bridging the digital divide in education",
        videoUrl: "https://www.youtube.com/watch?v=digital-learning",
        thumbnail: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/media/digital-learning.jpg",
        order: 3
      }
    ]
  });

  // Seed News Articles
  await prisma.newsArticle.createMany({
    data: [
      {
        title: "UPAY's Reach Extends to 15,000 Children",
        source: "Times of India",
        date: new Date("2024-03-15"),
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/news/toi-coverage.jpg",
        link: "https://timesofindia.indiatimes.com/upay-impact",
        description: "UPAY's educational programs have now reached 15,000 underprivileged children across India"
      },
      {
        title: "UPAY Launches Tech Learning Centers",
        source: "The Hindu",
        date: new Date("2024-02-28"),
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/news/tech-center.jpg",
        link: "https://thehindu.com/upay-tech-centers",
        description: "New initiative brings technology education to underprivileged communities"
      },
      {
        title: "National Award for Social Innovation",
        source: "Indian Express",
        date: new Date("2024-01-20"),
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/news/award.jpg",
        link: "https://indianexpress.com/upay-award",
        description: "UPAY receives national recognition for innovative education methods"
      }
    ]
  });

  // Seed Initiatives
  await prisma.initiative.createMany({
    data: [
      {
        title: "Footpath Shala",
        description: "Mobile schools that bring education directly to street children, operating in areas where children cannot access traditional schools. Our teachers conduct daily classes using innovative teaching methods.",
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/initiatives/footpath-shala.jpg",
        order: 1
      },
      {
        title: "Digital Literacy Program",
        description: "Equipping underprivileged children with essential digital skills through computer labs and mobile technology units. Includes basic computer education, internet safety, and coding basics.",
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/initiatives/digital-literacy.jpg",
        order: 2
      },
      {
        title: "Girl Child Education",
        description: "Special focus on promoting education for girls through scholarships, mentorship programs, and awareness campaigns in communities.",
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/initiatives/girl-education.jpg",
        order: 3
      }
    ]
  });

  // Seed Centers
  await prisma.center.createMany({
    data: [
      {
        name: "UPAY Main Learning Center",
        location: "Nagpur Central, Maharashtra",
        description: "Our flagship learning center equipped with modern facilities, computer lab, and library. Serves over 200 children daily with various educational programs.",
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/centers/nagpur-main.jpg",
        contactInfo: "Contact: +91 9876543210\nEmail: nagpur.center@upay.org.in"
      },
      {
        name: "UPAY Digital Hub - Pune",
        location: "Pune, Maharashtra",
        description: "Specialized center focusing on digital education with advanced computer facilities and coding programs.",
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/centers/pune-digital.jpg",
        contactInfo: "Contact: +91 9876543211\nEmail: pune.digital@upay.org.in"
      },
      {
        name: "UPAY Community Center - Mumbai",
        location: "Dharavi, Mumbai",
        description: "Community-based learning center providing education and skill development programs to urban slum children.",
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/centers/mumbai-community.jpg",
        contactInfo: "Contact: +91 9876543212\nEmail: mumbai.center@upay.org.in"
      }
    ]
  });

  // Seed Careers
  await prisma.career.createMany({
    data: [
      {
        title: "Program Director - Education",
        location: "Nagpur",
        type: "full-time",
        description: "Lead our educational initiatives and develop innovative learning programs. Oversee multiple learning centers and coordinate with stakeholders.",
        requirements: "- Master's in Education or related field\n- 7+ years experience in education management\n- Strong leadership and communication skills\n- Experience in NGO sector preferred",
        isActive: true
      },
      {
        title: "Digital Learning Specialist",
        location: "Pune",
        type: "full-time",
        description: "Design and implement digital learning programs. Train teachers in using technology for education.",
        requirements: "- Bachelor's in Computer Science or Education Technology\n- 3+ years experience in EdTech\n- Proficiency in educational software and tools\n- Strong teaching skills",
        isActive: true
      },
      {
        title: "Weekend Volunteer Teacher",
        location: "Mumbai",
        type: "volunteer",
        description: "Teach underprivileged children during weekend programs. Subjects include basic literacy, mathematics, and life skills.",
        requirements: "- Teaching experience preferred\n- Strong commitment to social cause\n- Available on weekends\n- Good communication skills",
        isActive: true
      }
    ]
  });

  // Seed Gallery
  await prisma.gallery.createMany({
    data: [
      {
        title: "Annual Day 2024",
        description: "Students showcasing their talents through cultural performances and exhibitions",
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/gallery/annual-day-2024.jpg",
        category: "Event"
      },
      {
        title: "Digital Lab Inauguration",
        description: "Opening of new computer lab at Pune Digital Hub",
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/gallery/digital-lab.jpg",
        category: "Center"
      },
      {
        title: "Street Education Drive",
        description: "Teachers conducting classes in mobile footpath schools",
        imageUrl: "https://ragiji-foundation-bucket.s3.ap-south-1.amazonaws.com/gallery/street-education.jpg",
        category: "Initiative"
      }
    ]
  });

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 