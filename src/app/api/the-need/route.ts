// import { NextResponse } from 'next/server';
// import type { TheNeedData } from '@/types/the-need';

// export async function GET() {
//   try {
//     // This could come from a database or CMS in the future
//     const data: TheNeedData = {
//       educationCrisis: {
//         mainText: "Today, in India, almost 1 in 4 people are below the age of 14. It is a crucial position to be in, and the steps taken from here will determine the future of India's education. However, the truth is far from reality.",
//         statistics: "More than 50% of students in Grade 5 cannot read a Grade 2 text or solve a simple subtraction problem. Only 16% of children in Class 1 can read the text at the prescribed level, while almost 40% cannot even recognize letters. More than a quarter of Class 1 students in government schools are only 4 or 5 years old, younger than the recommended age. These younger children struggle more than others in all skills. At the same time, 36% in Class 1 are older than the Right to Education (RTE) Act (2009) mandated age of 6.",
//         impact: "Global research shows that 90% of brain growth occurs by age 5, meaning that the quality of early childhood education has a crucial impact on the development and long-term schooling of a child. Early childhood education has the potential to be the \"greatest and most powerful equalizer.\" With that in mind, UPAY today has achieved great strides in imparting education to young minds. With its humble beginnings in Kumbhari – a small town in Nagpur – UPAY now has expanded exponentially, paving the way for more wondrous achievements to come.",
//         imageUrl: "/images/child-education.jpg",
//         statsImageUrl: "/images/education-stats.jpg"
//       }
//     };

//     return NextResponse.json(data);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const content = await prisma.theNeed.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = await prisma.theNeed.create({
      data: {
        mainText: body.mainText,
        statistics: body.statistics,
        impact: body.impact,
        imageUrl: body.imageUrl,
        statsImageUrl: body.statsImageUrl,
        isPublished: body.isPublished
      }
    });
    
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const content = await prisma.theNeed.update({
      where: { id: body.id },
      data: {
        mainText: body.mainText,
        statistics: body.statistics,
        impact: body.impact,
        imageUrl: body.imageUrl,
        statsImageUrl: body.statsImageUrl,
        isPublished: body.isPublished,
        version: { increment: 1 }
      }
    });
    
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
