
"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw, Layers, Zap, Milestone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidLucideIcon } from '@/lib/utils'; 

// Import the new JSON data
import type { Flashcard, FlashcardCategory } from '@/data/mockData'; 
import flashcardCategoriesData from '@/data/flashcards/categories.json';
import englishFlashcards from '@/data/flashcards/english.json';
import itFlashcards from '@/data/flashcards/it.json';
import businessFlashcards from '@/data/flashcards/business.json';
import digitalMarketingFlashcards from '@/data/flashcards/digital_marketing.json';

const flashCardsPageTranslations = {
  en: {
    pageTitle: "Flash Cards",
    pageDescription: "Select a category to start learning.",
    selectCategory: "Select Category",
    flipCard: "Flip Card",
    nextCard: "Next",
    prevCard: "Previous",
    term: "Term",
    definition: "Definition",
    example: "Example:",
    pronunciation: "Pronunciation:",
    noCardsInCategory: "No flashcards available in this category yet.",
    noCategories: "No flashcard categories available.",
    cardProgress: "Card {current} of {total}",
    allCategories: "All Categories (Combined)",
  },
  my: {
    pageTitle: "ကတ်ပြားများ",
    pageDescription: "လေ့လာရန် အမျိုးအစားတစ်ခုကို ရွေးချယ်ပါ။",
    selectCategory: "အမျိုးအစား ရွေးပါ",
    flipCard: "ကတ်လှန်ပါ",
    nextCard: "နောက်တစ်ခု",
    prevCard: "ယခင်",
    term: "ဝေါဟာရ",
    definition: "အဓိပ္ပါယ်",
    example: "ဥပမာ:",
    pronunciation: "အသံထွက်:",
    noCardsInCategory: "ဤအမျိုးအစားတွင် လောလောဆယ် ကတ်ပြားများ မရှိသေးပါ။",
    noCategories: "ကတ်ပြားအမျိုးအစားများ မရှိသေးပါ။",
    cardProgress: "ကတ် {current} / {total}",
    allCategories: "အမျိုးအစားအားလုံး (ပေါင်းစည်း)",
  }
};


// Helper to map category IDs to their respective flashcard data arrays
const flashcardDataMap: Record<string, Flashcard[]> = {
  'fc_cat_english': englishFlashcards,
  'fc_cat_it': itFlashcards,
  'fc_cat_business': businessFlashcards,
  'fc_cat_digital_marketing': digitalMarketingFlashcards,
};

export default function FlashCardsClient() {
  const { language } = useLanguage();
  const t = flashCardsPageTranslations[language];

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsForCategory, setCardsForCategory] = useState<Flashcard[]>([]);
  const [availableCategories, setAvailableCategories] = useState<FlashcardCategory[]>([]);

  useEffect(() => {
    // Set categories from imported JSON
    setAvailableCategories(flashcardCategoriesData as FlashcardCategory[]);
  }, []);

  useEffect(() => {
    let activeCards: Flashcard[] = [];
    if (selectedCategoryId === 'all') {
      // Combine all flashcards from the map
      activeCards = Object.values(flashcardDataMap).flat();
    } else if (flashcardDataMap[selectedCategoryId]) {
      activeCards = flashcardDataMap[selectedCategoryId];
    }
    setCardsForCategory(activeCards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [selectedCategoryId]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleFlipCard = () => setIsFlipped(!isFlipped);

  const handleNextCard = () => {
    if (cardsForCategory.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cardsForCategory.length);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
     if (cardsForCategory.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + cardsForCategory.length) % cardsForCategory.length);
      setIsFlipped(false);
    }
  };

  const currentCard = cardsForCategory.length > 0 ? cardsForCategory[currentCardIndex] : null;
  const progress = cardsForCategory.length > 0 ? ((currentCardIndex + 1) / cardsForCategory.length) * 100 : 0;

  return (
    <div className="space-y-8 flex flex-col items-center pb-12 px-4">
      <section className="text-center max-w-2xl pt-4 md:pt-0">
        <Milestone className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary mb-2 md:mb-3" />
        <h1 className="text-xl md:text-2xl font-bold font-headline mb-1 md:mb-2">{t.pageTitle}</h1>
        <p className="text-sm md:text-base text-muted-foreground">{t.pageDescription}</p>
      </section>

      {availableCategories.length > 0 ? (
        <Card className="w-full max-w-md md:max-w-lg shadow-xl">
          <CardHeader>
            <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category-select" aria-label={t.selectCategory}>
                <SelectValue placeholder={t.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                {availableCategories.map(category => {
                  const IconComponent = isValidLucideIcon(category.iconName) ? LucideIcons[category.iconName] : Layers;
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center">
                        <IconComponent className="mr-2 h-4 w-4 text-muted-foreground" />
                        {category.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </CardHeader>
          
          {currentCard ? (
            <>
              <CardContent>
                <div
                  className="aspect-[3/2] w-full border rounded-lg p-4 md:p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-card hover:bg-muted/50 transition-colors select-none shadow-inner"
                  onClick={handleFlipCard}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleFlipCard()}
                >
                  {isFlipped ? (
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-xs md:text-sm text-muted-foreground">{t.definition}</p>
                      <h2 className="text-md md:text-xl font-semibold">{currentCard.definition}</h2>
                      {currentCard.example && <p className="text-xs md:text-sm italic mt-1"><span className="font-medium">{t.example}</span> {currentCard.example}</p>}
                      {currentCard.pronunciation && <p className="text-xs md:text-sm text-accent mt-1"><span className="font-medium">{t.pronunciation}</span> {currentCard.pronunciation}</p>}
                    </div>
                  ) : (
                    <div className="space-y-1 md:space-y-2">
                       <p className="text-xs md:text-sm text-muted-foreground">{t.term}</p>
                       <h1 className="text-xl md:text-3xl font-bold font-headline">{currentCard.term}</h1>
                    </div>
                  )}
                </div>
                 {cardsForCategory.length > 0 && (
                  <div className="mt-3 md:mt-4 text-center">
                    <Progress value={progress} className="w-full h-1 md:h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1 md:mt-1.5">
                        {t.cardProgress.replace('{current}', (currentCardIndex + 1).toString()).replace('{total}', cardsForCategory.length.toString())}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handlePrevCard} 
                  disabled={cardsForCategory.length <= 1}
                  className="w-full sm:w-auto whitespace-normal h-auto py-1.5 px-3 text-sm"
                >
                  <ChevronLeft className="mr-1 h-4 w-4 shrink-0" /> {t.prevCard}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleFlipCard}
                  className="w-full sm:w-auto whitespace-normal h-auto py-1.5 px-3 text-sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4 shrink-0" /> {t.flipCard}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleNextCard} 
                  disabled={cardsForCategory.length <= 1}
                  className="w-full sm:w-auto whitespace-normal h-auto py-1.5 px-3 text-sm"
                >
                  {t.nextCard} <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
                </Button>
              </CardFooter>
            </>
          ) : (
            <CardContent className="text-center py-10">
              <Zap className="mx-auto h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t.noCardsInCategory}</p>
            </CardContent>
          )}
        </Card>
      ) : (
        <Card className="w-full max-w-md md:max-w-lg shadow-xl">
            <CardContent className="text-center py-10">
                <Layers className="mx-auto h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{t.noCategories}</p>
                <p className="text-xs text-muted-foreground mt-1">Flashcard categories will appear here once configured.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
