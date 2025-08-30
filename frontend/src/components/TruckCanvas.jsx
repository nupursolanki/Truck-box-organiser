import React, { useEffect, useRef } from 'react';

const TruckCanvas = ({ truck, arrangement, scale = 0.1 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !truck) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Calculate scaling to fit truck in canvas with some padding
    const padding = 50;
    const availableWidth = canvasWidth - 2 * padding;
    const availableHeight = canvasHeight - 2 * padding;
    
    const scaleX = availableWidth / (truck.length + 200); // +200 for overhang
    const scaleY = availableHeight / (truck.width + 200);
    const actualScale = Math.min(scaleX, scaleY);
    
    // Center the truck
    const offsetX = (canvasWidth - (truck.length + 200) * actualScale) / 2 + 100 * actualScale;
    const offsetY = (canvasHeight - (truck.width + 200) * actualScale) / 2 + 100 * actualScale;
    
    // Draw truck outline
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.strokeRect(
      offsetX, 
      offsetY, 
      truck.length * actualScale, 
      truck.width * actualScale
    );
    
    // Draw truck fill
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(
      offsetX, 
      offsetY, 
      truck.length * actualScale, 
      truck.width * actualScale
    );
    
    // Draw overhang area (dotted lines)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    
    // Extended boundaries
    const extendedX = offsetX - 100 * actualScale;
    const extendedY = offsetY - 100 * actualScale;
    const extendedWidth = (truck.length + 200) * actualScale;
    const extendedHeight = (truck.width + 200) * actualScale;
    
    ctx.strokeRect(extendedX, extendedY, extendedWidth, extendedHeight);
    
    // Add labels
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    
    // Truck dimensions
    ctx.fillText(
      `${truck.length}mm`, 
      offsetX + (truck.length * actualScale) / 2, 
      offsetY - 10
    );
    
    ctx.save();
    ctx.translate(offsetX - 15, offsetY + (truck.width * actualScale) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${truck.width}mm`, 0, 0);
    ctx.restore();
    
    // Draw boxes if arrangement exists
    if (arrangement && arrangement.length > 0) {
      arrangement.forEach((box, index) => {
        const boxX = offsetX + box.x * actualScale;
        const boxY = offsetY + box.y * actualScale;
        const boxWidth = box.width * actualScale;
        const boxHeight = box.height * actualScale;
        
        // Draw box fill
        ctx.fillStyle = box.color || '#3B82F6';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Draw box outline
        ctx.globalAlpha = 1;
        ctx.strokeStyle = box.color || '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Draw box label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        
        const labelX = boxX + boxWidth / 2;
        const labelY = boxY + boxHeight / 2;
        
        // Box number
        ctx.fillText(`#${index + 1}`, labelX, labelY - 5);
        
        // Box name (truncated if too long)
        const name = box.name.length > 15 ? box.name.substring(0, 12) + '...' : box.name;
        ctx.font = '8px Inter, system-ui, sans-serif';
        ctx.fillText(name, labelX, labelY + 8);
        
        // Box dimensions
        ctx.fillText(`${box.width}×${box.height}`, labelX, labelY + 18);
      });
    }
    
    // Draw grid for reference
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.setLineDash([2, 2]);
    
    const gridSpacing = 500 * actualScale; // 500mm grid
    
    // Vertical grid lines
    for (let x = offsetX; x <= offsetX + truck.length * actualScale; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, offsetY + truck.width * actualScale);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = offsetY; y <= offsetY + truck.width * actualScale; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(offsetX, y);
      ctx.lineTo(offsetX + truck.length * actualScale, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    
  }, [truck, arrangement, scale]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 rounded-lg shadow-sm bg-white"
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 border-2 border-gray-600 bg-gray-100"></div>
            <span>Truck Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 border border-gray-400 border-dashed bg-transparent"></div>
            <span>Overhang Zone (±100mm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-blue-500 opacity-70"></div>
            <span>Loaded Boxes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckCanvas;