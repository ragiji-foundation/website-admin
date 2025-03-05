import React from 'react';

import { CardsCarousel } from '@/components/Pages/CardsCarousel';




import { CarouselManager } from '@/components/Pages/CarouselManager';
import { Initiatives } from '@/components/Pages/Initiatives';


function App() {
  console.log('App rendered.');
  return (
    <div className="app-container"> 
      <CardsCarousel />
      <CarouselManager/>
{/* //TODO FEATURE */}
      <Initiatives />
{/* // TODO STATS */}

{/* // TODO SUCCESS STORIES */}
    </div>
  );
}

export default App;