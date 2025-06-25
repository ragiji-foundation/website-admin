// Helper function to handle multilingual blog content
export const getLocalizedBlogContent = (blog: any, locale: string) => {
  if (locale === 'hi') {
    return {
      ...blog,
      title: blog.titleHi || blog.title,
      content: blog.contentHi || blog.content,
      authorName: blog.authorNameHi || blog.authorName,
      metaDescription: blog.metaDescriptionHi || blog.metaDescription,
      ogTitle: blog.ogTitleHi || blog.ogTitle,
      ogDescription: blog.ogDescriptionHi || blog.ogDescription,
    };
  }
  return blog;
};

// Update the blog API to handle localized content properly