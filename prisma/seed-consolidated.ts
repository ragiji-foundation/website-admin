import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Enhanced seed data with proper HTML content for TipTap compatibility
const seedData = {
  // Admin user
  adminUser: {
    name: 'Admin User',
    email: 'admin@ragijifoundation.com',
    username: 'admin',
    password: 'admin123', // Will be hashed
    role: 'admin'
  },

  // Categories for blogs
  categories: [
    {
      name: 'Education',
      nameHi: 'शिक्षा',
      slug: 'education',
      description: 'Educational initiatives and programs',
      descriptionHi: 'शैक्षिक पहल और कार्यक्रम'
    },
    {
      name: 'Healthcare',
      nameHi: 'स्वास्थ्य सेवा',
      slug: 'healthcare',
      description: 'Health and wellness programs',
      descriptionHi: 'स्वास्थ्य और कल्याण कार्यक्रम'
    },
    {
      name: 'Women Empowerment',
      nameHi: 'महिला सशक्तिकरण',
      slug: 'women-empowerment',
      description: 'Empowering women through various initiatives',
      descriptionHi: 'विभिन्न पहलों के माध्यम से महिलाओं को सशक्त बनाना'
    },
    {
      name: 'Skill Development',
      nameHi: 'कौशल विकास',
      slug: 'skill-development',
      description: 'Vocational training and skill building',
      descriptionHi: 'व्यावसायिक प्रशिक्षण और कौशल निर्माण'
    }
  ],

  // Tags for content categorization
  tags: [
    { name: 'Digital Literacy', nameHi: 'डिजिटल साक्षरता', slug: 'digital-literacy' },
    { name: 'Rural Development', nameHi: 'ग्रामीण विकास', slug: 'rural-development' },
    { name: 'Youth', nameHi: 'युवा', slug: 'youth' },
    { name: 'Children', nameHi: 'बच्चे', slug: 'children' },
    { name: 'Community', nameHi: 'समुदाय', slug: 'community' },
    { name: 'Technology', nameHi: 'प्रौद्योगिकी', slug: 'technology' }
  ],

  // Success stories with proper HTML content and actual MinIO images
  successStories: [
    {
      slug: 'ravi-kumar-street-to-success',
      title: "From Street to Success: Ravi's Journey",
      titleHi: "सड़क से सफलता तक: रवि की यात्रा",
      content: `<h2>A Remarkable Transformation</h2>
        <p>Ravi Kumar's journey from being a street child to becoming a successful software engineer is nothing short of inspirational. When we first met Ravi in 2018, he was living on the streets of Delhi, struggling to find his next meal.</p>
        <p>Through our <strong>Digital Literacy Program</strong>, Ravi learned basic computer skills and gradually developed programming abilities. His dedication and hard work paid off when he secured a position at a leading tech company.</p>
        <blockquote>"Education gave me hope when I had none. Today, I'm not just surviving - I'm thriving." - Ravi Kumar</blockquote>`,
      contentHi: `<h2>एक उल्लेखनीय परिवर्तन</h2>
        <p>रवि कुमार की सड़क पर रहने वाले बच्चे से एक सफल सॉफ्टवेयर इंजीनियर बनने की यात्रा प्रेरणादायक से कम नहीं है।</p>`,
      personName: 'Ravi Kumar',
      personNameHi: 'रवि कुमार',
      location: 'Delhi',
      locationHi: 'दिल्ली',
      imageUrl: '/api/image-proxy/ragiji-images/1753810683938-IMG_3891.JPG',
      featured: true,
      order: 1
    },
    {
      slug: 'priya-singh-entrepreneurship',
      title: "Breaking Barriers: Priya's Entrepreneurship Story",
      titleHi: "बाधाओं को तोड़ना: प्रिया की उद्यमिता की कहानी",
      content: `<h2>From Homemaker to Business Owner</h2>
        <p>Priya Singh transformed her life through our <em>Women Entrepreneurship Program</em>. Starting with a small tailoring business from her home, she now employs 15 women in her garment manufacturing unit.</p>
        <ul>
          <li>Started with ₹5,000 initial investment</li>
          <li>Completed business management training</li>
          <li>Now generates ₹50,000 monthly revenue</li>
          <li>Provides employment to 15 women</li>
        </ul>`,
      contentHi: `<h2>गृहिणी से व्यापारी तक</h2>
        <p>प्रिया सिंह ने हमारे महिला उद्यमिता कार्यक्रम के माध्यम से अपना जीवन बदल दिया।</p>`,
      personName: 'Priya Singh',
      personNameHi: 'प्रिया सिंह',
      location: 'Mumbai',
      locationHi: 'मुंबई',
      imageUrl: '/api/image-proxy/ragiji-images/1753810685544-IMG_3894.JPG',
      featured: true,
      order: 2
    },
    {
      slug: 'amit-sharma-digital-dreams',
      title: "Digital Dreams: Amit's Technical Journey",
      titleHi: "डिजिटल सपने: अमित की तकनीकी यात्रा",
      content: `<h2>From No Computer Access to IT Professional</h2>
        <p>Amit Sharma had never touched a computer before joining our program. Coming from a rural background in Uttar Pradesh, technology seemed like a distant dream.</p>
        <p>Through our comprehensive training program, Amit learned:</p>
        <ol>
          <li>Basic computer operations</li>
          <li>Web development fundamentals</li>
          <li>Programming languages</li>
          <li>Professional communication skills</li>
        </ol>
        <p>Today, Amit works as a full-stack developer and mentors other students in our program.</p>`,
      contentHi: `<h2>कंप्यूटर की पहुंच नहीं से आईटी पेशेवर तक</h2>
        <p>अमित शर्मा ने हमारे कार्यक्रम में शामिल होने से पहले कभी कंप्यूटर को छुआ भी नहीं था।</p>`,
      personName: 'Amit Sharma',
      personNameHi: 'अमित शर्मा',
      location: 'Bangalore',
      locationHi: 'बैंगलोर',
      imageUrl: '/api/image-proxy/ragiji-images/1753810688528-IMG_3916.JPG',
      featured: false,
      order: 3
    }
  ],

  // Statistics with proper data types
  stats: [
    {
      label: 'Children Educated',
      labelHi: 'शिक्षित बच्चे',
      value: '5000+',
      icon: 'school',
      order: 1
    },
    {
      label: 'Communities Served',
      labelHi: 'सेवा की गई समुदाय',
      value: '100+',
      icon: 'community',
      order: 2
    },
    {
      label: 'Success Stories',
      labelHi: 'सफलता की कहानियां',
      value: '1000+',
      icon: 'heart',
      order: 3
    },
    {
      label: 'Learning Centers',
      labelHi: 'शिक्षा केंद्र',
      value: '25+',
      icon: 'building',
      order: 4
    },
    {
      label: 'Volunteer Teachers',
      labelHi: 'स्वयंसेवक शिक्षक',
      value: '200+',
      icon: 'users',
      order: 5
    }
  ],

  // Initiatives with actual MinIO images
  initiatives: [
    {
      title: 'Digital Literacy Program',
      titleHi: 'डिजिटल साक्षरता कार्यक्रम',
      description: 'Empowering communities through technology education and digital skills development',
      descriptionHi: 'प्रौद्योगिकी शिक्षा और डिजिटल कौशल विकास के माध्यम से समुदायों को सशक्त बनाना',
      imageUrl: '/api/image-proxy/ragiji-images/1753810686862-IMG_3903.PNG',
      order: 1
    },
    {
      title: 'Women Entrepreneurship',
      titleHi: 'महिला उद्यमिता',
      description: 'Supporting women-led businesses and providing entrepreneurship training',
      descriptionHi: 'महिलाओं के नेतृत्व वाले व्यवसायों का समर्थन और उद्यमिता प्रशिक्षण प्रदान करना',
      imageUrl: '/api/image-proxy/ragiji-images/1753810689226-IMG_3917.JPG',
      order: 2
    },
    {
      title: 'Rural Education Centers',
      titleHi: 'ग्रामीण शिक्षा केंद्र',
      description: 'Bringing quality education to remote and underserved rural areas',
      descriptionHi: 'दूरदराज और वंचित ग्रामीण क्षेत्रों में गुणवत्तापूर्ण शिक्षा पहुंचाना',
      imageUrl: '/api/image-proxy/ragiji-images/1753810690419-IMG_3919.JPG',
      order: 3
    },
    {
      title: 'Healthcare Awareness',
      titleHi: 'स्वास्थ्य जागरूकता',
      description: 'Promoting community health education and preventive healthcare practices',
      descriptionHi: 'सामुदायिक स्वास्थ्य शिक्षा और निवारक स्वास्थ्य प्रथाओं को बढ़ावा देना',
      imageUrl: '/api/image-proxy/ragiji-images/1753810691637-IMG_3922.JPG',
      order: 4
    },
    {
      title: 'Skill Development',
      titleHi: 'कौशल विकास',
      description: 'Vocational training programs to enhance employability of youth',
      descriptionHi: 'युवाओं की रोजगार क्षमता बढ़ाने के लिए व्यावसायिक प्रशिक्षण कार्यक्रम',
      imageUrl: '/api/image-proxy/ragiji-images/1753810692942-IMG_4624.JPG',
      order: 5
    }
  ],

  // Centers with actual MinIO images
  centers: [
    {
      name: 'Delhi Learning Center',
      nameHi: 'दिल्ली शिक्षा केंद्र',
      location: 'New Delhi',
      locationHi: 'नई दिल्ली',
      description: 'Main educational hub with digital facilities and comprehensive learning programs',
      descriptionHi: 'डिजिटल सुविधाओं और व्यापक शिक्षण कार्यक्रमों के साथ मुख्य शैक्षिक केंद्र',
      imageUrl: '/api/image-proxy/ragiji-images/1753794709478-IMG20250510152459.jpg',
      contactInfo: 'delhi@ragijifoundation.com'
    },
    {
      name: 'Mumbai Skills Hub',
      nameHi: 'मुंबई कौशल केंद्र',
      location: 'Mumbai',
      locationHi: 'मुंबई',
      description: 'Vocational training center focused on skill development and job placement',
      descriptionHi: 'कौशल विकास और नौकरी में नियुक्ति पर केंद्रित व्यावसायिक प्रशिक्षण केंद्र',
      imageUrl: '/api/image-proxy/ragiji-images/1753809654684-08B3E2FF-1EAA-4134-B1E8-170C0EDF4BB1.JPG',
      contactInfo: 'mumbai@ragijifoundation.com'
    },
    {
      name: 'Bangalore Tech Center',
      nameHi: 'बैंगलोर तकनीकी केंद्र',
      location: 'Bangalore',
      locationHi: 'बैंगलोर',
      description: 'Technology and coding education center for digital transformation',
      descriptionHi: 'डिजिटल परिवर्तन के लिए प्रौद्योगिकी और कोडिंग शिक्षा केंद्र',
      imageUrl: '/api/image-proxy/ragiji-images/1753809656216-32D7911A-94C7-4462-8214-752F33370726.JPG',
      contactInfo: 'bangalore@ragijifoundation.com'
    }
  ],

  // Careers
  careers: [
    {
      title: 'Education Program Manager',
      titleHi: 'शिक्षा कार्यक्रम प्रबंधक',
      slug: 'education-program-manager',
      location: 'Delhi',
      locationHi: 'दिल्ली',
      type: 'Full-time',
      typeHi: 'पूर्णकालिक',
      description: 'Lead our educational initiatives and manage program implementation across multiple centers',
      descriptionHi: 'हमारी शैक्षिक पहलों का नेतृत्व करें और कई केंद्रों में कार्यक्रम कार्यान्वयन का प्रबंधन करें',
      requirements: 'Minimum 5 years experience in education sector, Masters degree preferred',
      requirementsHi: 'शिक्षा क्षेत्र में न्यूनतम 5 वर्ष का अनुभव, मास्टर डिग्री वांछित',
      isActive: true
    },
    {
      title: 'Social Media Coordinator',
      titleHi: 'सोशल मीडिया समन्वयक',
      slug: 'social-media-coordinator',
      location: 'Remote',
      locationHi: 'दूरस्थ',
      type: 'Part-time',
      typeHi: 'अंशकालिक',
      description: 'Manage our social media presence and create engaging content for various platforms',
      descriptionHi: 'हमारी सोशल मीडिया उपस्थिति का प्रबंधन करें और विभिन्न प्लेटफॉर्म के लिए आकर्षक सामग्री बनाएं',
      requirements: 'Experience with content creation, social media management, and basic design skills',
      requirementsHi: 'सामग्री निर्माण, सोशल मीडिया प्रबंधन, और बुनियादी डिजाइन कौशल के साथ अनुभव',
      isActive: true
    }
  ],

  // Gallery items with actual MinIO images
  gallery: [
    {
      title: 'Student Achievement Ceremony',
      titleHi: 'छात्र उपलब्धि समारोह',
      description: 'Annual ceremony celebrating student achievements and success stories',
      descriptionHi: 'छात्र उपलब्धियों और सफलता की कहानियों का जश्न मनाने वाला वार्षिक समारोह',
      imageUrl: '/api/image-proxy/ragiji-images/1753791402213-hanuman-logo-png_seeklogo-325080.png',
      category: 'Events',
      categoryHi: 'कार्यक्रम'
    },
    {
      title: 'Learning Workshop',
      titleHi: 'शिक्षण कार्यशाला',
      description: 'Interactive workshop on digital literacy and skill development',
      descriptionHi: 'डिजिटल साक्षरता और कौशल विकास पर इंटरैक्टिव कार्यशाला',
      imageUrl: '/api/image-proxy/ragiji-images/1753791435779-Vector.png',
      category: 'Programs',
      categoryHi: 'कार्यक्रम'
    },
    {
      title: 'Community Outreach',
      titleHi: 'सामुदायिक पहुंच',
      description: 'Foundation team engaging with local communities for educational programs',
      descriptionHi: 'शैक्षिक कार्यक्रमों के लिए स्थानीय समुदायों से जुड़ती हुई फाउंडेशन टीम',
      imageUrl: '/api/image-proxy/ragiji-images/1753791438329-Vector.svg',
      category: 'Outreach',
      categoryHi: 'पहुंच'
    },
    {
      title: 'Technology Training Session',
      titleHi: 'प्रौद्योगिकी प्रशिक्षण सत्र',
      description: 'Hands-on technology training for rural students',
      descriptionHi: 'ग्रामीण छात्रों के लिए व्यावहारिक प्रौद्योगिकी प्रशिक्षण',
      imageUrl: '/api/image-proxy/ragiji-images/1753810683938-IMG_3891.JPG',
      category: 'Education',
      categoryHi: 'शिक्षा'
    },
    {
      title: 'Success Stories Documentation',
      titleHi: 'सफलता की कहानियों का प्रलेखन',
      description: 'Capturing inspiring transformation stories from our beneficiaries',
      descriptionHi: 'हमारे लाभार्थियों की प्रेरणादायक परिवर्तन की कहानियों को कैप्चर करना',
      imageUrl: '/api/image-proxy/ragiji-images/1753791482058-placeholder-banner.jpg',
      category: 'Impact',
      categoryHi: 'प्रभाव'
    },
    {
      title: 'Educational Infrastructure',
      titleHi: 'शैक्षिक अवसंरचना',
      description: 'Modern learning facilities and educational infrastructure development',
      descriptionHi: 'आधुनिक शिक्षण सुविधाएं और शैक्षिक अवसंरचना विकास',
      imageUrl: '/api/image-proxy/ragiji-images/1753809733892-FCF34AB9-5088-4FDB-8C36-6FFCDCCE9A1D.JPG',
      category: 'Infrastructure',
      categoryHi: 'अवसंरचना'
    }
  ],

  // Awards with actual MinIO images
  awards: [
    {
      title: 'Best NGO Award 2023',
      titleHi: 'सर्वश्रेष्ठ एनजीओ पुरस्कार 2023',
      year: '2023',
      description: 'Recognized for outstanding contribution to education and community development',
      descriptionHi: 'शिक्षा और सामुदायिक विकास में उत्कृष्ट योगदान के लिए मान्यता',
      imageUrl: '/api/image-proxy/ragiji-images/1753809733893-3E1AC398-7F87-4DD1-BA77-E2FB3DBF23F3.JPG',
      organization: 'National Education Foundation',
      organizationHi: 'राष्ट्रीय शिक्षा फाउंडेशन'
    },
    {
      title: 'Digital Innovation Award',
      titleHi: 'डिजिटल नवाचार पुरस्कार',
      year: '2022',
      description: 'For innovative use of technology in rural education',
      descriptionHi: 'ग्रामीण शिक्षा में प्रौद्योगिकी के नवाचार उपयोग के लिए',
      imageUrl: '/api/image-proxy/ragiji-images/1753791413883-a94b8b83-6d1b-4e2a-8c4b-2b69e9e6b3d7.jpeg',
      organization: 'Tech for Good Initiative',
      organizationHi: 'टेक फॉर गुड इनिशिएटिव'
    }
  ],

  // Feature sections
  featureSections: [
    {
      identifier: 'homepage-hero',
      heading: 'Empowering Lives Through Education',
      headingHi: 'शिक्षा के माध्यम से जीवन को सशक्त बनाना',
      ctaText: 'Join Our Mission',
      ctaTextHi: 'हमारे मिशन में शामिल हों',
      ctaUrl: '/join-us'
    },
    {
      identifier: 'about-overview',
      heading: 'Our Impact Speaks',
      headingHi: 'हमारा प्रभाव बोलता है',
      ctaText: 'Learn More',
      ctaTextHi: 'और जानें',
      ctaUrl: '/our-story'
    }
  ],

  // Features with actual MinIO images
  features: [
    {
      title: 'Digital Education',
      titleHi: 'डिजिटल शिक्षा',
      description: 'Comprehensive digital literacy programs for all age groups',
      descriptionHi: 'सभी आयु समूहों के लिए व्यापक डिजिटल साक्षरता कार्यक्रम',
      mediaType: 'image',
      mediaUrl: '/api/image-proxy/ragiji-images/1753791438329-Vector.svg',
      thumbnail: '/api/image-proxy/ragiji-images/1753791435779-Vector.png',
      order: 1,
      section: 'education'
    },
    {
      title: 'Community Outreach',
      titleHi: 'सामुदायिक पहुंच',
      description: 'Grassroots programs connecting with local communities',
      descriptionHi: 'स्थानीय समुदायों से जुड़ने वाले जमीनी स्तर के कार्यक्रम',
      mediaType: 'image',
      mediaUrl: '/api/image-proxy/ragiji-images/1753809733892-FCF34AB9-5088-4FDB-8C36-6FFCDCCE9A1D.JPG',
      thumbnail: '/api/image-proxy/ragiji-images/1753809654684-08B3E2FF-1EAA-4134-B1E8-170C0EDF4BB1.JPG',
      order: 2,
      section: 'community'
    }
  ],

  // Banners with actual MinIO images
  banners: [
    {
      type: 'hero',
      title: 'Transform Lives Through Education',
      titleHi: 'शिक्षा के माध्यम से जीवन को बदलें',
      description: 'Join us in our mission to provide quality education and opportunities to underprivileged communities',
      descriptionHi: 'वंचित समुदायों को गुणवत्तापूर्ण शिक्षा और अवसर प्रदान करने के हमारे मिशन में शामिल हों',
      backgroundImage: '/api/image-proxy/ragiji-images/1753791482058-placeholder-banner.jpg'
    },
    {
      type: 'campaign',
      title: 'Support Rural Education',
      titleHi: 'ग्रामीण शिक्षा का समर्थन करें',
      description: 'Help us build more learning centers in rural areas',
      descriptionHi: 'ग्रामीण क्षेत्रों में अधिक शिक्षा केंद्र बनाने में हमारी मदद करें',
      backgroundImage: '/api/image-proxy/ragiji-images/1753794709478-IMG20250510152459.jpg'
    }
  ],

  // Our Story content
  ourStory: {
    title: 'Our Journey of Impact',
    titleHi: 'हमारी प्रभाव की यात्रा',
    content: `<article>
      <h2>The Beginning of UPAY</h2>
      <p>UPAY – Under Privileged Advancement by Youth started as a small initiative in 2010 with a simple yet powerful vision: to ensure that every child, regardless of their socio-economic background, has access to quality education and opportunities for growth.</p>
      
      <h3>Our Foundation</h3>
      <p>What began as weekend teaching sessions for street children in Delhi has now evolved into a comprehensive ecosystem supporting education, skill development, and community empowerment across multiple states in India.</p>
      
      <blockquote>
        "Education is the most powerful weapon which you can use to change the world." - Nelson Mandela
      </blockquote>
      
      <h3>Key Milestones</h3>
      <ul>
        <li><strong>2010:</strong> Started with 10 children in Delhi</li>
        <li><strong>2013:</strong> Launched online platform ApnaSaamaan.com</li>
        <li><strong>2015:</strong> Initiated mobile library program "Granth on Rath"</li>
        <li><strong>2020:</strong> Expanded digital education during COVID-19</li>
        <li><strong>2023:</strong> Reached 5000+ children across 25+ centers</li>
      </ul>
      
      <h3>Our Impact Today</h3>
      <p>Today, UPAY stands as a testament to the power of collective action and the unwavering belief that education can transform lives and communities. We continue to innovate and adapt our approaches to meet the evolving needs of the communities we serve.</p>
    </article>`,
    contentHi: `<article>
      <h2>उपाय की शुरुआत</h2>
      <p>उपाय - अंडर प्रिविलेज्ड एडवांसमेंट बाई यूथ की शुरुआत 2010 में एक छोटी पहल के रूप में हुई थी।</p>
    </article>`,
    media: {
      images: [
        {
          type: 'image',
          url: '/api/image-proxy/ragiji-images/1753791397423-logo.png',
          title: 'Our First Learning Center',
          caption: 'The humble beginning in Delhi, 2010'
        },
        {
          type: 'image',
          url: '/api/image-proxy/ragiji-images/1753791435779-Vector.png',
          title: 'Granth on Rath Mobile Library',
          caption: 'Bringing books to remote villages'
        }
      ]
    },
    isActive: true,
    version: 1
  },

  // Settings
  settings: {
    siteName: 'Ragi Ji Foundation',
    siteDescription: 'Empowering lives through education, skill development, and community outreach',
    primaryColor: '#228BE6',
    contactEmail: 'contact@ragijifoundation.com',
    socialLinks: {
      facebook: 'https://facebook.com/ragijifoundation',
      twitter: 'https://twitter.com/ragijifoundation',
      instagram: 'https://instagram.com/ragijifoundation',
      linkedin: 'https://linkedin.com/company/ragijifoundation',
      youtube: 'https://youtube.com/@ragijifoundation'
    },
    maintenance: false
  }
};

