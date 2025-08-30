import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Edit, Plus, Truck } from 'lucide-react';
import { mockTruckTypes } from '../mockData';

const TruckManager = ({ onTruckSelect, selectedTruckId }) => {
  const [trucks, setTrucks] = useState(mockTruckTypes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    length: '',
    width: ''
  });

  const truckSizeCategories = [
    { label: 'Small (up to 4m)', min: 0, max: 4000, color: 'text-green-600' },
    { label: 'Medium (4-8m)', min: 4000, max: 8000, color: 'text-blue-600' },
    { label: 'Large (8-12m)', min: 8000, max: 12000, color: 'text-orange-600' },
    { label: 'Extra Large (12m+)', min: 12000, max: 20000, color: 'text-red-600' }
  ];

  const getTruckCategory = (length) => {
    return truckSizeCategories.find(cat => length >= cat.min && length < cat.max) || 
           truckSizeCategories[truckSizeCategories.length - 1];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const truckData = {
      id: editingTruck ? editingTruck.id : Date.now().toString(),
      name: formData.name,
      length: parseInt(formData.length),
      width: parseInt(formData.width)
    };

    if (editingTruck) {
      setTrucks(prev => prev.map(truck => 
        truck.id === editingTruck.id ? truckData : truck
      ));
    } else {
      setTrucks(prev => [...prev, truckData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      length: '',
      width: ''
    });
    setEditingTruck(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setFormData({
      name: truck.name,
      length: truck.length.toString(),
      width: truck.width.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (truckId) => {
    setTrucks(prev => prev.filter(truck => truck.id !== truckId));
    if (selectedTruckId === truckId) {
      onTruckSelect(null);
    }
  };

  const selectedTruck = trucks.find(t => t.id === selectedTruckId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Available Truck Sizes
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTruck(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Truck Type
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTruck ? 'Edit Truck Type' : 'Add New Truck Type'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Truck Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Large Semi Trailer"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="length">Length (mm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                    placeholder="12000"
                    min="1000"
                    max="20000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="width">Width (mm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                    placeholder="2500"
                    min="500"
                    max="5000"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingTruck ? 'Update Truck' : 'Add Truck'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Truck Selection */}
      <div>
        <Label className="text-sm font-medium">Select Truck for Loading</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {trucks.map(truck => {
            const category = getTruckCategory(truck.length);
            return (
              <Card 
                key={truck.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTruckId === truck.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-sm'
                }`}
                onClick={() => onTruckSelect(truck.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="truncate">{truck.name}</span>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(truck);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(truck.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Length: <span className="font-medium">{truck.length.toLocaleString()}mm</span></div>
                    <div>Width: <span className="font-medium">{truck.width.toLocaleString()}mm</span></div>
                    <div>Category: <span className={`font-medium ${category.color}`}>{category.label}</span></div>
                    <div className="text-xs text-gray-500 mt-2">
                      Area: {((truck.length * truck.width) / 1000000).toFixed(1)}m²
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Selected Truck Summary */}
      {selectedTruck && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{selectedTruck.name}</h3>
                <p className="text-sm text-blue-700">
                  {selectedTruck.length.toLocaleString()}mm × {selectedTruck.width.toLocaleString()}mm 
                  ({((selectedTruck.length * selectedTruck.width) / 1000000).toFixed(1)}m²)
                </p>
              </div>
              <div className="text-right text-xs text-blue-600">
                <div>Max Overhang: ±100mm</div>
                <div>Box Spacing: 50-100mm</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TruckManager;