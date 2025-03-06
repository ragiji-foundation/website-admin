import { SuccessStory } from '@/types/success-story';

export const mockSuccessStories: SuccessStory[] = [
  {
    id: '1',
    slug: 'from-street-to-school-journey-hope',
    title: 'From Street to School: A Journey of Hope',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'A Remarkable Transformation' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Coming from a challenging background, ' },
            { type: 'text', text: 'Rahul', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' found hope through our education program. With determination and support, he overcame numerous obstacles in his path.' }
          ]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Today, he is pursuing his ' },
            { type: 'text', text: 'engineering degree', marks: [{ type: 'italic' }] },
            { type: 'text', text: ' and inspiring others in his community.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Key Achievements' }]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Ranked top 5% in state examinations' }]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Received merit scholarship' }]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Mentors junior students in his free time' }]
                }
              ]
            }
          ]
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Education is the most powerful weapon which you can use to change the world.' },
              ]
            }
          ]
        }
      ]
    },
    personName: 'Rahul Kumar',
    location: 'Delhi',
    imageUrl: '/success-stories/story1.jpg',
    featured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    slug: 'empowering-women-through-skills',
    title: 'Empowering Women Through Skills',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'After joining our skill development program, ' },
            { type: 'text', text: 'Priya started her own tailoring business', marks: [{ type: 'bold' }] },
            { type: 'text', text: ', supporting her family and inspiring others in her community.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'From Learner to Business Owner' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Within just 8 months of training, Priya mastered various tailoring techniques and began taking orders from local shops. Her journey illustrates how practical skills can lead to ' },
            { type: 'text', text: 'financial independence', marks: [{ type: 'italic' }] },
            { type: 'text', text: ' and community development.' }
          ]
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Completed advanced stitching course' }]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Secured micro-loan for first sewing machine' }]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Now employs three other women from her village' }]
                }
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Visit her shop at ' },
            {
              type: 'text',
              text: 'Village Craft Center',
              marks: [{ type: 'link', attrs: { href: '#', target: '_blank', rel: 'noopener noreferrer' } }]
            },
            { type: 'text', text: ' to support this initiative.' }
          ]
        }
      ]
    },
    personName: 'Priya Singh',
    location: 'Mumbai',
    imageUrl: '/success-stories/story2.jpg',
    featured: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    slug: 'digital-literacy-changes-lives',
    title: 'Digital Literacy Changes Lives',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Learning computer skills opened new opportunities for Amit, who now works as a ' },
            { type: 'text', text: 'data entry specialist', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' at a local IT company.' }
          ]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'When Amit first joined our digital literacy program, he had never used a computer before. Coming from a farming family, technology seemed out of reach. ' },
            { type: 'text', text: 'His perseverance paid off', marks: [{ type: 'italic' }] },
            { type: 'text', text: ' as he quickly mastered essential software applications.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Skills Acquired' }]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Microsoft Office Suite ', marks: [{ type: 'bold' }] },
                    { type: 'text', text: '(Word, Excel, PowerPoint)' }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Basic data analysis' }]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Email communication' }]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Internet research' }]
                }
              ]
            }
          ]
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Before joining this program, I never imagined I could work in an office. Now I have a stable income and can support my family better than ever before.', marks: [{ type: 'italic' }] }
              ]
            }
          ]
        }
      ]
    },
    personName: 'Amit Sharma',
    location: 'Bangalore',
    imageUrl: '/success-stories/story3.jpg',
    featured: false,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
