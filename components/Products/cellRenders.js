'use client';
export const PriceCell = (p) => p.value != null ? `₹${Number(p.value).toFixed(2)}` : '';
export const StockBadge = (p) => {
  const { currentStock, minimumStock, maximumStock } = p.data;
  const status = currentStock < minimumStock ? 'low' : (currentStock > maximumStock ? 'over' : 'ok');
  const map = {
    low:  { bg:'#ff4d4f', text:'Low' },
    ok:   { bg:'#52c41a', text:'OK'  },
    over: { bg:'#faad14', text:'Over'}
  };
  const { bg, text } = map[status];
  return (
    <span style={{
      padding:'2px 8px', borderRadius:12, color:'#fff', fontSize:12, background:bg
    }}>{text} ({p.data.currentStock})</span>
  );
};
export const ImageThumb = (p) => {
  const src = (p.value && p.value[0]) || '/placeholder.png';
  return <img src={src} alt="" style={{ width: 40, height: 40, objectFit:'cover', borderRadius:4 }} />;
};
