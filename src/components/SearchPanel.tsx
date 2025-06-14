
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Search, User, Mail, Phone, MapPin, Database } from 'lucide-react';
import { SearchParams } from '@/types/divyadrishti';

interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isSearching: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, isSearching }) => {
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.7]);
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>([
    'Indian Government',
    'US Government',
    'UK Government'
  ]);

  const availableDatabases = [
    'Indian Government',
    'US Government', 
    'UK Government'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFaceImage(file);
    }
  };

  const handleDatabaseToggle = (database: string, checked: boolean) => {
    if (checked) {
      setSelectedDatabases(prev => [...prev, database]);
    } else {
      setSelectedDatabases(prev => prev.filter(db => db !== database));
    }
  };

  const handleSearch = () => {
    const searchParams: SearchParams = {
      faceImage: faceImage || undefined,
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      location: {
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
      },
      confidenceThreshold: confidenceThreshold[0],
      selectedDatabases: selectedDatabases.length > 0 ? selectedDatabases : undefined,
    };

    // Only include location if at least one field is filled
    if (!city && !state && !country) {
      delete searchParams.location;
    }

    onSearch(searchParams);
  };

  const hasSearchCriteria = faceImage || name || email || phone || city || state || country;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Multi-Modal Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-slate-300 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Government Databases
          </Label>
          <div className="space-y-2">
            {availableDatabases.map(database => (
              <div key={database} className="flex items-center space-x-2">
                <Checkbox
                  id={database}
                  checked={selectedDatabases.includes(database)}
                  onCheckedChange={(checked) => handleDatabaseToggle(database, checked as boolean)}
                />
                <Label htmlFor={database} className="text-slate-300 text-sm">
                  {database}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="face" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="face" className="data-[state=active]:bg-blue-600">Face</TabsTrigger>
            <TabsTrigger value="text" className="data-[state=active]:bg-blue-600">Text Data</TabsTrigger>
          </TabsList>

          <TabsContent value="face" className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Upload Face Image</Label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="face-upload"
                />
                <label htmlFor="face-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-slate-400">
                    {faceImage ? faceImage.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full or partial name"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300 flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300 flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State/Province"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label className="text-slate-300">
            Confidence Threshold: {Math.round(confidenceThreshold[0] * 100)}%
          </Label>
          <Slider
            value={confidenceThreshold}
            onValueChange={setConfidenceThreshold}
            max={1}
            min={0.1}
            step={0.05}
            className="w-full"
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={!hasSearchCriteria || isSearching || selectedDatabases.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
        >
          {isSearching ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Identity Database
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
