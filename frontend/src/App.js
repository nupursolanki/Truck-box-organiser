import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TruckManager from "./components/TruckManager";
import BoxManager from "./components/BoxManager";
import TruckCanvas from "./components/TruckCanvas";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Separator } from "./components/ui/separator";
import { 
  Truck, 
  Package, 
  Calculator, 
  Download, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { mockTruckTypes, packingAlgorithm } from "./mockData";

const TruckLoadingApp = () => {
  const [selectedTruckId, setSelectedTruckId] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [arrangement, setArrangement] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});

  const selectedTruck = mockTruckTypes.find(t => t.id === selectedTruckId);

  const calculateArrangement = () => {
    if (!selectedTruck || boxes.length === 0) {
      setArrangement([]);
      setStats({});
      return;
    }

    setLoading(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const result = packingAlgorithm.calculateArrangement(selectedTruck, boxes);
      setArrangement(result);
      
      // Calculate statistics
      const totalBoxes = boxes.reduce((sum, box) => sum + box.quantity, 0);
      const placedBoxes = result.length;
      const truckArea = selectedTruck.length * selectedTruck.width;
      const usedArea = result.reduce((sum, box) => sum + (box.width * box.height), 0);
      const utilization = (usedArea / truckArea) * 100;
      
      setStats({
        totalBoxes,
        placedBoxes,
        utilization: Math.min(utilization, 100),
        efficiency: (placedBoxes / totalBoxes) * 100,
        truckArea: truckArea / 1000000, // Convert to m²
        usedArea: usedArea / 1000000,
        unplacedBoxes: totalBoxes - placedBoxes
      });
      
      setLoading(false);
    }, 800);
  };

  // Auto-calculate when truck or boxes change
  useEffect(() => {
    calculateArrangement();
  }, [selectedTruck, boxes]);

  const handleExportArrangement = () => {
    const exportData = {
      truck: selectedTruck,
      boxes: boxes,
      arrangement: arrangement,
      stats: stats,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truck-loading-${selectedTruck?.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                Truck Loading Optimizer
              </h1>
              <p className="text-gray-600 mt-1">
                Optimize box arrangement with intelligent space utilization and visual planning
              </p>
            </div>
            
            {arrangement.length > 0 && (
              <Button onClick={handleExportArrangement} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Layout
              </Button>
            )}
          </div>

          {/* Stats Overview */}
          {stats.totalBoxes > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Placement Rate</p>
                      <p className="text-lg font-semibold text-green-600">
                        {stats.efficiency?.toFixed(1)}%
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Space Used</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {stats.utilization?.toFixed(1)}%
                      </p>
                    </div>
                    <Calculator className="h-4 w-4 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Boxes Placed</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {stats.placedBoxes}/{stats.totalBoxes}
                      </p>
                    </div>
                    <Package className="h-4 w-4 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Area Used</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {stats.usedArea?.toFixed(1)}m²
                      </p>
                    </div>
                    <Truck className="h-4 w-4 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="trucks" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="trucks">Trucks</TabsTrigger>
                <TabsTrigger value="boxes">Boxes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trucks" className="mt-4">
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <TruckManager 
                      onTruckSelect={setSelectedTruckId}
                      selectedTruckId={selectedTruckId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="boxes" className="mt-4">
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <BoxManager 
                      onBoxesChange={setBoxes}
                      selectedTruckId={selectedTruckId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Loading Controls */}
            {selectedTruck && boxes.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Loading Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={calculateArrangement} 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Recalculate Layout
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <Badge variant="secondary" className="text-xs">
                        Space Optimization
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Box Spacing:</span>
                      <span>50-100mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rotation:</span>
                      <span>Allowed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overhang:</span>
                      <span>±100mm</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {stats.unplacedBoxes > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-800">
                      <p className="font-medium">Placement Warning</p>
                      <p>{stats.unplacedBoxes} boxes couldn't be placed optimally. Consider:</p>
                      <ul className="text-xs mt-1 ml-4 list-disc">
                        <li>Selecting a larger truck</li>
                        <li>Reducing box quantities</li>
                        <li>Adjusting box dimensions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Visualization */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Loading Visualization
                  </span>
                  {selectedTruck && (
                    <Badge variant="outline">
                      {selectedTruck.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTruck ? (
                  <div className="space-y-4">
                    <TruckCanvas 
                      truck={selectedTruck}
                      arrangement={arrangement}
                    />
                    
                    {/* Box Legend */}
                    {arrangement.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-sm mb-3">Box Legend</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          {arrangement.map((box, index) => (
                            <div key={box.instanceId} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded border"
                                style={{ backgroundColor: box.color }}
                              />
                              <span>#{index + 1}: {box.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Truck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No Truck Selected</h3>
                    <p className="text-sm">Select a truck type to start planning your loading arrangement</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TruckLoadingApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;