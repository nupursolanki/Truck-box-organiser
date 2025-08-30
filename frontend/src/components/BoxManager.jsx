import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Trash2, Edit, Plus, Package, RotateCcw } from 'lucide-react';
import { mockBoxes } from '../mockData';

const BoxManager = ({ onBoxesChange, selectedTruckId, optimizationMode = 'single' }) => {
  const [boxes, setBoxes] = useState(mockBoxes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    length: '',
    width: '',
    quantity: '1',
    color: '#3B82F6'
  });

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const boxData = {
      id: editingBox ? editingBox.id : Date.now().toString(),
      name: formData.name,
      length: parseInt(formData.length),
      width: parseInt(formData.width),
      quantity: parseInt(formData.quantity),
      color: formData.color
    };

    let updatedBoxes;
    if (editingBox) {
      updatedBoxes = boxes.map(box => 
        box.id === editingBox.id ? boxData : box
      );
    } else {
      updatedBoxes = [...boxes, boxData];
    }

    setBoxes(updatedBoxes);
    onBoxesChange(updatedBoxes);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      length: '',
      width: '',
      quantity: '1',
      color: '#3B82F6'
    });
    setEditingBox(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (box) => {
    setEditingBox(box);
    setFormData({
      name: box.name,
      length: box.length.toString(),
      width: box.width.toString(),
      quantity: box.quantity.toString(),
      color: box.color
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (boxId) => {
    const updatedBoxes = boxes.filter(box => box.id !== boxId);
    setBoxes(updatedBoxes);
    onBoxesChange(updatedBoxes);
  };

  const getTotalBoxes = () => {
    return boxes.reduce((total, box) => total + box.quantity, 0);
  };

  const getTotalArea = () => {
    return boxes.reduce((total, box) => {
      return total + (box.length * box.width * box.quantity);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Box Management
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingBox(null)}
              disabled={!selectedTruckId && optimizationMode === 'single'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Box
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBox ? 'Edit Box' : 'Add New Box'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="boxName">Box Name/Identifier</Label>
                <Input
                  id="boxName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Electronics Package A"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boxLength">Length (mm)</Label>
                  <Input
                    id="boxLength"
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                    placeholder="600"
                    min="50"
                    max="5000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="boxWidth">Width (mm)</Label>
                  <Input
                    id="boxWidth"
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                    placeholder="400"
                    min="50"
                    max="5000"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="1"
                  min="1"
                  max="100"
                  required
                />
              </div>
              
              <div>
                <Label>Color Coding</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-md border-2 transition-all ${
                        formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingBox ? 'Update Box' : 'Add Box'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {(!selectedTruckId && optimizationMode === 'single') && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-800">
              Please select a truck first to start adding boxes.
            </p>
          </CardContent>
        </Card>
      )}
      
      {(optimizationMode === 'multi') && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-800">
              Multi-truck optimization mode: Add boxes and the system will automatically find optimal truck combinations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Box List */}
      {boxes.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Current Boxes</h3>
            <div className="text-sm text-gray-600">
              Total: {getTotalBoxes()} boxes | Area: {(getTotalArea() / 1000000).toFixed(2)}m²
            </div>
          </div>
          
          <div className="grid gap-3">
            {boxes.map(box => (
              <Card key={box.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: box.color }}
                      />
                      <div>
                        <h4 className="font-medium text-sm">{box.name}</h4>
                        <div className="text-xs text-gray-600 flex items-center gap-4">
                          <span>{box.length}mm × {box.width}mm</span>
                          <Badge variant="secondary" className="text-xs">
                            Qty: {box.quantity}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <RotateCcw className="h-3 w-3" />
                            Can rotate
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(box)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(box.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Area per box: {((box.length * box.width) / 1000000).toFixed(3)}m² | 
                    Total area: {((box.length * box.width * box.quantity) / 1000000).toFixed(3)}m²
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {boxes.length === 0 && selectedTruckId && (
        <Card className="border-gray-200">
          <CardContent className="pt-6 pb-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">No boxes added yet</p>
            <p className="text-xs text-gray-500">Add boxes to start planning your truck loading arrangement</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BoxManager;