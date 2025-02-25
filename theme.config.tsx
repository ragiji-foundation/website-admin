import { DocsThemeConfig } from 'nextra-theme-docs'

const themeConfig: DocsThemeConfig = {
  logo: <span>Ragiji Foundation Admin</span>,
  project: {
    link: 'https://github.com/ragijifoundation/admin',
  },
  docsRepositoryBase: 'https://github.com/ragijifoundation/admin',
  footer: {
    text: '© 2025 Ragiji Foundation Admin Documentation',
  },
  head: (
    <>
      <title>Ragiji Foundation Admin</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Ragiji Foundation Admin" />
    </>
  ),
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  toc: {
    float: true,
    title: "Table of Contents"
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Ragiji Foundation Admin'
    }
  }
}

export default themeConfig
