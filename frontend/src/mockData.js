// Mock data for truck box arrangement application

export const mockTruckTypes = [
  {
    id: '1',
    name: 'Small Delivery Van',
    length: 3000, // mm
    width: 1800,  // mm
    type: 'van'
  },
  {
    id: '2', 
    name: 'Medium Box Truck',
    length: 6000, // mm
    width: 2400,  // mm
    type: 'box_truck'
  },
  {
    id: '3',
    name: 'Large Semi Trailer',
    length: 12000, // mm
    width: 2500,   // mm
    type: 'semi_trailer'
  },
  {
    id: '4',
    name: 'Standard Container',
    length: 12190, // mm (40ft container)
    width: 2438,   // mm
    type: 'container'
  }
];

export const mockBoxes = [
  {
    id: '1',
    name: 'Electronics Box A',
    length: 600,
    width: 400,
    quantity: 3,
    color: '#3B82F6' // Blue
  },
  {
    id: '2', 
    name: 'Furniture Package B',
    length: 1200,
    width: 800,
    quantity: 2,
    color: '#EF4444' // Red
  },
  {
    id: '3',
    name: 'Small Parts C',
    length: 300,
    width: 200,
    quantity: 5,
    color: '#10B981' // Green
  },
  {
    id: '4',
    name: 'Large Equipment D',
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

// Box packing algorithm with constraints
export const packingAlgorithm = {
  // Minimum and maximum spacing between boxes
  MIN_SPACING: 50, // mm
  MAX_SPACING: 100, // mm
  
  // Maximum overhang allowed
  MAX_OVERHANG: 100, // mm
  
  // Calculate optimal arrangement
  calculateArrangement: (truck, boxes) => {
    const arrangements = [];
    let currentY = 0;
    
    // Sort boxes by area (largest first) for better space utilization
    const sortedBoxes = [...boxes].sort((a, b) => 
      (b.length * b.width * b.quantity) - (a.length * a.width * a.quantity)
    );
    
    for (const box of sortedBoxes) {
      for (let i = 0; i < box.quantity; i++) {
        const placement = packingAlgorithm.findBestPosition(
          truck, 
          box, 
          arrangements, 
          `${box.name}-${i + 1}`
        );
        
        if (placement) {
          arrangements.push({
            boxId: box.id,
            instanceId: `${box.id}-${i + 1}`,
            x: placement.x,
            y: placement.y,
            width: placement.width,
            height: placement.height,
            rotated: placement.rotated,
            name: placement.name,
            color: box.color
          });
        }
      }
    }
    
    return arrangements;
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