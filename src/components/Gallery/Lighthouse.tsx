import React, { useState, useCallback } from 'react';
import { Modal, Stack, Image, Text, Group, Badge, CopyButton, ActionIcon, Tooltip, Button, Box } from '@mantine/core';
import { IconCheck, IconCopy, IconDownload, IconTrash, IconX, IconCrop, IconPhoto } from '@tabler/icons-react';
import Cropper, { Area } from 'react-easy-crop';
import { GalleryItem } from '@/types/gallery';

interface LighthouseProps {
  opened: boolean;
  onClose: () => void;
  item: GalleryItem | null;
  onDelete?: (id: string | number) => void;
  language?: 'en' | 'hi';
}

type Crop = { x: number; y: number };

function getCroppedImg(imageSrc: string, crop: Area, zoom: number, watermarkSrc?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = image.naturalWidth / image.width;
      const cropX = crop.x * scale;
      const cropY = crop.y * scale;
      const cropWidth = crop.width * scale;
      const cropHeight = crop.height * scale;
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );
      if (watermarkSrc) {
        const watermark = new window.Image();
        watermark.crossOrigin = 'anonymous';
        watermark.src = watermarkSrc;
        watermark.onload = () => {
          // Draw watermark at bottom right, scaled to 25% of width
          const scaleFactor = 0.25;
          const w = canvas.width * scaleFactor;
          const h = (watermark.height / watermark.width) * w;
          // Ensure watermark is fully loaded before drawing
          setTimeout(() => {
            ctx.globalAlpha = 0.5;
            ctx.drawImage(watermark, canvas.width - w - 10, canvas.height - h - 10, w, h);
            ctx.globalAlpha = 1;
            resolve(canvas.toDataURL('image/jpeg'));
          }, 100);
        };
        watermark.onerror = reject;
      } else {
        resolve(canvas.toDataURL('image/jpeg'));
      }
    };
    image.onerror = reject;
  });
}

export function Lighthouse({ opened, onClose, item, onDelete, language = 'en' }: LighthouseProps) {
  const [editMode, setEditMode] = useState<'none' | 'crop'>('none');
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImg, setCroppedImg] = useState<string | null>(null);
  const [watermark, setWatermark] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  if (!item) return null;
  const isVideo = item.type === 'video' || (item.imageUrl || item.url || '').match(/\.(mp4|webm|ogg)$/i);
  const mediaUrl = item.imageUrl || item.url || '';
  const title = language === 'hi' ? item.titleHi || item.title : item.title;
  const description = language === 'hi' ? item.descriptionHi || item.description : item.description;

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    const result = await getCroppedImg(mediaUrl, croppedAreaPixels, zoom, watermark || undefined);
    setCroppedImg(result);
    setEditMode('none');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = croppedImg || mediaUrl;
    link.download = title || 'media';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      padding="xl"
      title={title}
    >
      <Stack>
        {isVideo ? (
          <video src={mediaUrl} controls style={{ width: '100%', maxHeight: 400, borderRadius: 8, background: '#000' }} />
        ) : editMode === 'crop' ? (
          <Box style={{ position: 'relative', width: '100%', height: 400, background: '#222' }}>
            <Cropper
              image={mediaUrl}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <Button mt="md" onClick={handleCrop} leftSection={<IconCheck size={16} />}>Apply Crop</Button>
          </Box>
        ) : (
          <Image src={croppedImg || mediaUrl} alt={title} fit="contain" height={400} />
        )}
        {description && (
          <Text size="sm" c="dimmed">{description}</Text>
        )}
        <Group>
          <Badge size="lg">{item.category}</Badge>
          <CopyButton value={mediaUrl}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied!' : 'Copy URL'}>
                <ActionIcon color={copied ? 'teal' : 'blue'} variant="light" onClick={copy}>
                  {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          <Tooltip label="Download">
            <ActionIcon color="blue" variant="light" onClick={handleDownload}>
              <IconDownload size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Crop">
            <ActionIcon color="blue" variant="light" onClick={() => setEditMode('crop')}>
              <IconCrop size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add Watermark">
            <ActionIcon color="blue" variant="light" component="label">
              <IconPhoto size={18} />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = ev => setWatermark(ev.target?.result as string);
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
              />
            </ActionIcon>
          </Tooltip>
          {onDelete && (
            <Tooltip label="Delete">
              <ActionIcon color="red" variant="light" onClick={() => onDelete(item.id)}>
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Close">
            <ActionIcon color="gray" variant="light" onClick={onClose}>
              <IconX size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
    </Modal>
  );
}
