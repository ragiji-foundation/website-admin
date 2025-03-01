import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOurStory() {
  try {
    // Clean existing data
    await Promise.all([
      prisma.timeline.deleteMany(),
      prisma.ourModel.deleteMany(),
      prisma.visionMission.deleteMany(),
      prisma.ourStory.deleteMany(),
    ]);

    // Seed OurStory
    await prisma.ourStory.create({
      data: {
        title: "Our Journey",
        content: `<article>
          <h2>The Beginning of Our Journey</h2>
          <p>UPAY – Under Privileged Advancement by Youth started as a small initiative in 2010...</p>
        </article>`,
        media: JSON.stringify([
          {
            type: "image",
            url: "/images/story/first-center.jpg",
            title: "Our First Center"
          }
        ]),
        isActive: true
      }
    });

    // Seed Model
    await prisma.ourModel.create({
      data: {
        description: "UPAY NGO empowers underprivileged communities through Education and Skill Development...",
        imageUrl: "/images/model/impact-model.jpg"
      }
    });

    // Seed Vision & Mission
    await prisma.visionMission.create({
      data: {
        vision: "A future where every child has a dignified childhood and equal opportunity.",
        mission: "To develop a sustainable ecosystem for the underprivileged by enabling, educating, and empowering.",
        visionIcon: "/images/icons/vision.svg",
        missionIcon: "/images/icons/mission.svg"
      }
    });

    // Seed Timeline
    const timelineData = [
      { year: "2011", title: "REGISTERED AS NGO", centers: 1, volunteers: 10, children: 60 },
      { year: "2013", title: "APNASAAMAAN.COM", centers: 3, volunteers: 40, children: 300 },
      { year: "2015", title: "GRANTH ON RATH", centers: 15, volunteers: 150, children: 800 },
      { year: "2020", title: "COVID-19 RELIEF", centers: 44, volunteers: 500, children: 2500 }
    ];

    await Promise.all(
      timelineData.map((event, index) =>
        prisma.timeline.create({
          data: {
            ...event,
            order: index
          }
        })
      )
    );

    console.log('✅ Our Story data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedOurStory()
  .catch((error) => {
    console.error('Error seeding data:', error);
    process.exit(1);
  });
