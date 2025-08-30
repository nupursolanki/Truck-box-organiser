import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TruckManager from "./components/TruckManager";
import BoxManager from "./components/BoxManager";
import TruckCanvas from "./components/TruckCanvas";
import MultiTruckSolutionViewer from "./components/MultiTruckSolutionViewer";
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
  CheckCircle,
  Zap,
  Award
} from "lucide-react";
import { mockTruckTypes, packingAlgorithm } from "./mockData";

const TruckLoadingApp = () => {
  const [selectedTruckId, setSelectedTruckId] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [arrangement, setArrangement] = useState([]);
  const [multiTruckSolutions, setMultiTruckSolutions] = useState([]);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [optimizationMode, setOptimizationMode] = useState('single'); // 'single' or 'multi'
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  
  // Get current trucks from localStorage to use actual user data
  const [availableTrucks, setAvailableTrucks] = useState(() => {
    const savedTrucks = localStorage.getItem('userTrucks');
    return savedTrucks ? JSON.parse(savedTrucks) : mockTruckTypes;
  });

  const selectedTruck = availableTrucks.find(t => t.id === selectedTruckId);

  const calculateSingleTruckArrangement = () => {
    if (!selectedTruck || boxes.length === 0) {
      setArrangement([]);
      setStats({});
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const result = packingAlgorithm.calculateArrangement(selectedTruck, boxes);
      setArrangement(result);
      
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
        truckArea: truckArea / 1000000,
        usedArea: usedArea / 1000000,
        unplacedBoxes: totalBoxes - placedBoxes
      });
      
      setLoading(false);
    }, 800);
  };

  const calculateMultiTruckOptimization = () => {
    if (boxes.length === 0) {
      setMultiTruckSolutions([]);
      setSelectedSolution(null);
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const solutions = packingAlgorithm.calculateOptimalArrangements(mockTruckTypes, boxes);
      setMultiTruckSolutions(solutions);
      
      // Auto-select the best solution (first one)
      if (solutions.length > 0) {
        setSelectedSolution(solutions[0]);
        
        // Calculate combined stats for the selected solution
        const solution = solutions[0];
        setStats({
          totalBoxes: solution.totalBoxes,
          placedBoxes: solution.totalBoxesPlaced,
          utilization: solution.overallUtilization,
          efficiency: (solution.totalBoxesPlaced / solution.totalBoxes) * 100,
          unplacedBoxes: solution.unplacedBoxes.length,
          totalTrucks: solution.totalTrucks
        });
      }
      
      setLoading(false);
    }, 1200);
  };

  // Auto-calculate when mode, truck, or boxes change
  useEffect(() => {
    if (optimizationMode === 'single') {
      calculateSingleTruckArrangement();
    } else {
      calculateMultiTruckOptimization();
    }
  }, [selectedTruck, boxes, optimizationMode]);

  const handleOptimizationModeChange = (mode) => {
    setOptimizationMode(mode);
    if (mode === 'multi') {
      setSelectedTruckId(null); // Clear single truck selection for multi-truck mode
    }
  };

  const handleSolutionSelect = (solution) => {
    setSelectedSolution(solution);
    
    // Update stats for selected solution
    setStats({
      totalBoxes: solution.totalBoxes,
      placedBoxes: solution.totalBoxesPlaced,
      utilization: solution.overallUtilization,
      efficiency: (solution.totalBoxesPlaced / solution.totalBoxes) * 100,
      unplacedBoxes: solution.unplacedBoxes.length,
      totalTrucks: solution.totalTrucks
    });
  };

  const handleExportArrangement = () => {
    const exportData = optimizationMode === 'single' ? {
      mode: 'single',
      truck: selectedTruck,
      boxes: boxes,
      arrangement: arrangement,
      stats: stats,
      exportDate: new Date().toISOString()
    } : {
      mode: 'multi',
      solution: selectedSolution,
      allSolutions: multiTruckSolutions,
      boxes: boxes,
      stats: stats,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truck-loading-${optimizationMode}-${new Date().toISOString().split('T')[0]}.json`;
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
            
            {(arrangement.length > 0 || selectedSolution) && (
              <Button onClick={handleExportArrangement} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Layout
              </Button>
            )}
          </div>

          {/* Stats Overview */}
          {stats.totalBoxes > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
              
              {optimizationMode === 'multi' && (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Trucks Used</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {stats.totalTrucks || 0}
                        </p>
                      </div>
                      <Truck className="h-4 w-4 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Mode</p>
                      <p className="text-lg font-semibold text-indigo-600">
                        {optimizationMode === 'single' ? 'Single' : 'Multi'}
                      </p>
                    </div>
                    <Zap className="h-4 w-4 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Optimization Mode Selector */}
          <Card className="bg-white/90 backdrop-blur-sm mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Optimization Mode
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={optimizationMode === 'single' ? 'default' : 'outline'}
                  onClick={() => handleOptimizationModeChange('single')}
                  className="justify-start"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Single Truck
                </Button>
                <Button
                  variant={optimizationMode === 'multi' ? 'default' : 'outline'}
                  onClick={() => handleOptimizationModeChange('multi')}
                  className="justify-start"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Auto-Optimize Multiple Trucks
                </Button>
              </div>
              
              <p className="text-xs text-gray-600 mt-2">
                {optimizationMode === 'single' 
                  ? 'Select a specific truck and arrange boxes manually' 
                  : 'Automatically find optimal truck combinations with minimal waste'}
              </p>
            </CardContent>
          </Card>
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
                      optimizationMode={optimizationMode}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Loading Controls */}
            {boxes.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Loading Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={optimizationMode === 'single' ? calculateSingleTruckArrangement : calculateMultiTruckOptimization} 
                    className="w-full"
                    disabled={loading || (optimizationMode === 'single' && !selectedTruck)}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {optimizationMode === 'single' ? 'Calculating...' : 'Optimizing...'}
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        {optimizationMode === 'single' ? 'Recalculate Layout' : 'Find Optimal Solutions'}
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <Badge variant="secondary" className="text-xs">
                        {optimizationMode === 'single' ? 'Single Truck' : 'Multi-Truck Optimization'}
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
                    {optimizationMode === 'single' ? 'Single Truck Loading' : 'Multi-Truck Optimization'}
                  </span>
                  {(selectedTruck || selectedSolution) && (
                    <Badge variant="outline">
                      {optimizationMode === 'single' 
                        ? selectedTruck?.name  // Show exact user-entered truck name
                        : `${selectedSolution?.strategy} (${selectedSolution?.totalTrucks} trucks)`
                      }
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {optimizationMode === 'single' ? (
                  // Single Truck Mode
                  selectedTruck ? (
                    <div className="space-y-4">
                      <TruckCanvas 
                        truck={selectedTruck}
                        arrangement={arrangement}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Truck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">No Truck Selected</h3>
                      <p className="text-sm">Select a truck type to start planning your loading arrangement</p>
                    </div>
                  )
                ) : (
                  // Multi-Truck Mode
                  boxes.length > 0 ? (
                    <MultiTruckSolutionViewer
                      solutions={multiTruckSolutions}
                      onSolutionSelect={handleSolutionSelect}
                      selectedSolution={selectedSolution}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">Multi-Truck Optimization</h3>
                      <p className="text-sm">Add boxes to see optimal truck combinations with minimal space wastage</p>
                    </div>
                  )
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