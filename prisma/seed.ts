import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete existing data
    await prisma.blog.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.enquiry.deleteMany();
    await prisma.user.deleteMany();

    console.log('Existing data deleted');

    // Create Admin User
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@ragijifoundation.com',
        username: 'admin',
        image: 'https://ui-avatars.com/api/?name=Admin+User',
      },
    });

    console.log('Admin user created:', admin.email);

    // Create all Categories
    const categoryData = [
      { name: 'Health', slug: 'health', description: 'Articles about health and wellness' },
      { name: 'Education', slug: 'education', description: 'Educational resources and insights' },
      { name: 'Environment', slug: 'environment', description: 'Environmental awareness and conservation' },
      { name: 'Technology', slug: 'technology', description: 'Technology trends and innovations' },
      { name: 'Community', slug: 'community', description: 'Community development initiatives' },
      { name: 'Culture', slug: 'culture', description: 'Cultural awareness and diversity' },
      { name: 'Agriculture', slug: 'agriculture', description: 'Sustainable farming practices' },
      { name: 'Women Empowerment', slug: 'women-empowerment', description: 'Women empowerment initiatives' },
      { name: 'Youth Development', slug: 'youth-development', description: 'Youth programs and development' },
      { name: 'Social Impact', slug: 'social-impact', description: 'Social impact projects and stories' },
    ];

    const categories = await Promise.all(
      categoryData.map(cat =>
        prisma.category.create({
          data: cat
        })
      )
    );

    console.log('Categories created:', categories.length);

    // Create all Tags
    const tagData = [
      { name: 'COVID-19', slug: 'covid-19', description: 'Information about COVID-19' },
      { name: 'Sustainability', slug: 'sustainability', description: 'Sustainable development practices' },
      { name: 'Digital Literacy', slug: 'digital-literacy', description: 'Digital education and skills' },
      { name: 'Mental Health', slug: 'mental-health', description: 'Mental health awareness' },
      { name: 'Rural Development', slug: 'rural-development', description: 'Rural area development initiatives' },
      { name: 'Clean Energy', slug: 'clean-energy', description: 'Renewable energy solutions' },
      { name: 'Water Conservation', slug: 'water-conservation', description: 'Water preservation methods' },
      { name: 'Skill Development', slug: 'skill-development', description: 'Skill building programs' },
      { name: 'Gender Equality', slug: 'gender-equality', description: 'Gender equality initiatives' },
      { name: 'Child Education', slug: 'child-education', description: 'Child education programs' },
    ];

    const tags = await Promise.all(
      tagData.map(tag =>
        prisma.tag.create({
          data: tag
        })
      )
    );

    console.log('Tags created:', tags.length);

    // Create Testimonials
    await prisma.testimonial.create({
      data: {
        name: 'Rahul Sharma',
        role: 'Community Member',
        content: 'The foundation has transformed our village through their educational initiatives.',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma',
      },
    });

    console.log('Testimonial created');

    // Create Blogs
    const blog1 = await prisma.blog.create({
      data: {
        slug: 'clean-water-initiative',
        locale: 'en',
        title: 'Clean Water Initiative in Rural Areas',
        content: `<h2>Addressing Water Scarcity in Rural India</h2>
        <p>Our Clean Water Initiative has reached a significant milestone...</p>`,
        status: 'published',
        authorName: 'John Doe',
        metaDescription: 'Learn about our clean water initiative',
        ogTitle: 'Clean Water Initiative',
        ogDescription: 'Making clean water accessible to all',
        author: {
          connect: { id: admin.id }
        },
        category: {
          connect: { id: categories[0].id }
        },
        tags: {
          connect: [
            { id: tags[0].id },
            { id: tags[1].id }
          ]
        }
      },
    });

    console.log('English blog created:', blog1.title);

    // Create Hindi version
    const blog2 = await prisma.blog.create({
      data: {
        slug: 'clean-water-initiative',
        locale: 'hi',
        title: 'ग्रामीण क्षेत्रों में स्वच्छ जल पहल',
        content: `<h2>ग्रामीण भारत में जल की कमी का समाधान</h2>
        <p>हमारी स्वच्छ जल पहल ने एक महत्वपूर्ण मील का पत्थर पार कर लिया है...</p>`,
        status: 'published',
        authorName: 'John Doe',
        metaDescription: 'हमारी स्वच्छ जल पहल के बारे में जानें',
        ogTitle: 'स्वच्छ जल पहल',
        ogDescription: 'सभी के लिए स्वच्छ पानी सुलभ बनाना',
        author: {
          connect: { id: admin.id }
        },
        category: {
          connect: { id: categories[0].id }
        },
        tags: {
          connect: [
            { id: tags[0].id },
            { id: tags[1].id }
          ]
        }
      },
    });

    console.log('Hindi blog created:', blog2.title);

    // Create Enquiry
    await prisma.enquiry.create({
      data: {
        email: 'contact1@example.com',
        name: 'Vikram Singh',
        subject: 'Volunteer Opportunity',
        message: 'I would like to volunteer for your organization.',
      },
    });

    console.log('Enquiry created');

    // Array of blog data for bulk creation
    const blogData = [
      {
        slug: 'women-empowerment-initiative',
        titleEn: 'Women Empowerment Through Skill Development',
        titleHi: 'कौशल विकास के माध्यम से महिला सशक्तिकरण',
        contentEn: `<h2>Transforming Lives Through Skills</h2>
        <p>Our women empowerment initiative has successfully trained over 500 women in various vocational skills across 15 villages. The program focuses on sustainable livelihood development through skill-based training and entrepreneurship support.</p>
        
        <h3>Key Program Components</h3>
        <ul>
          <li>Tailoring and garment design training</li>
          <li>Digital literacy and computer skills</li>
          <li>Financial literacy and banking</li>
          <li>Micro-enterprise development</li>
          <li>Marketing and business management</li>
        </ul>

        <h3>Success Stories</h3>
        <p>Through this initiative, many women have started their own businesses. Meena Devi from Rajpur village now runs a successful tailoring unit employing five other women. Sunita Kumari has established a small-scale food processing unit.</p>

        <blockquote>
          "This program gave me the confidence and skills to become financially independent. I now support my children's education through my own earnings." - Meena Devi
        </blockquote>`,
        contentHi: `<h2>कौशल के माध्यम से जीवन में बदलाव</h2>
        <p>हमारी महिला सशक्तिकरण पहल ने 15 गांवों में 500 से अधिक महिलाओं को विभिन्न व्यावसायिक कौशलों में सफलतापूर्वक प्रशिक्षित किया है। कार्यक्रम कौशल-आधारित प्रशिक्षण और उद्यमिता समर्थन के माध्यम से स्थायी आजीविका विकास पर केंद्रित है।</p>
        
        <h3>प्रमुख कार्यक्रम घटक</h3>
        <ul>
          <li>सिलाई और परिधान डिजाइन प्रशिक्षण</li>
          <li>डिजिटल साक्षरता और कंप्यूटर कौशल</li>
          <li>वित्तीय साक्षरता और बैंकिंग</li>
          <li>सूक्ष्म-उद्यम विकास</li>
          <li>विपणन और व्यवसाय प्रबंधन</li>
        </ul>`,
        categoryId: categories[7].id, // Women Empowerment category
        tags: [tags[7].id, tags[8].id], // Skill Development, Gender Equality tags
      },
      {
        slug: 'sustainable-agriculture-practices',
        titleEn: 'Modern Sustainable Agriculture Practices',
        titleHi: 'आधुनिक टिकाऊ कृषि पद्धतियां',
        contentEn: `<h2>Revolutionizing Farming in Rural India</h2>
        <p>Our sustainable agriculture program has introduced modern farming techniques to over 1,000 farmers, significantly improving crop yields while maintaining environmental balance.</p>
        
        <h3>Innovative Techniques Implemented</h3>
        <ul>
          <li>Drip irrigation systems</li>
          <li>Organic farming methods</li>
          <li>Crop rotation strategies</li>
          <li>Integrated pest management</li>
          <li>Soil health management</li>
        </ul>

        <h3>Impact Assessment</h3>
        <p>Farmers have reported a 40% increase in crop yield and a 30% reduction in water usage. The program has also led to significant reduction in chemical fertilizer use.</p>`,
        contentHi: `<h2>ग्रामीण भारत में कृषि का आधुनिकीकरण</h2>
        <p>हमारे टिकाऊ कृषि कार्यक्रम ने 1,000 से अधिक किसानों को आधुनिक कृषि तकनीकों से परिचित कराया है, जिससे पर्यावरण संतुलन बनाए रखते हुए फसल उत्पादन में महत्वपूर्ण सुधार हुआ है।</p>`,
        categoryId: categories[6].id, // Agriculture category
        tags: [tags[1].id, tags[6].id], // Sustainability, Water Conservation tags
      },
      {
        slug: 'digital-education-revolution',
        titleEn: 'Digital Education: Transforming Rural Learning',
        titleHi: 'डिजिटल शिक्षा: ग्रामीण शिक्षा का कायाकल्प',
        contentEn: `<h2>Bridging the Digital Divide in Education</h2>
        <p>Our digital education initiative has successfully established 25 smart classrooms across rural schools, benefiting over 2,500 students. This transformative program combines modern technology with traditional teaching methods to create an engaging learning environment.</p>

        <h3>Program Highlights</h3>
        <ul>
          <li>Interactive digital learning modules in local languages</li>
          <li>Teacher training in digital pedagogy</li>
          <li>Access to online educational resources</li>
          <li>Virtual science laboratories</li>
          <li>Coding and robotics workshops</li>
        </ul>

        <h3>Measurable Impact</h3>
        <p>Since the program's inception, we've observed:</p>
        <ul>
          <li>35% improvement in student attendance</li>
          <li>42% increase in science subject scores</li>
          <li>Significant enhancement in digital literacy among teachers</li>
        </ul>

        <blockquote>
          "The digital classroom has made learning science fun and interactive. Now I can actually see what I'm studying!" - Priya, Class 8 student
        </blockquote>`,
        contentHi: `<h2>शिक्षा में डिजिटल विभाजन को पाटना</h2>
        <p>हमारी डिजिटल शिक्षा पहल ने ग्रामीण स्कूलों में 25 स्मार्ट कक्षाएं स्थापित की हैं, जिससे 2,500 से अधिक छात्र लाभान्वित हुए हैं।</p>`,
        categoryId: categories[1].id, // Education
        tags: [tags[2].id, tags[9].id], // Digital Literacy, Child Education
      },
      {
        slug: 'rural-healthcare-initiative',
        titleEn: 'Comprehensive Rural Healthcare Program',
        titleHi: 'व्यापक ग्रामीण स्वास्थ्य देखभाल कार्यक्रम',
        contentEn: `<h2>Healthcare Access for All</h2>
        <p>Our rural healthcare program has established 15 mobile medical units and 10 permanent health centers, providing essential healthcare services to over 50,000 villagers across 100 villages.</p>

        <h3>Services Provided</h3>
        <ul>
          <li>Regular health check-ups and screenings</li>
          <li>Maternal and child healthcare</li>
          <li>Vaccination drives</li>
          <li>Mental health counseling</li>
          <li>Health awareness workshops</li>
        </ul>

        <h3>Key Achievements</h3>
        <p>In the past year, we have:</p>
        <ul>
          <li>Conducted 1000+ health camps</li>
          <li>Reduced maternal mortality by 45%</li>
          <li>Achieved 95% vaccination coverage</li>
        </ul>`,
        contentHi: `<h2>सभी के लिए स्वास्थ्य देखभाल</h2>
        <p>हमारे ग्रामीण स्वास्थ्य कार्यक्रम ने 15 मोबाइल चिकित्सा इकाइयां और 10 स्थायी स्वास्थ्य केंद्र स्थापित किए हैं।</p>`,
        categoryId: categories[0].id, // Health
        tags: [tags[0].id, tags[3].id], // COVID-19, Mental Health
      },
      {
        slug: 'environmental-conservation-project',
        titleEn: 'Environmental Conservation: Protecting Our Future',
        titleHi: 'पर्यावरण संरक्षण: हमारे भविष्य की सुरक्षा',
        contentEn: `<h2>Community-Led Environmental Protection</h2>
        <p>Our environmental conservation project has successfully restored 500 hectares of degraded land and planted over 50,000 trees across 30 villages. This initiative combines traditional ecological knowledge with modern conservation techniques.</p>

        <h3>Key Initiatives</h3>
        <ul>
          <li>Community forest management programs</li>
          <li>Watershed development projects</li>
          <li>Biodiversity conservation</li>
          <li>Waste management systems</li>
          <li>Environmental education programs</li>
        </ul>

        <h3>Environmental Impact</h3>
        <p>Our efforts have resulted in:</p>
        <ul>
          <li>25% increase in groundwater levels</li>
          <li>Return of native bird species</li>
          <li>60% reduction in plastic waste</li>
        </ul>

        <blockquote>
          "We've seen our dried wells come back to life. The forest is breathing again." - Ram Singh, Village Elder
        </blockquote>`,
        contentHi: `<h2>सामुदायिक पर्यावरण संरक्षण</h2>
        <p>हमारी पर्यावरण संरक्षण परियोजना ने 30 गांवों में 500 हेक्टेयर क्षतिग्रस्त भूमि को पुनर्स्थापित किया है और 50,000 से अधिक पेड़ लगाए हैं।</p>`,
        categoryId: categories[2].id, // Environment
        tags: [tags[1].id, tags[6].id], // Sustainability, Water Conservation
      },
      {
        slug: 'youth-leadership-program',
        titleEn: 'Youth Leadership: Shaping Tomorrow\'s Leaders',
        titleHi: 'युवा नेतृत्व: कल के नेताओं का निर्माण',
        contentEn: `<h2>Empowering Young Change-Makers</h2>
        <p>Our Youth Leadership Program has trained 1,000 young leaders from 50 villages, creating a network of motivated change-makers who are driving community development initiatives.</p>

        <h3>Program Components</h3>
        <ul>
          <li>Leadership skills workshops</li>
          <li>Project management training</li>
          <li>Community service projects</li>
          <li>Digital skills development</li>
          <li>Entrepreneurship guidance</li>
        </ul>

        <h3>Success Stories</h3>
        <p>Our youth leaders have:</p>
        <ul>
          <li>Initiated 100+ community projects</li>
          <li>Created 25 social enterprises</li>
          <li>Mentored 2000+ peers</li>
        </ul>`,
        contentHi: `<h2>युवा परिवर्तन निर्माताओं का सशक्तिकरण</h2>
        <p>हमारे युवा नेतृत्व कार्यक्रम ने 50 गांवों से 1,000 युवा नेताओं को प्रशिक्षित किया है।</p>`,
        categoryId: categories[8].id, // Youth Development
        tags: [tags[7].id, tags[4].id], // Skill Development, Rural Development
      },
      {
        slug: 'community-development-initiative',
        titleEn: 'Building Stronger Communities Together',
        titleHi: 'साथ मिलकर मजबूत समुदायों का निर्माण',
        contentEn: `<h2>Transforming Villages Through Unity</h2>
        <p>Our community development program has reached 75 villages, implementing integrated development solutions that have improved the quality of life for over 100,000 people.</p>

        <h3>Focus Areas</h3>
        <ul>
          <li>Infrastructure development</li>
          <li>Livelihood enhancement</li>
          <li>Social cohesion programs</li>
          <li>Cultural preservation</li>
          <li>Civic engagement initiatives</li>
        </ul>`,
        contentHi: `<h2>एकता के माध्यम से गांवों का परिवर्तन</h2>
        <p>हमारा सामुदायिक विकास कार्यक्रम 75 गांवों तक पहुंच चुका है।</p>`,
        categoryId: categories[4].id, // Community
        tags: [tags[4].id, tags[1].id], // Rural Development, Sustainability
      },
      {
        slug: 'mental-health-awareness',
        titleEn: 'Breaking Stigma: Rural Mental Health Initiative',
        titleHi: 'कलंक को तोड़ना: ग्रामीण मानसिक स्वास्थ्य पहल',
        contentEn: `<h2>Mental Health Support for All</h2>
        <p>Our mental health initiative has provided support to over 5,000 individuals through counseling services and awareness programs in 40 villages.</p>

        <h3>Program Features</h3>
        <ul>
          <li>Professional counseling services</li>
          <li>Mental health awareness camps</li>
          <li>Support group networks</li>
          <li>Youth mental health programs</li>
          <li>Family counseling services</li>
        </ul>`,
        contentHi: `<h2>सभी के लिए मानसिक स्वास्थ्य सहायता</h2>
        <p>हमारी मानसिक स्वास्थ्य पहल ने 40 गांवों में 5,000 से अधिक लोगों को सहायता प्रदान की है।</p>`,
        categoryId: categories[0].id, // Health
        tags: [tags[3].id, tags[4].id], // Mental Health, Rural Development
      },
      {
        slug: 'clean-energy-solutions',
        titleEn: 'Renewable Energy: Powering Rural Development',
        titleHi: 'नवीकरणीय ऊर्जा: ग्रामीण विकास को शक्ति',
        contentEn: `<h2>Sustainable Energy for Villages</h2>
        <p>Our clean energy initiative has installed solar power systems in 200 households and 50 community centers, reducing carbon emissions and providing reliable electricity access.</p>

        <h3>Project Components</h3>
        <ul>
          <li>Solar home lighting systems</li>
          <li>Community solar pumps</li>
          <li>Biogas plants</li>
          <li>Energy-efficient cooking solutions</li>
          <li>Technical training programs</li>
        </ul>`,
        contentHi: `<h2>गांवों के लिए स्थायी ऊर्जा</h2>
        <p>हमारी स्वच्छ ऊर्जा पहल ने 200 घरों और 50 सामुदायिक केंद्रों में सौर ऊर्जा प्रणाली स्थापित की है।</p>`,
        categoryId: categories[2].id, // Environment
        tags: [tags[5].id, tags[1].id], // Clean Energy, Sustainability
      },
      {
        slug: 'child-education-program',
        titleEn: 'Quality Education for Every Child',
        titleHi: 'हर बच्चे के लिए गुणवत्तापूर्ण शिक्षा',
        contentEn: `<h2>Nurturing Young Minds</h2>
        <p>Our child education program has established 30 learning centers, benefiting over 3,000 children with quality education and comprehensive development support.</p>

        <h3>Program Features</h3>
        <ul>
          <li>Early childhood education</li>
          <li>After-school support programs</li>
          <li>Art and cultural activities</li>
          <li>Sports and physical education</li>
          <li>Nutritional support</li>
        </ul>`,
        contentHi: `<h2>युवा दिमागों का पोषण</h2>
        <p>हमारे बाल शिक्षा कार्यक्रम ने 30 शिक्षण केंद्र स्थापित किए हैं, जिससे 3,000 से अधिक बच्चों को लाभ मिल रहा है।</p>`,
        categoryId: categories[1].id, // Education
        tags: [tags[9].id, tags[2].id], // Child Education, Digital Literacy
      }
    ];

    // Create blogs for each entry
    for (const blog of blogData) {
      try {
        // Create English version
        const englishBlog = await prisma.blog.create({
          data: {
            slug: blog.slug,
            locale: 'en',
            title: blog.titleEn,
            content: blog.contentEn,
            status: 'published',
            authorName: 'Admin User',
            metaDescription: `Learn about ${blog.titleEn}`,
            ogTitle: blog.titleEn,
            ogDescription: `Detailed information about ${blog.titleEn}`,
            author: {
              connect: { id: admin.id }
            },
            category: {
              connect: { id: blog.categoryId }
            },
            tags: {
              connect: blog.tags.map(tagId => ({ id: tagId }))
            }
          },
        });

        console.log('Created English blog:', englishBlog.title);

        // Create Hindi version
        const hindiBlog = await prisma.blog.create({
          data: {
            slug: blog.slug,
            locale: 'hi',
            title: blog.titleHi,
            content: blog.contentHi,
            status: 'published',
            authorName: 'Admin User',
            metaDescription: `${blog.titleHi} के बारे में जानें`,
            ogTitle: blog.titleHi,
            ogDescription: `${blog.titleHi} के बारे में विस्तृत जानकारी`,
            author: {
              connect: { id: admin.id }
            },
            category: {
              connect: { id: blog.categoryId }
            },
            tags: {
              connect: blog.tags.map(tagId => ({ id: tagId }))
            }
          },
        });

        console.log('Created Hindi blog:', hindiBlog.title);
      } catch (error) {
        console.error(`Error creating blog ${blog.slug}:`, error);
      }
    }

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 