// Mock data for truck box arrangement application

export const mockTruckTypes = [
  {
    id: '1',
    name: 'Compact Truck',
    length: 3000, // mm
    width: 1800   // mm
  },
  {
    id: '2', 
    name: 'Standard Truck',
    length: 6000, // mm
    width: 2400   // mm
  },
  {
    id: '3',
    name: 'Large Truck',
    length: 9000, // mm
    width: 2500   // mm
  },
  {
    id: '4',
    name: 'Extra Large Truck',
    length: 12000, // mm
    width: 2500    // mm
  },
  {
    id: '5',
    name: 'Small Truck',
    length: 4500, // mm
    width: 2000   // mm
  }
];

export const mockBoxes = [
  {
    id: '1',
    name: 'Electronics Box A',  // Preserved exactly as user entered
    length: 600,
    width: 400,
    quantity: 3,
    color: '#3B82F6' // Blue
  },
  {
    id: '2', 
    name: 'Furniture Package B',  // Preserved exactly as user entered
    length: 1200,
    width: 800,
    quantity: 2,
    color: '#EF4444' // Red
  },
  {
    id: '3',
    name: 'Small Parts C',  // Preserved exactly as user entered
    length: 300,
    width: 200,
    quantity: 5,
    color: '#10B981' // Green
  },
  {
    id: '4',
    name: 'Large Equipment D',  // Preserved exactly as user entered
    length: 1500,
    width: 1000,
    quantity: 1,
    color: '#F59E0B' // Yellow
  }
];

export const mockArrangements = [
  {
    id: '1',
    truckId: '2',
    boxes: [
      {
        boxId: '1',
        instanceId: '1-1',
        x: 100,
        y: 100,
        width: 600,
        height: 400,
        rotated: false,
        name: 'Electronics Box A-1'
      },
      {
        boxId: '1', 
        instanceId: '1-2',
        x: 800,
        y: 100,
        width: 600,
        height: 400,
        rotated: false,
        name: 'Electronics Box A-2'
      },
      {
        boxId: '2',
        instanceId: '2-1', 
        x: 100,
        y: 600,
        width: 1200,
        height: 800,
        rotated: false,
        name: 'Furniture Package B-1'
      },
      {
        boxId: '3',
        instanceId: '3-1',
        x: 1500,
        y: 100,
        width: 300,
        height: 200,
        rotated: false,
        name: 'Small Parts C-1'
      }
    ],
    utilization: 78.5,
    totalBoxes: 5
  }
];

