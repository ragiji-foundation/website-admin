export default {
  logo: <span>Ragiji Foundation Admin</span>,
  project: {
    link: 'https://github.com/ragijifoundation/admin',
  },
  docsRepositoryBase: 'https://github.com/ragijifoundation/admin/tree/main/docs',
  footer: {
    text: '© 2024 Ragiji Foundation Admin Documentation',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Ragiji Foundation Admin'
    }
  }
} 