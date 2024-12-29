"use client"
// import { Modal, Button, Group, TextInput, JsonInput } from '@mantine/core';
// import { useState } from 'react';
// import axios from 'axios';

// function EditLinksModal() {
//   const [opened, setOpened] = useState(false);
//   const [links, setLinks] = useState([
//     { link: '/', label: 'HOME' },
//     {
//       link: '#1',
//       label: 'ABOUT US',
//       links: [
//         { link: '/the-need', label: 'THE NEED' },
//         { link: '/our-story', label: 'OUR STORY' },
//         { link: '/our-initiatives', label: 'OUR INITIATIVES' },
//         { link: '/success-stories', label: 'SUCCESS STORIES' },
//       ],
//     },
//     { link: '/awards', label: 'AWARDS' },
//     {
//       link: '#2',
//       label: 'MEDIA',
//       links: [
//         { link: '/news-coverage', label: 'NEWS COVERAGE' },
//         { link: '/blog', label: 'BLOGS' },
//         { link: '/electronic-media', label: 'ELECTRONIC MEDIA' },
//       ],
//     },
//   ]);

//   const handleEditLink = async () => {
//     try {
//       const response = await axios.post('/api/links', links);
//       console.log(response.data);
//       setOpened(false);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <>
//       <Button onClick={() => setOpened(true)}>Edit Links</Button>
//       <Modal
//         opened={opened}
//         onClose={() => setOpened(false)}
//         title="Edit Links"
//       >
//         <JsonInput
//           value={links}
//           onChange={setLinks}
//           label="Links"
//           description="Edit the links"
//         />
//         <Group position="right" mt="md">
//           <Button onClick={handleEditLink}>Save</Button>
//         </Group>
//       </Modal>
//     </>
//   );
// }

// export default EditLinksModal;


// import { Modal, Button, Group, Textarea } from '@mantine/core';
// import { useState } from 'react';
// import axios from 'axios';

// function EditLinksModal() {
//   const [opened, setOpened] = useState(false);
//   const [links, setLinks] = useState([
//     { link: '/', label: 'HOME' },
//     {
//       link: '#1',
//       label: 'ABOUT US',
//       links: [
//         { link: '/the-need', label: 'THE NEED' },
//         { link: '/our-story', label: 'OUR STORY' },
//         { link: '/our-initiatives', label: 'OUR INITIATIVES' },
//         { link: '/success-stories', label: 'SUCCESS STORIES' },
//       ],
//     },
//     { link: '/awards', label: 'AWARDS' },
//     {
//       link: '#2',
//       label: 'MEDIA',
//       links: [
//         { link: '/news-coverage', label: 'NEWS COVERAGE' },
//         { link: '/blog', label: 'BLOGS' },
//         { link: '/electronic-media', label: 'ELECTRONIC MEDIA' },
//       ],
//     },
//   ]);

//   const handleEditLink = async () => {
//     try {
//       const response = await axios.post('/api/links', links);
//       console.log(response.data);
//       setOpened(false);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <>
//       <Button onClick={() => setOpened(true)}>Edit Links</Button>
//       <Modal
//         opened={opened}
//         onClose={() => setOpened(false)}
//         size="auto"
//         title="Edit Links"
//         centered
//       >
//         <Textarea
//           value={JSON.stringify(links, null, 2)}
//           onChange={(e) => setLinks(JSON.parse(e.target.value))}
//           label="Links"
//           description="Edit the links"
//           minRows={10}
//         />
//         <Group position="right" mt="md">
//           <Button onClick={handleEditLink}>Save</Button>
//         </Group>
//       </Modal>
//     </>
//   );
// }

// export default EditLinksModal;


//-----------------------

// import { Modal, Button, Group, TextInput, Text, Center } from '@mantine/core';
// import { useState } from 'react';
// import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';

// const linksData = [
//   {
//     link: '/',
//     label: 'HOME',
//   },
//   {
//     link: '#1',
//     label: 'ABOUT US',
//     links: [
//       {
//         link: '/the-need',
//         label: 'THE NEED',
//       },
//       {
//         link: '/our-story',
//         label: 'OUR STORY',
//       },
//       {
//         link: '/our-initiatives',
//         label: 'OUR INITIATIVES',
//       },
//       {
//         link: '/success-stories',
//         label: 'SUCCESS STORIES',
//       },
//     ],
//   },
//   {
//     link: '/awards',
//     label: 'AWARDS',
//   },
//   {
//     link: '#2',
//     label: 'MEDIA',
//     links: [
//       {
//         link: '/news-coverage',
//         label: 'NEWS COVERAGE',
//       },
//       {
//         link: '/blog',
//         label: 'BLOGS',
//       },
//       {
//         link: '/electronic-media',
//         label: 'ELECTRONIC MEDIA',
//       },
//     ],
//   },
// ];

// function EditLinksModal() {
//   const [opened, setOpened] = useState(false);
//   const [formLinks, setFormLinks] = useState(linksData);

//   const handleEditLink = async () => {
//     try {
//       // Save the updated links
//       console.log(formLinks);
//       setOpened(false);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedLinks = [...formLinks];
//     updatedLinks[index][field] = value;
//     setFormLinks(updatedLinks);
//   };

