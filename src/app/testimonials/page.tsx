'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Testimonial } from '@prisma/client';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        const data = await response.json();
        setTestimonials(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Testimonials</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow">
            {testimonial.avatar && (
              <div className="relative w-16 h-16 mb-4">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  fill
                  className="rounded-full object-cover"
                  sizes="(max-width: 64px) 100vw, 64px"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold">{testimonial.name}</h2>
            <p className="text-gray-600">{testimonial.role}</p>
            <p className="mt-4">{testimonial.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 