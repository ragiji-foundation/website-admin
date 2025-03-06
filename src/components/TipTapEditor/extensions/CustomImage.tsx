import { Image } from '@tiptap/extension-image'

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`
          }
        },
      },
      alignment: {
        default: 'left',
        parseHTML: element => element.style.textAlign,
        renderHTML: attributes => ({
          style: `text-align: ${attributes.alignment}`
        }),
      },
    }
  },
})