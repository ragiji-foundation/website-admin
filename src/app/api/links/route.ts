// // pages/api/links.js
// import { NextApiRequest, NextApiResponse } from 'next';

// const links = [
//   { link: '/', label: 'HOME' },
//   {
//     link: '#1',
//     label: 'ABOUT US',
//     links: [
//       { link: '/the-need', label: 'THE NEED' },
//       { link: '/our-story', label: 'OUR STORY' },
//       { link: '/our-initiatives', label: 'OUR INITIATIVES' },
//       { link: '/success-stories', label: 'SUCCESS STORIES' },
//     ],
//   },
//   { link: '/awards', label: 'AWARDS' },
//   {
//     link: '#2',
//     label: 'MEDIA',
//     links: [
//       { link: '/news-coverage', label: 'NEWS COVERAGE' },
//       { link: '/blog', label: 'BLOGS' },
//       { link: '/electronic-media', label: 'ELECTRONIC MEDIA' },
//     ],
//   },
// ];

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'GET') {
//     return res.status(200).json(links);
//   }

//   return res.status(405).json({ message: 'Method not allowed' });
// }

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const links = [
  { link: '/', label: 'HOME' },
  {
    link: '#1',
    label: 'ABOUT US',
    links: [
      { link: '/the-need', label: 'THE NEED' },
      { link: '/our-story', label: 'OUR STORY' },
      { link: '/our-initiatives', label: 'OUR INITIATIVES' },
      { link: '/success-stories', label: 'SUCCESS STORIES' },
    ],
  },
  { link: '/awards', label: 'AWARDS' },
  {
    link: '#2',
    label: 'MEDIA',
    links: [
      { link: '/news-coverage', label: 'NEWS COVERAGE' },
      { link: '/blog', label: 'BLOGS' },
      { link: '/electronic-media', label: 'ELECTRONIC MEDIA' },
    ],
  },
];

export const GET = async (req: NextRequest) => {
  try {
    // Verify the token - will throw an error if invalid.
    const tokenObject = req.cookies.get('authToken');
    const token = tokenObject!.value; // Access the 'value' property
    console.log("token from api: " + token)
    if (typeof token !== 'string') {
      throw new Error('Invalid token type');
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable not set!");
    }
    await jwtVerify(token, new TextEncoder().encode(secret));

    // If verification is successful, return the links.
    return NextResponse.json({ links }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching links:', errorMessage);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
};

export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
     // Verify the token - will throw an error if invalid.
     const tokenObject = req.cookies.get('authToken');
     const token = tokenObject!.value; // Access the 'value' property
     console.log("token from api: " + token)
     if (typeof token !== 'string') {
       throw new Error('Invalid token type');
     }
     const secret = process.env.JWT_SECRET;
     if (!secret) {
       throw new Error("JWT_SECRET environment variable not set!");
     }
     await jwtVerify(token, new TextEncoder().encode(secret)); 

    // Get the updated links from the request body.
    const updatedLinks = await req.json();

    // Update the links.
    links = updatedLinks;

    // Return a success response.
    return NextResponse.json({ message: 'Links updated successfully' }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error updating links:', errorMessage);
    return NextResponse.json({ message: 'Error updating links' }, { status: 500 });
  }
};