// Multi-truck packing algorithm with automatic truck selection
export const packingAlgorithm = {
  // Minimum and maximum spacing between boxes
  MIN_SPACING: 50, // mm
  MAX_SPACING: 100, // mm
  
  // Maximum overhang allowed
  MAX_OVERHANG: 100, // mm
  
  // Calculate optimal multi-truck arrangements (returns multiple solution options)
  calculateOptimalArrangements: (availableTrucks, boxes) => {
    const solutions = [];
    
    // Generate 3 different optimization strategies focused on minimal trucks and space efficiency
    const strategies = [
      { name: 'Minimum Trucks', priority: 'truck_count' },
      { name: 'Space Efficient', priority: 'space_utilization' },
      { name: 'Optimal Balance', priority: 'balanced' }
    ];
    
    for (const strategy of strategies) {
      const solution = packingAlgorithm.optimizeMultiTruck(availableTrucks, boxes, strategy);
      if (solution.trucks.length > 0) {
        solutions.push(solution);
      }
    }
    
    return solutions.sort((a, b) => b.overallScore - a.overallScore);
  },
  
  // Multi-truck optimization algorithm with focus on minimizing trucks and avoiding space waste
  optimizeMultiTruck: (availableTrucks, boxes, strategy) => {
    const solution = {
      trucks: [],
      strategy: strategy.name,
      totalTrucks: 0,
      totalBoxesPlaced: 0,
      totalBoxes: boxes.reduce((sum, box) => sum + box.quantity, 0),
      overallUtilization: 0,
      overallScore: 0,
      unplacedBoxes: [],
      totalCost: 0,
      spaceWastage: 0
    };
    
    // Create expanded box list with individual instances
    let remainingBoxes = [];
    boxes.forEach(box => {
      for (let i = 0; i < box.quantity; i++) {
        remainingBoxes.push({
          ...box,
          instanceId: `${box.id}-${i + 1}`,
          instanceName: `${box.name}-${i + 1}`,
          quantity: 1
        });
      }
    });
    
    // Sort boxes by area (largest first for better packing)
    remainingBoxes.sort((a, b) => (b.length * b.width) - (a.length * a.width));
    
    // Sort trucks by area (smallest to largest for minimal waste)
    const sortedTrucks = [...availableTrucks].sort((a, b) => 
      (a.length * a.width) - (b.length * b.width)
    );
    
    let truckCounter = 1;
    
    while (remainingBoxes.length > 0) {
      const bestTruckChoice = packingAlgorithm.selectOptimalTruck(
        sortedTrucks, 
        remainingBoxes, 
        strategy
      );
      
      if (!bestTruckChoice) break;
      
      const truckArrangement = packingAlgorithm.calculateSingleTruckArrangement(
        bestTruckChoice.truck, 
        remainingBoxes
      );
      
      if (truckArrangement.arrangements.length === 0) break;
      
      // Calculate space wastage for this truck
      const truckArea = bestTruckChoice.truck.length * bestTruckChoice.truck.width;
      const usedArea = truckArrangement.arrangements.reduce((sum, arr) => 
        sum + (arr.width * arr.height), 0);
      const wastage = truckArea - usedArea;
      
      // Add truck to solution
      solution.trucks.push({
        truckId: `${bestTruckChoice.truck.id}-${truckCounter}`,
        truckType: bestTruckChoice.truck,
        truckName: `${bestTruckChoice.truck.name} #${truckCounter}`,
        arrangements: truckArrangement.arrangements,
        utilization: truckArrangement.utilization,
        boxCount: truckArrangement.arrangements.length,
        efficiency: truckArrangement.efficiency,
        wastedSpace: wastage / 1000000 // Convert to m²
      });
      
      // Remove placed boxes from remaining boxes
      const placedInstanceIds = truckArrangement.arrangements.map(arr => arr.instanceId);
      remainingBoxes = remainingBoxes.filter(box => !placedInstanceIds.includes(box.instanceId));
      
      solution.totalBoxesPlaced += truckArrangement.arrangements.length;
      solution.spaceWastage += wastage;
      truckCounter++;
      
      // Prevent infinite loops
      if (truckCounter > 15) break;
    }
    
    solution.totalTrucks = solution.trucks.length;
    solution.unplacedBoxes = remainingBoxes;
    
    // Calculate overall metrics
    if (solution.trucks.length > 0) {
      const totalTruckArea = solution.trucks.reduce((sum, truck) => 
        sum + (truck.truckType.length * truck.truckType.width), 0);
      const totalUsedArea = solution.trucks.reduce((sum, truck) => 
        sum + truck.arrangements.reduce((areaSum, arr) => 
          areaSum + (arr.width * arr.height), 0), 0);
      
      solution.overallUtilization = (totalUsedArea / totalTruckArea) * 100;
      solution.totalCost = solution.trucks.length * 1000; // Base cost per truck
      solution.spaceWastage = solution.spaceWastage / 1000000; // Convert to m²
      
      // Calculate strategy-based score with heavy penalty for multiple trucks
      const truckPenalty = (solution.totalTrucks - 1) * 20; // Heavy penalty for additional trucks
      const wastePenalty = solution.spaceWastage * 5; // Penalty for wasted space
      
      switch (strategy.priority) {
        case 'truck_count':
          solution.overallScore = (solution.totalBoxesPlaced / solution.totalBoxes) * 100 - truckPenalty - wastePenalty;
          break;
        case 'space_utilization':
          solution.overallScore = solution.overallUtilization - (truckPenalty * 0.5);
          break;
        case 'balanced':
          solution.overallScore = (solution.overallUtilization * 0.6) + 
                                 ((solution.totalBoxesPlaced / solution.totalBoxes) * 0.4 * 100) - 
                                 (truckPenalty * 0.3);
          break;
      }
    }
    
    return solution;
  },
  
  // Select optimal truck that minimizes count and waste
  selectOptimalTruck: (availableTrucks, remainingBoxes, strategy) => {
    const truckScores = [];
    
    for (const truck of availableTrucks) {
      const testArrangement = packingAlgorithm.calculateSingleTruckArrangement(truck, remainingBoxes);
      
      if (testArrangement.arrangements.length > 0) {
        const truckArea = truck.length * truck.width;
        const usedArea = testArrangement.arrangements.reduce((sum, arr) => 
          sum + (arr.width * arr.height), 0);
        const wasteRatio = (truckArea - usedArea) / truckArea;
        const boxFitRatio = testArrangement.arrangements.length / remainingBoxes.length;
        
        let score = 0;
        
        // Prioritize trucks that fit more boxes with less waste
        const baseScore = (boxFitRatio * 100) + (testArrangement.utilization);
        const wasteDeduction = wasteRatio * 50; // Heavy penalty for waste
        const sizeBonus = testArrangement.arrangements.length * 10; // Bonus for fitting more boxes
        
        switch (strategy.priority) {
          case 'truck_count':
            // Strongly prefer trucks that fit the most boxes with acceptable waste
            score = baseScore + sizeBonus - wasteDeduction;
            break;
          case 'space_utilization':
            // Prefer highest utilization with minimal waste
            score = testArrangement.utilization - (wasteRatio * 30);
            break;
          case 'balanced':
            // Balance between box fit and waste minimization
            score = baseScore + (sizeBonus * 0.5) - (wasteDeduction * 0.7);
            break;
        }
        
        truckScores.push({
          truck: truck,
          score: score,
          arrangements: testArrangement.arrangements.length,
          utilization: testArrangement.utilization,
          wasteRatio: wasteRatio,
          boxFitRatio: boxFitRatio
        });
      }
    }
    
    return truckScores.sort((a, b) => b.score - a.score)[0];
  },
  
  // Calculate arrangement for a single truck
  calculateSingleTruckArrangement: (truck, boxes) => {
    const arrangements = [];
    const availableBoxes = [...boxes];
    
    // Sort boxes by area (largest first) for better space utilization
    availableBoxes.sort((a, b) => (b.length * b.width) - (a.length * a.width));
    
    for (let i = 0; i < availableBoxes.length; i++) {
      const box = availableBoxes[i];
      const placement = packingAlgorithm.findBestPosition(
        truck, 
        box, 
        arrangements, 
        box.instanceName || box.name  // Use exact user-entered name
      );
      
      if (placement) {
        arrangements.push({
          boxId: box.id,
          instanceId: box.instanceId || `${box.id}-${i + 1}`,
          x: placement.x,
          y: placement.y,
          width: placement.width,
          height: placement.height,
          rotated: placement.rotated,
          name: box.name, // Use exact user-entered box name
          color: box.color
        });
      }
    }
    
    const truckArea = truck.length * truck.width;
    const usedArea = arrangements.reduce((sum, arr) => sum + (arr.width * arr.height), 0);
    const utilization = truckArea > 0 ? (usedArea / truckArea) * 100 : 0;
    const efficiency = boxes.length > 0 ? (arrangements.length / boxes.length) * 100 : 0;
    
    return {
      arrangements,
      utilization: Math.min(utilization, 100),
      efficiency,
      usedArea: usedArea / 1000000, // Convert to m²
      truckArea: truckArea / 1000000 // Convert to m²
    };
  },
  
  // Legacy single truck calculation (for backward compatibility)
  calculateArrangement: (truck, boxes) => {
    if (!truck || boxes.length === 0) return [];
    
    const result = packingAlgorithm.calculateSingleTruckArrangement(truck, boxes);
    return result.arrangements;
  },
  
  // Find best position for a box
  findBestPosition: (truck, box, existingBoxes, name) => {
    const positions = [];
    
    // Try both orientations
    const orientations = [
      { width: box.length, height: box.width, rotated: false },
      { width: box.width, height: box.length, rotated: true }
    ];
    
    for (const orientation of orientations) {
      // Try different positions
      for (let x = -packingAlgorithm.MAX_OVERHANG; x <= truck.length + packingAlgorithm.MAX_OVERHANG - orientation.width; x += 100) {
        for (let y = -packingAlgorithm.MAX_OVERHANG; y <= truck.width + packingAlgorithm.MAX_OVERHANG - orientation.height; y += 100) {
          
          if (packingAlgorithm.isValidPosition(x, y, orientation, existingBoxes, truck)) {
            const score = packingAlgorithm.calculatePositionScore(x, y, orientation, truck);
            positions.push({
              x, y, 
              width: orientation.width,
              height: orientation.height,
              rotated: orientation.rotated,
              name,
              score
            });
          }
        }
      }
    }
    
    // Return best position (highest score)
    return positions.sort((a, b) => b.score - a.score)[0];
  },
  
  // Check if position is valid (no overlaps, proper spacing)
  isValidPosition: (x, y, dimensions, existingBoxes, truck) => {
    for (const existing of existingBoxes) {
      const spacing = packingAlgorithm.calculateSpacing(
        x, y, dimensions.width, dimensions.height,
        existing.x, existing.y, existing.width, existing.height
      );
      
      if (spacing < packingAlgorithm.MIN_SPACING) {
        return false;
      }
    }
    return true;
  },
  
  // Calculate spacing between two rectangles
  calculateSpacing: (x1, y1, w1, h1, x2, y2, w2, h2) => {
    const right1 = x1 + w1;
    const bottom1 = y1 + h1;
    const right2 = x2 + w2;
    const bottom2 = y2 + h2;
    
    // Check if rectangles overlap
    if (x1 < right2 && right1 > x2 && y1 < bottom2 && bottom1 > y2) {
      return 0; // Overlapping
    }
    
    // Calculate minimum distance
    const dx = Math.max(0, Math.max(x1 - right2, x2 - right1));
    const dy = Math.max(0, Math.max(y1 - bottom2, y2 - bottom1));
    
    return Math.sqrt(dx * dx + dy * dy);
  },
  
  // Calculate position score (prefer positions closer to origin, better utilization)
  calculatePositionScore: (x, y, dimensions, truck) => {
    const distanceFromOrigin = Math.sqrt(x * x + y * y);
    const utilizationBonus = (x + dimensions.width <= truck.length && y + dimensions.height <= truck.width) ? 1000 : 0;
    
    return utilizationBonus - distanceFromOrigin;
  }
};