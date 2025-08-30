import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Truck, 
  Package, 
  TrendingUp, 
  Award,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import TruckCanvas from './TruckCanvas';

const MultiTruckSolutionViewer = ({ solutions, onSolutionSelect, selectedSolution }) => {
  const [activeTab, setActiveTab] = useState('0');

  if (!solutions || solutions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No optimization solutions available</p>
          <p className="text-sm text-gray-500">Add boxes and select optimization to see results</p>
        </CardContent>
      </Card>
    );
  }

  const getStrategyIcon = (strategyName) => {
    switch (strategyName) {
      case 'Minimize Trucks': return <Truck className="h-4 w-4" />;
      case 'Maximize Efficiency': return <TrendingUp className="h-4 w-4" />;
      case 'Balanced Solution': return <Award className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStrategyColor = (strategyName) => {
    switch (strategyName) {
      case 'Minimize Trucks': return 'bg-blue-100 text-blue-800';
      case 'Maximize Efficiency': return 'bg-green-100 text-green-800';
      case 'Balanced Solution': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Optimal Truck Solutions
        </h3>
        <Badge variant="outline">
          {solutions.length} Options Available
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          {solutions.map((solution, index) => (
            <TabsTrigger key={index} value={index.toString()} className="text-xs">
              <div className="flex items-center gap-1">
                {getStrategyIcon(solution.strategy)}
                <span className="hidden sm:inline">{solution.strategy}</span>
                <span className="sm:hidden">Option {index + 1}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {solutions.map((solution, solutionIndex) => (
          <TabsContent key={solutionIndex} value={solutionIndex.toString()} className="space-y-4">
            {/* Solution Overview */}
            <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    {getStrategyIcon(solution.strategy)}
                    <span>{solution.strategy}</span>
                    <Badge className={getStrategyColor(solution.strategy)}>
                      Score: {solution.overallScore.toFixed(1)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSolutionSelect(solution)}
                    variant={selectedSolution?.strategy === solution.strategy ? "default" : "outline"}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {selectedSolution?.strategy === solution.strategy ? 'Selected' : 'Select'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">{solution.totalTrucks}</p>
                      <p className="text-gray-600 text-xs">Trucks Used</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">{solution.totalBoxesPlaced}/{solution.totalBoxes}</p>
                      <p className="text-gray-600 text-xs">Boxes Placed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="font-medium">{solution.overallUtilization.toFixed(1)}%</p>
                      <p className="text-gray-600 text-xs">Space Used</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="font-medium">${solution.totalCost}</p>
                      <p className="text-gray-600 text-xs">Est. Cost</p>
                    </div>
                  </div>
                </div>

                {solution.unplacedBoxes.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {solution.unplacedBoxes.length} boxes couldn't be placed optimally
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Truck Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Truck Arrangements ({solution.trucks.length} trucks)
              </h4>
              
              <div className="grid gap-4">
                {solution.trucks.map((truckSolution, truckIndex) => (
                  <Card key={truckSolution.truckId} className="bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Truck #{truckIndex + 1}
                          </Badge>
                          <span>{truckSolution.truckName}</span>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-600">
                          <span>{truckSolution.boxCount} boxes</span>
                          <span>•</span>
                          <span>{truckSolution.utilization.toFixed(1)}% used</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-4">
                        {/* Truck Visualization */}
                        <div className="lg:col-span-2">
                          <TruckCanvas 
                            truck={truckSolution.truckType}
                            arrangement={truckSolution.arrangements}
                            scale={0.08}
                          />
                        </div>
                        
                        {/* Truck Stats & Box Legend */}
                        <div className="space-y-3">
                          {/* Stats */}
                          <div className="bg-gray-50 p-3 rounded-md text-xs space-y-2">
                            <div className="flex justify-between">
                              <span>Dimensions:</span>
                              <span>{truckSolution.truckType.length.toLocaleString()} × {truckSolution.truckType.width.toLocaleString()}mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Utilization:</span>
                              <span className="font-medium text-green-600">{truckSolution.utilization.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Efficiency:</span>
                              <span className="font-medium text-blue-600">{truckSolution.efficiency.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Boxes Loaded:</span>
                              <span className="font-medium">{truckSolution.boxCount}</span>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Box Legend */}
                          <div>
                            <h5 className="font-medium text-xs mb-2">Loaded Boxes</h5>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {truckSolution.arrangements.map((box, boxIndex) => (
                                <div key={box.instanceId} className="flex items-center gap-2 text-xs">
                                  <div 
                                    className="w-3 h-3 rounded border border-gray-300 flex-shrink-0"
                                    style={{ backgroundColor: box.color }}
                                  />
                                  <span className="truncate">
                                    #{boxIndex + 1}: {box.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MultiTruckSolutionViewer;