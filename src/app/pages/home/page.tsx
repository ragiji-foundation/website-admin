import React from 'react';

import { CardsCarousel } from '@/components/Pages/CardsCarousel';
import { Foundation } from '@/components/Pages/Foundation';
import { StatsGroup } from '@/components/Pages/StatsGroup';
import { ArticlesCardsGrid } from '@/components/Pages/ArticlesCardsGrid';

import { SuccessStoriesContainer } from '@/components/Pages/SuccessStories';
import { CarouselManager } from '@/components/Pages/CarouselManager';
import { Initiatives } from '@/components/Pages/Initiatives';

function App() {
  console.log('App rendered.');
  return (
    <div className="app-container"> 
      <CardsCarousel />
      <CarouselManager/>
      <Foundation />
      <Initiatives />
      <StatsGroup />
      {/* <ArticlesCardsGrid /> */}
      <SuccessStoriesContainer />
    </div>
  );
}

export default App;