async function main() {
  try {
    console.log('🌱 Starting consolidated seed process...');

    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.$transaction(async (tx) => {
      // Delete in correct order to handle foreign key constraints
      await tx.blog.deleteMany();
      await tx.tag.deleteMany();
      await tx.category.deleteMany();
      await tx.user.deleteMany();
      await tx.successStory.deleteMany();
      await tx.stat.deleteMany();
      await tx.initiative.deleteMany();
      await tx.center.deleteMany();
      await tx.career.deleteMany();
      await tx.gallery.deleteMany();
      await tx.newsArticle.deleteMany();
      await tx.electronicMedia.deleteMany();
      await tx.banner.deleteMany();
      await tx.award.deleteMany();
      await tx.feature.deleteMany();
      await tx.featureSection.deleteMany();
      await tx.ourStory.deleteMany();
      await tx.settings.deleteMany();
      await tx.carousel.deleteMany();
    }, {
      timeout: 30000, // 30 seconds timeout for large transactions
    });
    console.log('✅ Existing data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash(seedData.adminUser.password, 10);
    const adminUser = await prisma.user.create({
      data: {
        ...seedData.adminUser,
        password: hashedPassword
      }
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create categories
    console.log('📚 Creating categories...');
    const categories = await Promise.all(
      seedData.categories.map(category => 
        prisma.category.create({ data: category })
      )
    );
    console.log(`✅ Created ${categories.length} categories`);

    // Create tags
    console.log('🏷️ Creating tags...');
    const tags = await Promise.all(
      seedData.tags.map(tag => 
        prisma.tag.create({ data: tag })
      )
    );
    console.log(`✅ Created ${tags.length} tags`);

    // Create content in parallel for better performance
    console.log('📝 Creating main content...');
    await Promise.all([
      // Success Stories
      Promise.all(
        seedData.successStories.map(story =>
          prisma.successStory.create({ data: story })
        )
      ).then(stories => console.log(`✅ Created ${stories.length} success stories`)),

      // Stats
      Promise.all(
        seedData.stats.map(stat =>
          prisma.stat.create({ data: stat })
        )
      ).then(stats => console.log(`✅ Created ${stats.length} statistics`)),

      // Initiatives
      Promise.all(
        seedData.initiatives.map(initiative =>
          prisma.initiative.create({ data: initiative })
        )
      ).then(initiatives => console.log(`✅ Created ${initiatives.length} initiatives`)),

      // Centers
      Promise.all(
        seedData.centers.map(center =>
          prisma.center.create({ data: center })
        )
      ).then(centers => console.log(`✅ Created ${centers.length} centers`)),

      // Careers
      Promise.all(
        seedData.careers.map(career =>
          prisma.career.create({ data: career })
        )
      ).then(careers => console.log(`✅ Created ${careers.length} career opportunities`)),

      // Gallery
      Promise.all(
        seedData.gallery.map(item =>
          prisma.gallery.create({ data: item })
        )
      ).then(items => console.log(`✅ Created ${items.length} gallery items`)),

      // Awards
      Promise.all(
        seedData.awards.map(award =>
          prisma.award.create({ data: award })
        )
      ).then(awards => console.log(`✅ Created ${awards.length} awards`)),

      // Feature Sections
      Promise.all(
        seedData.featureSections.map(section =>
          prisma.featureSection.create({ data: section })
        )
      ).then(sections => console.log(`✅ Created ${sections.length} feature sections`)),

      // Features
      Promise.all(
        seedData.features.map(feature =>
          prisma.feature.create({ data: feature })
        )
      ).then(features => console.log(`✅ Created ${features.length} features`)),

      // Banners
      Promise.all(
        seedData.banners.map(banner =>
          prisma.banner.create({ data: banner })
        )
      ).then(banners => console.log(`✅ Created ${banners.length} banners`))
    ]);

    // Create Our Story
    console.log('📖 Creating our story...');
    await prisma.ourStory.create({
      data: {
        ...seedData.ourStory,
        media: seedData.ourStory.media
      }
    });
    console.log('✅ Our story created');

    // Create/Update Settings
    console.log('⚙️ Creating settings...');
    await prisma.settings.upsert({
      where: { id: 1 },
      update: seedData.settings,
      create: { id: 1, ...seedData.settings }
    });
    console.log('✅ Settings configured');

    console.log('🎉 Consolidated seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Admin user: ${adminUser.email}`);
    console.log(`   • Categories: ${categories.length}`);
    console.log(`   • Tags: ${tags.length}`);
    console.log(`   • Success Stories: ${seedData.successStories.length}`);
    console.log(`   • Initiatives: ${seedData.initiatives.length}`);
    console.log(`   • Centers: ${seedData.centers.length}`);
    console.log(`   • Career Opportunities: ${seedData.careers.length}`);
    console.log(`   • Awards: ${seedData.awards.length}`);
    console.log(`   • Gallery Items: ${seedData.gallery.length}`);

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('📦 Database disconnected');
  }
}

// Execute the seed
main()
  .catch((error) => {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  });