//   const handleAddLink = (index) => {
//     const updatedLinks = [...formLinks];
//     updatedLinks[index].links.push({ link: '', label: '' });
//     setFormLinks(updatedLinks);
//   };

//   const handleRemoveLink = (index, linkIndex) => {
//     const updatedLinks = [...formLinks];
//     updatedLinks[index].links.splice(linkIndex, 1);
//     setFormLinks(updatedLinks);
//   };

//   return (
//     <>
//       <Button onClick={() => setOpened(true)} leftSection={<IconEdit size={18} />}>
//         Edit Links
//       </Button>
//       <Modal
//         opened={opened}
//         onClose={() => setOpened(false)}
//         title="Edit Links"
//         size="xl"
//       >
//         <Text size="lg" weight={500} mb="lg">
//           Edit your links below:
//         </Text>
//         {Array.isArray(formLinks) && formLinks.map((link, index) => (
//           <div key={index}>
//             <TextInput
//               label="Link"
//               value={link.link}
//               onChange={(e) => handleInputChange(index, 'link', e.target.value)}
//               mb="sm"
//             />
//             <TextInput
//               label="Label"
//               value={link.label}
//               onChange={(e) => handleInputChange(index, 'label', e.target.value)}
//               mb="lg"
//             />
//             {link.links && (
//               <div>
//                 <Text size="lg" weight={500} mb="sm">
//                   Sublinks:
//                 </Text>
//                 {Array.isArray(link.links) && link.links.map((sublink, sublinkIndex) => (
//                   <div key={sublinkIndex}>
//                     <TextInput
//                       label="Sublink"
//                       value={sublink.link}
//                       onChange={(e) => handleInputChange(index, `links.${sublinkIndex}.link`, e.target.value)}
//                       mb="sm"
//                     />
//                     <TextInput
//                       label="Sublink Label"
//                       value={sublink.label}
//                       onChange={(e) => handleInputChange(index, `links.${sublinkIndex}.label`, e.target.value)}
//                       mb="sm"
//                     />
//                     <Button
//                       onClick={() => handleRemoveLink(index, sublinkIndex)}
//                       leftSection={<IconTrash size={18} />}
//                       color="red"
//                       variant="outline"
//                       mb="sm"
//                     >
//                       Remove Sublink
//                     </Button>
//                   </div>
//                 ))}
//                 <Button
//                   onClick={() => handleAddLink(index)}
//                   leftSection={<IconPlus size={18} />}
//                   mb="lg"
//                 >
//                   Add Sublink
//                 </Button>
//               </div>
//             )}
//           </div>
//         ))}
//         <Center>
//           <Button onClick={handleEditLink}>Save</Button>
//         </Center>
//       </Modal>
//     </>
//   );
// }

// export default EditLinksModal;


// import { Modal, Button, Group, TextInput, Text, Center, Tree } from '@mantine/core';
// import { useState, useEffect } from 'react';
// import { IconEdit, IconPlus, IconTrash, IconChevronDown } from '@tabler/icons-react';

// function EditLinksModal() {
//   const [opened, setOpened] = useState(false);
//   const [links, setLinks] = useState([]);
//   const [formLinks, setFormLinks] = useState([]);

//   useEffect(() => {
//     const fetchLinks = async () => {
//       try {
//         const response = await fetch('/api/links', {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         setLinks(data.links);
//         setFormLinks(data.links);
//       } catch (error) {
//         console.error('Error fetching links:', error);
//       }
//     };

//     fetchLinks();
//   }, []);

//   const handleEditLink = async () => {
//     try {
//       // Save the updated links
//       console.log(formLinks);
//       setOpened(false);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedLinks = [...formLinks];
//     updatedLinks[index][field] = value;
//     setFormLinks(updatedLinks);
//   };

//   const handleAddLink = (index) => {
//     const updatedLinks = [...formLinks];
//     updatedLinks[index].children.push({ id: '', label: '', children: [] });
//     setFormLinks(updatedLinks);
//   };

//   const handleRemoveLink = (index, linkIndex) => {
//     const updatedLinks = [...formLinks];
//     updatedLinks[index].children.splice(linkIndex, 1);
//     setFormLinks(updatedLinks);
//   };

//   return (
//     <>
//       <Button onClick={() => setOpened(true)} leftSection={<IconEdit size={18} />}>
//         Edit Links
//       </Button>
//       <Modal
//         opened={opened}
//         onClose={() => setOpened(false)}
//         title="Edit Links"
//         size="lg"
//       >
//         <Text size="lg" weight={500} mb="lg">
//           Edit your links below:
//         </Text>
//         <Tree
//           data={formLinks}
//           levelOffset={23}
//           renderNode={({ node, expanded, hasChildren, elementProps }) => (
//             <Group gap={5} {...elementProps}>
//               {hasChildren && (
//                 <IconChevronDown
//                   size={18}
//                   style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
//                 />
//               )}

