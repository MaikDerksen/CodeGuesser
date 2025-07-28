
"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Language } from "@/ai/flows/generate-code-snippet";
import { useState, useEffect } from "react";

interface SettingsMenuProps {
  children: React.ReactNode;
  allLanguages: Language[];
  activeLanguages: Language[];
  onActiveLanguagesChange: (activeLanguages: Language[]) => void;
}

export function SettingsMenu({
  children,
  allLanguages,
  activeLanguages,
  onActiveLanguagesChange,
}: SettingsMenuProps) {

  const [selectedLanguages, setSelectedLanguages] = useState<Set<Language>>(new Set(activeLanguages));
  const [isOpen, setIsOpen] = useState(false);

  // When the activeLanguages prop changes (e.g. on initial load from localstorage),
  // update the internal state of the component.
  useEffect(() => {
    setSelectedLanguages(new Set(activeLanguages));
  }, [activeLanguages]);

  const handleCheckedChange = (language: Language, checked: boolean) => {
    const newSelection = new Set(selectedLanguages);
    if (checked) {
      newSelection.add(language);
    } else {
      newSelection.delete(language);
    }
    setSelectedLanguages(newSelection);
  };
  
  const handleSelectAll = () => {
    setSelectedLanguages(new Set(allLanguages));
  }
  
  const handleDeselectAll = () => {
    setSelectedLanguages(new Set());
  }

  const handleSaveChanges = () => {
    onActiveLanguagesChange(Array.from(selectedLanguages));
    setIsOpen(false);
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Language Settings</SheetTitle>
          <SheetDescription>
            Choose the programming languages you want to be quizzed on. If none are selected, all languages will be used.
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center gap-2 my-4">
          <Button variant="secondary" size="sm" onClick={handleSelectAll}>Select All</Button>
          <Button variant="secondary" size="sm" onClick={handleDeselectAll}>Deselect All</Button>
        </div>
        <ScrollArea className="h-[calc(100%-180px)] pr-4">
            <div className="grid grid-cols-2 gap-4">
            {allLanguages.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                <Checkbox
                    id={language}
                    checked={selectedLanguages.has(language)}
                    onCheckedChange={(checked) => handleCheckedChange(language, !!checked)}
                />
                <Label
                    htmlFor={language}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {language}
                </Label>
                </div>
            ))}
            </div>
        </ScrollArea>
        <SheetFooter className="mt-4">
          <SheetClose asChild>
             <Button onClick={handleSaveChanges}>Save Changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
