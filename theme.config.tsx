import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Ragiji Foundation Admin</span>,
  project: {
    link: 'https://github.com/ragijifoundation/admin',
  },
  docsRepositoryBase: 'https://github.com/ragijifoundation/admin',
  footer: {
    component: <div>© 2025 Ragiji Foundation Admin Documentation</div>,
  },
  head: (
    <>
      <title>Ragiji Foundation Admin</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Ragiji Foundation Admin" />
    </>
  ),
  sidebar: {
    defaultMenuCollapseLevel: 1
  },
  toc: {
    float: true
  }
}

export default config