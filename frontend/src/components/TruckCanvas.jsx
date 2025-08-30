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
    
    // Add truck name at the top
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.fillText(
      truck.name, // Use exact user-entered truck name
      canvasWidth / 2, 
      30
    );
    
    // Add dimensions labels
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    
    // Truck dimensions - positioned to not overlap with content
    ctx.fillText(
      `${truck.length}mm`, 
      offsetX + (truck.length * actualScale) / 2, 
      offsetY - 15
    );
    
    ctx.save();
    ctx.translate(offsetX - 20, offsetY + (truck.width * actualScale) / 2);
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
        
        // Draw box label - only if box is large enough to show text clearly
        if (boxWidth > 40 && boxHeight > 25) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          
          const labelX = boxX + boxWidth / 2;
          const labelY = boxY + boxHeight / 2;
          
          // Box number
          ctx.fillText(`#${index + 1}`, labelX, labelY - 5);
          
          // Box name (truncated if too long) - use exact user-entered name
          const name = box.name.length > 12 ? box.name.substring(0, 10) + '..' : box.name;
          ctx.font = '8px Inter, system-ui, sans-serif';
          ctx.fillText(name, labelX, labelY + 6);
          
          // Box dimensions - only show if space allows
          if (boxHeight > 40) {
            ctx.fillText(`${box.width}×${box.height}`, labelX, labelY + 15);
          }
        } else {
          // For small boxes, just show the number
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${index + 1}`, boxX + boxWidth / 2, boxY + boxHeight / 2 + 2);
        }
      });
    }
    
    // Draw grid for reference
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
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
    </div>
  );
};

export default TruckCanvas;