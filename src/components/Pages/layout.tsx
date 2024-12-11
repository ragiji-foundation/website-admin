
// import '@mantine/core/styles.css';

// import { ColorSchemeScript, MantineProvider } from '@mantine/core';
// import { FooterLinks } from '@/components/Pages/FooterLinks';
// import { HeaderMenu } from '@/components/Pages/HeaderMenu';

// export const metadata = {
//   title: 'My Mantine app',
//   description: 'I have followed setup instructions carefully',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <ColorSchemeScript />
//       </head>
//       <body>
//         <MantineProvider>
//         <main>
//         <HeaderMenu/>
//  {children}
// <FooterLinks/>
//     </main>
//         </MantineProvider>
//       </body>
//     </html>
//   );
// }

import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { FooterLinks } from '@/components/Pages/FooterLinks';
import { HeaderMenu } from '@/components/Pages/HeaderMenu';
import Head from 'next/head'; // Import Head from next/head

export const metadata = {
  title: 'My Mantine app',
  description: 'I have followed setup instructions carefully',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head> {/* Use next/head's Head component */}
        <ColorSchemeScript />
        {/* Add other head elements here, e.g., */}
        {/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */}
      </Head>
      <body>
        <MantineProvider>
          <main>
            <HeaderMenu/>
            {children}
            <FooterLinks/>
          </main>
        </MantineProvider>
      </body>
    </html>
  );
}