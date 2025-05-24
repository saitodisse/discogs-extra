"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type SearchType = "release" | "master" | "artist" | "label";

export function SearchInput({
  initialQuery = "",
  initialType = "release" as SearchType,
}: {
  initialQuery?: string;
  initialType?: SearchType;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<SearchType>(initialType);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(
        `/discogs/search/${encodeURIComponent(query.trim())}?type=${type}`
      );
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-sm space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="default">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <RadioGroup
        value={type}
        onValueChange={(value) => setType(value as SearchType)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="release" id="release" />
          <Label htmlFor="release">Release</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="master" id="master" />
          <Label htmlFor="master">Master</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="artist" id="artist" />
          <Label htmlFor="artist">Artist</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="label" id="label" />
          <Label htmlFor="label">Label</Label>
        </div>
      </RadioGroup>
    </form>
  );
}