//               <span>{node.label}</span>
//             </Group>
//           )}
//         />
//         {Array.isArray(formLinks) && formLinks.map((link, index) => (
//           <div key={index}>
//             <TextInput
//               label="Link"
//               value={link.id}
//               onChange={(e) => handleInputChange(index, 'id', e.target.value)}
//               mb="sm"
//             />
//             <TextInput
//               label="Label"
//               value={link.label}
//               onChange={(e) => handleInputChange(index, 'label', e.target.value)}
//               mb="lg"
//             />
//             {link.children && (
//               <div>
//                 <Text size="lg" weight={500} mb="sm">
//                   Sublinks:
//                 </Text>
//                 {Array.isArray(link.children) && link.children.map((sublink, sublinkIndex) => (
//                   <div key={sublinkIndex}>
//                     <TextInput
//                       label="Sublink"
//                       value={sublink.id}
//                       onChange={(e) => handleInputChange(index, `children.${sublinkIndex}.id`, e.target.value)}
//                       mb="sm"
//                     />
//                     <TextInput
//                       label="Sublink Label"
//                       value={sublink.label}
//                       onChange={(e) => handleInputChange(index, `children.${sublinkIndex}.label`, e.target.value)}
//                       mb="sm"
//                     />
//                     <Button
//                       onClick={() => handleRemoveLink(index, sublinkIndex)}
//                       leftSection={<IconTrash size={18} />}
//                       color="red"
//                       variant="outline"
//                       mb="sm"
//                     >
//                       Remove Sublink
//                     </Button>
//                   </div>
//                 ))}
//                 <Button
//                   onClick={() => handleAddLink(index)}
//                   leftSection={<IconPlus size={18} />}
//                   mb="lg"
//                 >
//                   Add Sublink
//                 </Button>
//               </div>
//             )}
//           </div>
//         ))}
//         <Center>
//           <Button onClick={handleEditLink}>Save</Button>
//         </Center>
//       </Modal>
//     </>
//   );
// }

// export default EditLinksModal;



import { Modal, Button, Group, TextInput, Text, Center, Tree } from '@mantine/core';
import { useState, useEffect } from 'react';
import { IconEdit, IconPlus, IconTrash, IconChevronDown } from '@tabler/icons-react';

function EditLinksModal() {
  const [opened, setOpened] = useState(false);
  const [links, setLinks] = useState([]);
  const [formLinks, setFormLinks] = useState({});

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch('/api/links', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLinks(data.links);
        setFormLinks(data.links.reduce((acc, link) => ({ ...acc, [link.link]: link }), {}));
      } catch (error) {
        console.error('Error fetching links:', error);
      }
    };

    fetchLinks();
  }, []);

  const handleEditLink = async () => {
    try {
      // Save the updated links
      console.log(formLinks);
      setOpened(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (link, field, value) => {
    const updatedLinks = { ...formLinks };
    updatedLinks[link][field] = value;
    setFormLinks(updatedLinks);
  };

  const handleAddLink = (link) => {
    const updatedLinks = { ...formLinks };
    updatedLinks[link].links.push({ link: '', label: '' });
    setFormLinks(updatedLinks);
  };

  const handleRemoveLink = (link, linkIndex) => {
    const updatedLinks = { ...formLinks };
    updatedLinks[link].links.splice(linkIndex, 1);
    setFormLinks(updatedLinks);
  };

  return (
    <>
      <Button onClick={() => setOpened(true)} leftSection={<IconEdit size={18} />}>
        Edit Links
      </Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edit Links"
        size="lg"
      >
        <Text size="lg" weight={500} mb="lg">
          Edit your links below:
        </Text>
        {links.map((link) => (
          <div key={link.link}>
            <TextInput
              label="Link"
              value={link.link}
              onChange={(e) => handleInputChange(link.link, 'link', e.target.value)}
              mb="sm"
            />
            <TextInput
              label="Label"
              value={link.label}
              onChange={(e) => handleInputChange(link.link, 'label', e.target.value)}
              mb="lg"
            />
            {link.links && (
              <div>
                <Text size="lg" weight={500} mb="sm">
                  Sublinks:
                </Text>
                {link.links.map((sublink, sublinkIndex) => (
                  <div key={sublinkIndex}>
                    <TextInput
                      label="Sublink"
                      value={sublink.link}
                      onChange={(e) => handleInputChange(link.link, `links.${sublinkIndex}.link`, e.target.value)}
                      mb="sm"
                    />
                    <TextInput
                      label="Sublink Label"
                      value={sublink.label}
                      onChange={(e) => handleInputChange(link.link, `links.${sublinkIndex}.label`, e.target.value)}
                      mb="sm"
                    />
                    <Button
                      onClick={() => handleRemoveLink(link.link, sublinkIndex)}
                      leftSection={<IconTrash size={18} />}
                      color="red"
                      variant="outline"
                      mb="sm"
                    >
                      Remove Sublink
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => handleAddLink(link.link)}
                  leftSection={<IconPlus size={18} />}
                  mb="lg"
                >
                  Add Sublink
                </Button>
              </div>
            )}
          </div>
        ))}
        <Center>
          <Button onClick={handleEditLink}>Save</Button>
        </Center>
      </Modal>
    </>
  );
}

export default EditLinksModal;