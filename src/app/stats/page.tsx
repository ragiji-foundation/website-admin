'use client';
import React from 'react';
import { StatsManager } from '@/components/Pages/StatsManager';




export default function StatsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Statistics Dashboard</h1>
      <StatsManager />
    </div>
  );
}