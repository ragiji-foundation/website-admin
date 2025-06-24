export interface EducationCrisis {
  mainText: string;
  mainTextHi?: string;
  statistics: string;
  statisticsHi?: string;
  impact: string;
  impactHi?: string;
  imageUrl: string;
  statsImageUrl: string;
}

export interface TheNeedData {
  educationCrisis: EducationCrisis;
}
